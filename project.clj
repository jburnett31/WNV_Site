(defproject wnv-site "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.4.0"]
                 [compojure "1.1.5"]
                 [org.clojure/data.json "0.2.0"]
                 [incanter "1.3.0-SNAPSHOT"]
                 [org.geotools/gt-main "8.6"]
                 [org.geotools/gt-shapefile "8.6"]
                 [org.geotools/gt-epsg-hsql "8.6"]
                 [org.geotools/gt-swing "8.6"]
                 [org.geotools/gt-xml "8.6"]
                 [org.geotools/xsd/gt-xsd-kml "8.6"]
                 [org.geotools/gt-opengis "8.6"]
                 [hiccup "1.0.2"]
                 [ring-middleware-format "0.2.4"]]
  :repositories {"sonatype-oss" "http://oss.sonatype.org/content/groups/public/"
                 "osgeo-geotools" "http://download.osgeo.org/webdav/geotools"}
  :plugins [[lein-ring "0.8.2"]]
  :ring {:handler wnv-site.handler/app
         :port 8080}
  :profiles
  {:dev {:dependencies [[ring-mock "0.1.3"]]}})
