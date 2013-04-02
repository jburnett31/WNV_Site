(ns wnv-site.risk-calculation
  (:use [incanter.stats :only (quantile)])
  (:import [org.geotools.data FileDataStoreFinder DataUtilities DefaultTransaction]
           [org.geotools.data.shapefile ShapefileDataStore ShapefileDataStoreFactory]
           [org.geotools.filter.text.cql2 CQL]
           [org.geotools.feature.simple SimpleFeatureBuilder SimpleFeatureTypeBuilder]
           [org.geotools.data.simple SimpleFeatureCollection]
           [org.geotools.referencing.crs DefaultGeographicCRS]
           [org.geotools.referencing CRS]
           [org.geotools.geometry.jts JTS]
           [com.vividsolutions.jts.geom Coordinate]
           [org.geotools.feature FeatureCollections]
           [org.geotools.xml Encoder]
           [org.geotools.kml KMLConfiguration KML]
           [java.io ByteArrayOutputStream]
           [javax.xml.parsers DocumentBuilderFactory]))

(defn get-scores
  "Returns a 5 bin quantile of the dataset"
  [data]
  (quantile data :probs [0.2 0.4 0.6 0.8 1.0]))

(defn iterator->list
  "Converts a java iterator into a list"
  [iterator]
  (loop [itr iterator acc '()]
    (if (.hasNext itr)
      (recur itr (cons (.next itr) acc))
      (do
        (.close itr)
        acc))))

(defn get-feature-source [file]
  (.getFeatureSource (FileDataStoreFinder/getDataStore file)))

(defn query-features
  "Query format \"Name = 'Iowa'\" returns a list of features"
  [file query]
  (let [feature-source (get-feature-source file)
        filter (CQL/toFilter query)]
    (iterator->list (.. feature-source (getFeatures filter) (features)))))

(quote  (defn create-attribute-map
          ""
          [feature]
          (let [properties (.getProperties feature)]
            (apply merge (cons {"Feature" feature}
                               (map #(hash-map (.toString (.getName %))
                                               (.getValue %)) properties))))))

(quote (defn create-feature-map
         "Features will form a nested hash-map in a list as such:
 {index-key {key val key val ...}
  index-key {key val key val ...} ... }"
         [features index-key]
         (let [temp-list (map create-attribute-map features)]
           (apply merge (map #(hash-map (get % index-key) %) temp-list)))))

(defn create-feature-map
  [features index-key]
  (apply merge (map #(hash-map (.getAttribute % index-key) %) features)))

(quote (defn get-attribute-list
         [feature-map field]
         (for [[k v] feature-map]
           (get v field))))

(defn get-attribute-list
  [features field]
  (for [feature features]
    (.getAttribute feature field)))

(defn get-percentile-scores
  [features field feat-collection]
  (let [percentiles (get-scores (get-attribute-list features field))]))

(defn new-shapefile
  ""
  [path name]
  (let [path (if (= \/ (last path)) path (str path "/"))]
    (clojure.java.io/file (str path name ".shp"))))

(defn attach-suffix
  [name suffix]
  (if (>= (.length suffix) 10)
    (throw (IllegalArgumentException.))
    (.concat (.substring name 0 (min (.length name) (- 10 (.length suffix)))) suffix)))

(quote (defn create-new-features
         [feature fields suffix]
         (apply merge (map #(hash-map (attach-suffix % suffix)
                                      (class (.getAttribute feature %))) fields))))

(defn create-new-features
  [feature fields suffix]
  (for [field fields]
    (list field
          (attach-suffix field suffix)
          (class (.getAttribute feature field)))))

(defn create-schema
  [file new-fields]
  (let [type-builder (SimpleFeatureTypeBuilder.)
        schema (.getSchema (get-feature-source file))]
    (.addAll type-builder (.getAttributeDescriptors schema))
    (doseq [[_ field type] new-fields]
      (.add type-builder field type))
    (.setName type-builder "default")
    (.buildFeatureType type-builder)))

(quote (defn- copy-feature
         [builder]
         (fn [feature]
           (let [_ (.init builder feature)
                 new-feature (.buildFeature builder (.getID feature))]
             new-feature))))

(defn- copy-feature
  [builder]
  (fn [feature]
    (.addAll builder (.getAttributes feature))
    (.buildFeature builder nil)))

(defn copy-features
  "Returns a FeatureCollection of the list of features "
  [features schema]
  (let [builder (SimpleFeatureBuilder. schema)
        copier (copy-feature builder)
        feature-collection (FeatureCollections/newCollection)
        new-features (map copier features)]
    (doseq [feature new-features]
      (.add feature-collection feature))
    feature-collection))

(defn create-data-store
  [new-file schema]
  (let [data-store-factory (ShapefileDataStoreFactory.)
        params {"url" (.. new-file (toURI) (toURL))
                "create spatial index" true}
        data-store (.createNewDataStore data-store-factory params)]
    (doto data-store
      (.createSchema schema)
      (.forceSchemaCRS (.getCoordinateReferenceSystem schema)))))

(defn write-shapefile
  [data-store feature-collection]
  (let [type-name (aget (.getTypeNames data-store) 0)
        feature-source (.getFeatureSource data-store type-name)
        transaction (DefaultTransaction. "create")]
    (try
      (do
        (.addFeatures feature-source feature-collection)
        (.commit transaction))
      (catch Exception e (println "Error writing features"))
      (finally (.close transaction)))
    feature-source))

(defn scorer
  [attribute-list]
  (let [scores (get-scores attribute-list)]
    (fn [attribute]
      (inc (count (filter #(> attribute %) scores))))))

(defn modify-attribute
  [features attribute-name attribute-write function]
  (doseq [feature features]
    (let [new-value (function (.getAttribute feature attribute-name))]
      (.setAttribute feature attribute-write new-value))))

(defn score-attribute
  [features attribute-name attribute-write]
  (let [attr-list (get-attribute-list features attribute-name)
        attr-scorer (scorer attr-list)]
    (modify-attribute features attribute-name attribute-write attr-scorer)))

(defn weight-attribute
  [features attribute-name attribute-write weight]
  (modify-attribute features attribute-name attribute-write (partial * weight)))

(defn- total-per-feature
  [feature fields attribute-write]
  (let [scores (map #(.getAttribute feature %) fields)]
    (.setAttribute feature attribute-write (reduce + scores))))

(defn total-score
  [features fields attribute-write]
  (map #(total-per-feature % fields attribute-write) features))

(defn convert-to-web-mercator
  [schema geom-attribute]
  (fn [feature]
    (let [old-crs (.getCoordinateReferenceSystem schema)
          math-transform (CRS/findMathTransform old-crs DefaultGeographicCRS/WGS84 true)
          geom (.getAttribute feature geom-attribute)]
      (.setAttribute feature geom-attribute (JTS/transform geom math-transform)))))

(defn to-kml
  [filepath feature-collection]
  (let [encoder (Encoder. (KMLConfiguration.))
        out (ByteArrayOutputStream.)]
    (.setIndenting encoder true)
    (.encode encoder feature-collection KML/kml out)
    (spit filepath out)))
