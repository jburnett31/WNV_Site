// Generated by CoffeeScript 1.3.3
(function() {
  var AboutPage, arcgis_server, basemap, completedModelsMode, connectButtons, countyOutline, data2011, displayLayer, flayer, getRasterData, googAnim, historicalMode, imgLayer, initLayers, initLegend, initSlider, init_map, inputPane, inputp, legend, link, list, map, modelingMode, modelingWidget, newsLayer, newsMode, predictionLayer, predictionLayer2, raster_data, rateLayer, showSlider, state_list, testImage, timeSlider, _i, _len, _ref;

  _ref = ["esri.map", "esri.layers.FeatureLayer", "modules.RasterLayer", "esri.dijit.TimeSlider", "esri.dijit.Legend", "dojo.dom-construct", "dijit.form.Select", "esri.layers.MapImageLayer"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    link = _ref[_i];
    dojo.require(link);
  }

  arcgis_server = "http://winlidar-xen.geog.uni.edu";

  map = void 0;

  basemap = void 0;

  googAnim = void 0;

  newsLayer = void 0;

  countyOutline = void 0;

  predictionLayer = void 0;

  predictionLayer2 = void 0;

  data2011 = void 0;

  flayer = void 0;

  rateLayer = void 0;

  imgLayer = void 0;

  timeSlider = void 0;

  legend = void 0;

  raster_data = void 0;

  inputp = void 0;

  state_list = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

  init_map = function() {
    var initExtent, layers;
    console.log("Initializing map");
    initExtent = new esri.geometry.Extent({
      "xmin": -132,
      "ymin": 24,
      "xmax": -60,
      "ymax": 50,
      "spatialReference": {
        "wkid": 4326
      }
    });
    map = new esri.Map("map", {
      extent: esri.geometry.geographicToWebMercator(initExtent)
    });
    basemap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer");
    layers = [];
    layers.push(basemap);
    dojo.connect(basemap, 'onLoad', function() {
      return console.log("Basemap loaded");
    });
    map.addLayers(layers);
    if (!timeSlider) {
      timeSlider = new esri.dijit.TimeSlider({
        style: "width: 1000px"
      }, dojo.byId("timeSliderDiv"));
    }
    initLayers();
    connectButtons();
    dojo.connect(map, 'onLayersAddResult', function() {
      return historicalMode(true);
    });
    return dojo.connect(map, 'onLoad', function(theMap) {
      dojo.connect(dojo.byId('map'), 'resize', map, map.resize);
      return dojo.connect(window, 'resize', map, map.resize);
    });
  };

  initLayers = function() {
    var layer, layers, _j, _len1, _results;
    layers = [];
    predictionLayer = new esri.layers.ArcGISDynamicMapServiceLayer(arcgis_server + "/ArcGIS/rest/services/CompletedModels/MapServer");
    predictionLayer.setVisibleLayers([1]);
    layers.push(predictionLayer);
    predictionLayer2 = new esri.layers.ArcGISDynamicMapServiceLayer(arcgis_server + "/ArcGIS/rest/services/CompletedModels/MapServer");
    predictionLayer2.setVisibleLayers([0]);
    layers.push(predictionLayer2);
    data2011 = new esri.layers.FeatureLayer(arcgis_server + "/ArcGIS/rest/services/WNVData/MapServer/0", {
      mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
      outFields: ["Cases_2011"]
    });
    layers.push(data2011);
    flayer = new esri.layers.ArcGISDynamicMapServiceLayer(arcgis_server + "/ArcGIS/rest/services/WNVData/MapServer");
    flayer.setVisibleLayers([2]);
    flayer.tUnits = 'esriTimeUnitsMonths';
    flayer.legendLabel = "Number of Cases";
    layers.push(flayer);
    rateLayer = new esri.layers.ArcGISDynamicMapServiceLayer(arcgis_server + "/ArcGIS/rest/services/WNVData/MapServer");
    rateLayer.setVisibleLayers([1]);
    rateLayer.tUnits = 'esriTimeUnitsMonths';
    rateLayer.legendLabel = "WNV Rate per 100,000 People";
    layers.push(rateLayer);
    googAnim = new esri.layers.ArcGISDynamicMapServiceLayer(arcgis_server + "/ArcGIS/rest/services/GoogleWNVAnimation/MapServer");
    googAnim.setVisibleLayers([0]);
    googAnim.tUnits = 'esriTimeUnitsDays';
    googAnim.legendLabel = "WNV News Reports";
    layers.push(googAnim);
    imgLayer = void 0;
    map.addLayers(layers);
    _results = [];
    for (_j = 0, _len1 = layers.length; _j < _len1; _j++) {
      layer = layers[_j];
      _results.push(dojo.connect(layer, 'onLoad', function(layer) {
        return layer.hide();
      }));
    }
    return _results;
  };

  initSlider = function(layer, duration) {
    var labels, timeExtent;
    if (layer.timeInfo === void 0) {
      return;
    }
    if (timeSlider.playing) {
      timeSlider.pause();
    }
    if (layer.loaded) {
      console.log("Initializing time slider");
      map.setTimeSlider(void 0);
      map.setTimeSlider(timeSlider);
      timeExtent = layer.timeInfo.timeExtent;
      console.log("Layer change");
      console.log(timeExtent);
      timeSlider.setThumbCount(1);
      timeSlider.createTimeStopsByTimeInterval(timeExtent, 1, duration);
      timeSlider.singleThumbAsTimeInstant(true);
      timeSlider.setThumbIndexes([0]);
      timeSlider.setThumbMovingRate(2500);
      timeSlider.startup();
      labels = dojo.map(timeSlider.timeStops, function(timeStop, i) {
        if (duration === "esriTimeUnitsDays") {
          if (timeStop.getDate() % 7 === 0) {
            return timeStop.getMonth() + 1 + "-" + timeStop.getDate();
          } else {
            return "";
          }
        } else {
          if (timeStop.getMonth() === 0) {
            return timeStop.getFullYear();
          } else {
            return "";
          }
        }
      });
      timeSlider.setLabels(labels);
      return dojo.connect(timeSlider, "onTimeExtentChange", function(timeExtent) {
        var dateArr, endValString;
        endValString = timeExtent.endTime.toString();
        dateArr = endValString.split(" ");
        return dojo.byId("daterange").innerHTML = "<i>" + dateArr[1] + " " + dateArr[2] + " " + dateArr[3] + "</i>";
      });
    } else {
      return dojo.connect(layer, 'onLoad', function() {
        return initSlider(layer, duration);
      });
    }
  };

  initLegend = function(layer) {
    var layerInfo;
    if (layer.loaded) {
      console.log(layer);
      layerInfo = {
        layer: layer,
        title: layer.legendLabel
      };
      console.log("Legend info:");
      console.log(layerInfo);
      if (legend) {
        return legend.refresh([layerInfo]);
      } else {
        legend = new esri.dijit.Legend({
          map: map,
          layerInfos: [layerInfo]
        }, "legendDiv");
        return legend.startup();
      }
    } else {
      return dojo.connect(layer, 'onLoad', function() {
        return initLegend(layer);
      });
    }
  };

  connectButtons = function() {
    dojo.connect(dojo.byId("rateButton"), 'click', function(evt) {
      displayLayer(rateLayer);
      if (flayer.visible) {
        flayer.hide();
      }
      dojo.byId("rateButton").disabled = true;
      return dojo.byId("casesButton").disabled = false;
    });
    dojo.connect(dojo.byId("casesButton"), 'click', function(evt) {
      displayLayer(flayer);
      if (rateLayer.visible) {
        rateLayer.hide();
      }
      dojo.byId("casesButton").disabled = true;
      return dojo.byId("rateButton").disabled = false;
    });
    dojo.connect(dojo.byId("historical"), 'click', function(evt) {
      return historicalMode(true);
    });
    dojo.connect(dojo.byId("modeling"), 'click', function(evt) {
      return modelingMode(true);
    });
    dojo.connect(dojo.byId("news"), 'click', function(evt) {
      return newsMode(true);
    });
    dojo.connect(dojo.byId("completed"), 'click', function(evt) {
      return completedModelsMode(true);
    });
    return dojo.connect(dojo.byId("about"), 'click', function(evt) {
      var a;
      return a = new AboutPage('wrapper');
    });
  };

  displayLayer = function(layer) {
    if (layer.loaded) {
      layer.show();
      initSlider(layer, layer.tUnits);
      return initLegend(layer);
    } else {
      return dojo.connect(layer, 'onLoad', function() {
        return displayLayer(layer);
      });
    }
  };

  completedModelsMode = function(bool) {
    if (bool) {
      modelingMode(false);
      newsMode(false);
      historicalMode(false);
      dojo.byId("completed").disabled = true;
      displayLayer(predictionLayer2);
      return displayLayer(predictionLayer);
    } else {
      dojo.byId("completed").disabled = false;
      predictionLayer.hide();
      return predictionLayer2.hide();
    }
  };

  showSlider = function(bool) {
    var drange, sli;
    sli = dojo.byId("timeSliderDiv");
    drange = dojo.byId("daterange");
    if (bool) {
      sli.style.display = "block";
      return drange.style.display = "block";
    } else {
      sli.style.display = "none";
      return drange.style.display = "none";
    }
  };

  historicalMode = function(bool) {
    var historical;
    if (bool) {
      modelingMode(false);
      newsMode(false);
      completedModelsMode(false);
      historical = dojo.byId("historical");
      historical.disabled = true;
      displayLayer(flayer);
      showSlider(true);
      dojo.byId("layers").style.display = "block";
      dojo.byId("casesButton").disabled = true;
      dojo.byId("rateButton").disabled = false;
      return dojo.byId("scope").style.display = "none";
    } else {
      dojo.byId("historical").disabled = false;
      dojo.byId("casesButton").disabled = true;
      dojo.byId("rateButton").disabled = true;
      flayer.hide();
      rateLayer.hide();
      showSlider(false);
      return dojo.byId("layers").style.display = "none";
    }
  };

  modelingMode = function(bool) {
    var iowa, modeling, national;
    modeling = dojo.byId("modeling");
    national = dojo.byId("national");
    iowa = dojo.byId("iowa");
    if (bool) {
      historicalMode(false);
      newsMode(false);
      completedModelsMode(false);
      modeling.disabled = true;
      national.disabled = true;
      iowa.disabled = false;
      return inputp = new inputPane('test', 'wrapper');
    } else {
      modeling.disabled = false;
      if (inputp !== null && inputp !== void 0) {
        inputp.destroy();
      }
      return dojo.byId("scope").style.display = "none";
    }
  };

  newsMode = function(bool) {
    var news;
    news = dojo.byId("news");
    if (bool) {
      modelingMode(false);
      historicalMode(false);
      completedModelsMode(false);
      news.disabled = true;
      displayLayer(googAnim);
      return showSlider(true);
    } else {
      news.disabled = false;
      googAnim.hide();
      return showSlider(false);
    }
  };

  getRasterData = function() {
    return dojo.xhrGet({
      url: "westnile/rasters",
      handleAs: "json",
      load: function(dataz) {
        var i;
        raster_data = dataz;
        raster_data = (function() {
          var _j, _ref1, _results;
          _results = [];
          for (i = _j = 0, _ref1 = raster_data.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            raster_data[i].extent = JSON.parse(raster_data[i].extent);
            if (!raster_data[i].extent.spatialReference) {
              raster_data[i].extent['spatialReference'] = {
                'wkid': 102100
              };
            }
            _results.push(raster_data[i]);
          }
          return _results;
        })();
        return console.log("raster data got");
      }
    });
  };

  modelingWidget = function() {
    var _container;
    _container = void 0;
    return {
      create: function() {
        var closeButton, dropdown, header, label, submitButton;
        _container = dojo.create("div", {
          className: "modelingWidgetContainer"
        });
        header = dojo.create("div", {
          className: "modelingWidgetHeader"
        }, _container);
        closeButton = dojo.create("img", {
          className: "modelingWidgetCloseButton",
          click: this.destroy
        }, header);
        label = dojo.create("span", {
          className: "modelingWidgetLabel"
        }, _container);
        dropdown = new dijit.form.Select({
          name: 'select1',
          options: this.get_options()
        }).placeAt(_container);
        submitButton = dojo.create("button", {
          className: "modelingWidgetSubmitButton",
          value: "Submit"
        }, _container);
        dojo.connect(submitButton, 'click', function() {
          var ext, idx, mi, mil;
          idx = dropdown.selectedIndex;
          mil = new esri.layers.MapImageLayer({
            'id': raster_data[idx].name
          });
          map.addLayer(mil);
          ext = raster_data[idx].extent;
          mi = new esri.layers.MapImage({
            'extent': ext,
            'href': "http://linlidar-xen.geog.uni.edu/raster/" + raster_data[idx].id + ".jpg"
          });
          return mil.addImage(mi);
        });
        return dojo.place(_container, "wrapper", "last");
      },
      destroy: function() {
        return dojo.destroy(_container);
      },
      get_options: function() {
        var i, options, _j, _ref1;
        console.log(raster_data);
        options = [];
        for (i = _j = 0, _ref1 = raster_data.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          console.log(i);
          options.push({
            label: raster_data[i].name,
            value: i
          });
        }
        return options;
      }
    };
  };

  testImage = function() {
    var mi, mil;
    mil = new esri.layers.MapImageLayer({
      'id': '2012-0808-test'
    });
    map.addLayer(mil);
    console.log(raster_data);
    mi = new esri.layers.MapImage({
      'extent': raster_data[3].extent,
      'href': 'http://linlidar-xen.geog.uni.edu/rasters/2012.0808.test2.jpg'
    });
    return mil.addImage(mi);
  };

  AboutPage = (function() {

    function AboutPage(container) {
      var closeButton, p1, p2, p3, p4, p5, p6, p7, _container;
      this.container = container;
      _container = dojo.create("div", {
        className: "about_pane"
      });
      closeButton = dojo.create("img", {
        src: 'img/close.png',
        className: 'about_close'
      });
      dojo.place(closeButton, _container, 'first');
      p1 = dojo.create("p", {
        className: "about_text",
        innerHTML: "This website is the result of research being carried out by a coalition of researchers from the University of Northern Iowa GeoInformatics Training, Research, Education, and Extension (GeoTREE) Center, the Iowa State University Medical Entomology Laboratory, and Purdue Terrestrial Observatory. The research focuses on the ecology of vector-borne diseases with an emphasis on West Nile virus (WNV). This research is supported through funding from the National Geospatial-Intelligence Agency (NGA) University Research Initiative program (Award No. HM1582-10-1-0010).<hr />"
      }, _container);
      p2 = dojo.create("p", {
        className: "about_text",
        innerHTML: "This website uses GIS Server technology to convey a variety of information about the spatial and temporal occurrence of West Nile Virus. The data concerning the actual occurrence of WNV comes either directly from the the Division of Vector-Borne Diseases in the National Center for Infectious Diseases at the Centers for Disease Control and Prevention or from the website http://westnilemaps.usgs.gov/.<hr />"
      }, _container);
      p3 = dojo.create("p", {
        className: "about_text",
        innerHTML: "The Past Data tab allows the user to visualize through time the number of WNV cases or WNV rates by count from 1999 thru 2009.<hr />"
      }, _container);
      p4 = dojo.create("p", {
        className: "about_text",
        innerHTML: "The Completed Model tab demonstrates the result of a Weighted Linear Combination (WLC) model that was developed for estimating WNV risk using climate, landscape, and demographic data. The specific results shown are the result of running models for eight separate regions and then combining them into a final output. The high/low WNV incidence shown is the result of compiling WNV cases from http://westnilemaps.usgs.gov/ and calculating a high or low incidence for each of the eight regions based on if the disease incidence was spread evenly throughout the region. This model is just for demonstration purposes and is not offered as a definitive risk prediction effort.<hr />"
      }, _container);
      p5 = dojo.create("p", {
        className: "about_text",
        innerHTML: "The Modeling tab is meant to allow a user to choose a state or region and to construct their own WLC model based on a range of compiled climate, landscape, and demographic data.The Google News tab demonstrates a visualization of digitized and georeferenced data points Google News alerts regarding WNV.<hr />"
      }, _container);
      p6 = dojo.create("p", {
        className: "about_text",
        innerHTML: "Acknowledgements: We would like to thank the NGA for funding, the Oregon State University PRISM group (http://www.prism.oregonstate.edu/) for the use of climatic data, and CDC for provision of WNV data.<hr />"
      }, _container);
      p7 = dojo.create("p", {
        className: "about_text",
        innerHTML: "Please contact John DeGroote at john.degroote@uni.edu if you have any questions."
      }, _container);
      dojo.place(_container, this.container, 'last');
      dojo.connect(closeButton, 'onclick', function(evt) {
        return dojo.destroy(_container);
      });
    }

    return AboutPage;

  })();

  inputPane = (function() {
    var addItem, sendValues, state;

    state = void 0;

    function inputPane(name, outer) {
      var closeButton, container, display_item, display_list, dropdown, header, item_box, pane, submitButton, _j, _len1;
      this.name = name;
      this.outer = outer;
      display_list = [];
      for (_j = 0, _len1 = state_list.length; _j < _len1; _j++) {
        state = state_list[_j];
        display_item = {};
        display_item.label = state;
        display_item.value = state;
        display_list.push(display_item);
      }
      pane = dojo.create("div", {
        className: "input_pane shadow",
        name: this.name
      });
      this.pane = pane;
      header = dojo.create("div", {
        className: 'input_pane_header',
        name: this.name + "_header"
      }, this.pane);
      container = dojo.create("div", {
        className: 'input_pane_container',
        name: this.name + "_container"
      }, this.pane);
      closeButton = dojo.create("img", {
        src: 'img/close.png',
        className: 'input_pane_close',
        name: this.name + "_close_button"
      }, container);
      dropdown = new dijit.form.Select({
        name: this.name + "_state_select",
        className: 'input_pane_select',
        options: display_list
      }).placeAt(container);
      submitButton = dojo.create("button", {
        className: "input_pane_submit",
        innerHTML: "Submit"
      }, container);
      dojo.create("br", {}, this.pane);
      item_box = dojo.create("div", {
        className: "input_item_box",
        name: this.name + "_input_item_box"
      }, this.pane);
      dojo.place(this.pane, this.outer, 'last');
      dojo.connect(closeButton, 'onclick', function() {
        return dojo.destroy(pane);
      });
      dojo.connect(dropdown, 'onChange', function(st) {
        var node, _k, _len2, _ref1;
        state = st;
        _ref1 = dojo.query(".input_item");
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          node = _ref1[_k];
          dojo.destroy(node);
        }
        return dojo.xhrGet({
          url: "westnile/featclass",
          handleAs: "json",
          load: function(fields) {
            var field, _l, _len3, _results;
            if (fields === null) {
              return;
            }
            _results = [];
            for (_l = 0, _len3 = fields.length; _l < _len3; _l++) {
              field = fields[_l];
              _results.push(addItem(field, list[field], item_box));
            }
            return _results;
          }
        });
      });
      dojo.connect(submitButton, 'onclick', function() {
        return sendValues();
      });
    }

    addItem = function(name, display, pane) {
      var label, label3, weight, _container;
      _container = dojo.create("div", {
        name: name,
        className: "input_item"
      }, pane);
      label = dojo.create("div", {
        name: name + "_label",
        className: 'input_item_name',
        innerHTML: display
      }, _container);
      weight = dojo.create("input", {
        type: 'text',
        name: name + "_weight",
        className: 'input_item_text',
        value: '0'
      }, _container);
      return label3 = dojo.create("div", {
        name: name + "_label3",
        className: 'input_item_label',
        innerHTML: "weight"
      }, _container);
    };

    inputPane.prototype.destroy = function() {
      if (this.pane) {
        return dojo.destroy(this.pane);
      }
    };

    sendValues = function() {
      var node, outData, tmp, _j, _len1, _ref1;
      console.log(state);
      if (!state) {
        return;
      }
      outData = {};
      outData.state = state;
      outData.params = [];
      _ref1 = dojo.query('.input_item');
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        tmp = {};
        tmp[node.getAttribute('name')] = node.childNodes[1].value;
        outData.params.push(tmp);
      }
      console.log(outData);
      console.log(dojo.toJson(outData));
      return dojo.rawXhrPost({
        url: "westnile/processing",
        postData: dojo.toJson(outData),
        handleAs: 'json',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        load: function(data) {}
      });
    };

    return inputPane;

  })();

  dojo.addOnLoad(init_map);

  window.Map = {
    map: map,
    Initialize: init_map,
    InitSlider: initSlider,
    InitLegend: initLegend,
    testImage: testImage,
    modelingWidget: modelingWidget,
    InputPane: inputPane
  };

  list = {
    "MEAN_elev": "Mean Elevation",
    "IrrPerc": "Irrigation Percentage",
    "MEDAGE2000": "Median Age",
    "MedIncome": "Median Income",
    "AveDrnCls": "Average Drainage Class",
    "All_Forest": "Forested Area",
    "All_Wetlan": "Wetlands",
    "prec01_06": "Precipitation Jan-June",
    "precPrYr": "Precipitation Previous Year",
    "tmaxPrYr": "Ave Max Temp Previous Year",
    "tmax01_06": "Ave Max Temp Jan-June"
  };

}).call(this);
