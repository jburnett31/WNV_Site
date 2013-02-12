(ns wnv-site.calculation
  (:require [wnv-risk-calculation.core :refer :all]))

(def web-root "c:\\Inetpub\\wwwroot\\")

(defn create-kml
  [state fields-weights]
  (let [shapefile (clojure.java.io/file "c:\\oct21\\WNV_IndVariables.shp")
        features (query-features shapefile (str "State = '" state "'"))
        new-fields (create-new-features (first features) (keys fields-weights) "_f")
        schema (create-schema shapefile (cons (list "Final" "Final" (class 1.0)) new-fields))
        outname (str state "Current.kml")
        outfile (str web-root "kml\\" outname)
        feature-collection (copy-features features schema)
        features (iterator->list (.features feature-collection))
        converter (convert-to-web-mercator schema "the_geom")]
    (doseq [[field write _] new-fields]
      (do
        (score-attribute features field write)
        (weight-attribute features write write (get fields-weights field))))
    (total-score features (map second new-fields) "Final")
    (score-attribute features "Final" "Final")
    (doseq [feature features]
      (converter feature))
    (to-kml outfile feature-collection)
    outname))
