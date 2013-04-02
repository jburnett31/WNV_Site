(ns wnv-site.test.calculation
  (:require [wnv-site.calculation :refer :all]
            [clojure.test :refer :all]))

(deftest key-to-str
  (is (= (keys->strings {:a "b" :c "d"}) {"a" "b" "c" "d"})))
