(ns wnv-site.calculation
  (:require [wnv-site.risk-calculation :refer :all]))

(def web-root "~/wwwkml/")
(def shp-file "~/oct21/WNV_IndVariables.shp")

(defn rework-map
  [params]
  (apply merge
         (for [[k v] params]
           (hash-map k (read-string v)))))

(defn create-kml
  [state fields-weights]
  (let [fields-weights (rework-map fields-weights)
        shapefile (clojure.java.io/file shp-file)
        features (query-features shapefile (str "State = '" state "'"))
        _ (println "Features queried" (str "State = '" state "'"))
        new-fields (try (create-new-features (first features) (keys fields-weights) "_f")
                        (catch Exception e (println "Exception: " e)))
        _ (println new-fields)
        schema (create-schema shapefile (cons (list "Final" "Final" (class 1.0)) new-fields))
        _ (println "Schema created")
        outname (str state "Current.kml")
        outfile (str web-root outname)
        feature-collection (copy-features features schema)
        _ (println "Features copied")
        features (iterator->list (.features feature-collection))
        converter (convert-to-web-mercator schema "the_geom")]
    (doseq [[field write _] new-fields]
      (do
        (score-attribute features field write)
        (weight-attribute features write write (get fields-weights field))))
    (println "Attributes scored and weighted")
    (try (total-score features (map second new-fields) "Final")
         (catch Exception e (println "Exception: " e)))
    (println "Total score computed")
    (try (score-attribute features "Final" "Final")
         (catch Exception e (println "Exception: " e)))
    (println "Final score computed")
    (doseq [feature features]
      (converter feature))
    (println "Geometry converted")
    (to-kml outfile feature-collection)
    outname))

(defn run
  [state fields-weights]
  (let [fields-weights (rework-map fields-weights)
        shapefile (clojure.java.io/file shp-file)
        features (query-features shapefile (str "State = '" state "'"))
        new-fields (try (create-new-features (first features) (keys fields-weights) "_f")
                        (catch Exception e (println "Error creating new fields: " e)))
        schema (try (create-schema shapefile (cons (list "Final" "Final" (class 1.0)) new-fields))
                    (catch Exception e (println "Error creating schema: " e)))
        outname (str state "Current.shp")
        outfile (clojure.java.io/file web-root outname)
        data-store (try (create-data-store outfile schema)
                        (catch Exception e (println "Error creating data store: " e)))
        feature-collection (try (copy-features features schema)
                                (catch Exception e (println "Error copying features: " e)))
        features (iterator->list (.features feature-collection))]
    (for [[field write _] new-fields]
      (do
        (try (score-attribute features field write)
             (catch Exception e (println "Error scoring attributes: " e)))
        (try (weight-attribute features write write (get fields-weights field))
             (catch Exception e (println "Error weighting attributes: " e)))))
    (try (total-score features (map second new-fields) "Final")
         (catch Exception e (println "Error computing total score: " e)))
    (try (score-attribute features "Final" "Final")
         (catch Exception e (println "Error computing final score: " e)))
    (try (write-shapefile data-store feature-collection)
         (catch Exception e (println "Error writing shapefile: " e)))
    outname))
