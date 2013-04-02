(ns wnv-site.handler
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [wnv-site.views.common :as common]
            [clojure.data.json :as json]
            [wnv-site.calculation :refer :all]
            [ring.middleware.format-params :refer [wrap-restful-params]]))

(defroutes app-routes
  (GET "/welcome" [] (common/layout [:p "Welcome to wnv-site"]))
  (GET "/map" [] (common/map-layout "Simple Map" [:div#map_canvas]))
  (GET "/westnile" [] (common/gis-layout
                      [:div {:id "title_header"}
                       [:img {:id "uni" :src "img/uni.jpg"}]
                       "NGA URI Project: Real-time Predictive Framework for West Nile Virus"
                       [:img {:id "about"} "About"]]
                      [:div {:id "map"}]
                      [:div {:id "timeSliderDiv"}]
                      [:div {:id "legendWrapper"}
                       [:div {:id "legendDiv"}]]
                      [:div {:id "model"}
                       [:button {:id "historical" :disabled true} "Past Data"]
                       [:button {:id "modeling"} "Modeling"]
                       [:button {:id "completed"} "Completed Models"]
                       [:button {:id "news"} "Google News"]]
                      [:div {:id "layers"}
                       [:button {:id "casesButton" :disabled true} "Cases"]
                       [:button {:id "rateButton"} "Rate"]]
                      [:div {:id "scope"}
                       [:button {:id "national"} "National"]
                       [:button {:id "iowa"} "Iowa"]]
                      [:div {:id "daterange"}]))
  (GET "/westnile/featclass" [] (json/write-str ["MEAN_elev" "IrrPerc" "MEDAGE2000" "MedIncome" "AveDrnCls" "All_Forest" "All_Wetlan" "prec01_06" "precPrYr" "tmaxPrYr" "tmax01_06"]))
  (POST "/westnile/processing" [state params] (do (println state params) (json/write-str (run state params))))
  (route/resources "/")
  (route/not-found "Not Found"))

(quote (POST "/westnile/processing" [state params] (do (prn state params) (json/write-str "received"))))
(quote (def app
         (handler/site app-routes)))

(def app
  (-> app-routes
      (wrap-restful-params)))
