(ns wnv-site.views.common
  (:require [hiccup.def :refer [defhtml]]
            [hiccup.page :refer [include-css include-js]]
            [hiccup.element :refer [javascript-tag]]))

(defhtml layout [& content]
  [:head
   [:meta {:name "viewport"
           :content "width=device-width, initial-scale=1.0"}]
   [:title "Compojure Test"]
   (include-css "/css/reset.css")]
  [:body
   [:div#wrapper content]])

(defhtml map-layout [title & content]
  [:head
   [:meta {:name "viewport"
           :content "width=device-width, initial-scale=1.0"}]
   [:title "Compojure Test Map"]
   (include-js "https://maps.googleapis.com/maps/api/js?sensor=false")
   (include-js "js/main.js")
   (include-css "css/map.css")]
  [:body
   [:div#wrapper.shadow
    [:div#header title]
    [:div#content content]]])

(defhtml gis-layout [title & content]
  [:head
   [:meta {:name "viewport"
           :content "width=device-width, initial-scale=1.0"}]
   [:title "Westnile Modeling"]
   (javascript-tag "var djConfig = {parseOnLoad: true};")
   (include-js "http://serverapi.arcgisonline.com/jsapi/arcgis/?v=3.0compact")
   (include-js "js/RasterLayer.js")
   (include-js "js/gis.js")
   (include-css "http://serverapi.arcgisonline.com/jsapi/arcgis/3.0/js/dojo/dijit/themes/claro/claro.css")
   (include-css "css/gis.css")]
  [:body
   [:div#wrapper.shadow
    [:div#header title]
    [:div#content content]]])
