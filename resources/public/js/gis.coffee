for link in ["esri.map", "esri.layers.FeatureLayer", "modules.RasterLayer", "esri.dijit.TimeSlider", "esri.dijit.Legend", "dojo.dom-construct", "dijit.form.Select", "esri.layers.MapImageLayer"]
        dojo.require link

arcgis_server = "http://winlidar-xen.geog.uni.edu"
map = undefined
basemap = undefined
#basemap2 = undefined
#googBasemap = undefined
googAnim = undefined
newsLayer = undefined
countyOutline = undefined
predictionLayer = undefined
predictionLayer2 = undefined
data2011 = undefined
flayer = undefined
rateLayer = undefined
imgLayer = undefined
timeSlider = undefined
legend = undefined
raster_data = undefined
inputp = undefined
state_list = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas',
        'California', 'Colorado', 'Connecticut', 'Delaware',
        'Florida', 'Georgia', 'Hawaii', 'Idaho',
        'Illinois', 'Indiana', 'Iowa', 'Kansas',
        'Kentucky', 'Louisiana', 'Maine', 'Maryland',
        'Massachusetts', 'Michigan', 'Minnesota',
        'Mississippi', 'Missouri', 'Montana', 'Nebraska',
        'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina',
        'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
        'Pennsylvania', 'Rhode Island', 'South Carolina',
        'South Dakota', 'Tennessee', 'Texas', 'Utah',
        'Vermont', 'Virginia', 'Washington',
        'West Virginia', 'Wisconsin', 'Wyoming'
        ]

init_map = () ->
        console.log "Initializing map"
        initExtent = new esri.geometry.Extent({"xmin":-132,"ymin":24,"xmax":-60,"ymax":50,"spatialReference":{"wkid":4326}})
        map = new esri.Map("map", {
                extent: esri.geometry.geographicToWebMercator(initExtent)
        })
        basemap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer")
        layers = []
        layers.push basemap
        dojo.connect basemap, 'onLoad', () ->
                console.log "Basemap loaded"
#        countyOutline = new esri.layers.ArcGISDynamicMapServiceLayer(arcgis_server + "/ArcGIS/rest/services/CountyOutline/MapServer")
#        layers.push countyOutline
        map.addLayers layers
        timeSlider = new esri.dijit.TimeSlider({style: "width: 1000px"}, dojo.byId("timeSliderDiv")) unless timeSlider
#        getRasterData()
        initLayers()
        connectButtons()
        dojo.connect map, 'onLayersAddResult', () ->
                historicalMode(true)
        dojo.connect map, 'onLoad', (theMap) ->
                dojo.connect(dojo.byId('map'), 'resize', map, map.resize)
                dojo.connect(window, 'resize', map, map.resize)

initLayers = () ->
        layers = []
#        predictionLayer = new esri.layers.FeatureLayer arcgis_server + "/ArcGIS/rest/services/WNVData/MapServer/3", {
#                mode: esri.layers.FeatureLayer.MODE_ONDEMAND
#                outFields: ["Score2"]}
        predictionLayer = new esri.layers.ArcGISDynamicMapServiceLayer arcgis_server + "/ArcGIS/rest/services/CompletedModels/MapServer"
        predictionLayer.setVisibleLayers([1])
        layers.push predictionLayer
        predictionLayer2 = new esri.layers.ArcGISDynamicMapServiceLayer arcgis_server + "/ArcGIS/rest/services/CompletedModels/MapServer"
        predictionLayer2.setVisibleLayers([0])
        layers.push predictionLayer2
        data2011 = new esri.layers.FeatureLayer arcgis_server + "/ArcGIS/rest/services/WNVData/MapServer/0", {
                mode: esri.layers.FeatureLayer.MODE_SNAPSHOT
                outFields: ["Cases_2011"]}
        layers.push data2011
        flayer = new esri.layers.ArcGISDynamicMapServiceLayer arcgis_server + "/ArcGIS/rest/services/WNVData/MapServer"
        flayer.setVisibleLayers([2])
        flayer.tUnits = 'esriTimeUnitsMonths'
        flayer.legendLabel = "Number of Cases"
        layers.push flayer
        rateLayer = new esri.layers.ArcGISDynamicMapServiceLayer arcgis_server + "/ArcGIS/rest/services/WNVData/MapServer"
        rateLayer.setVisibleLayers([1])
        rateLayer.tUnits = 'esriTimeUnitsMonths'
        rateLayer.legendLabel = "WNV Rate per 100,000 People"
        layers.push rateLayer
        googAnim = new esri.layers.ArcGISDynamicMapServiceLayer arcgis_server + "/ArcGIS/rest/services/GoogleWNVAnimation/MapServer"
        googAnim.setVisibleLayers([0])
        googAnim.tUnits = 'esriTimeUnitsDays'
        googAnim.legendLabel = "WNV News Reports"
        layers.push googAnim
        imgLayer = undefined
        map.addLayers layers
        for layer in layers
                dojo.connect layer, 'onLoad', (layer) ->
                        layer.hide()

initSlider = (layer, duration) ->
        return if layer.timeInfo == undefined
        if timeSlider.playing
                timeSlider.pause()
        if layer.loaded
                console.log "Initializing time slider"
                map.setTimeSlider undefined
                map.setTimeSlider timeSlider
                timeExtent = layer.timeInfo.timeExtent
                console.log "Layer change"
                console.log timeExtent
                timeSlider.setThumbCount(1)
                timeSlider.createTimeStopsByTimeInterval(timeExtent,1, duration)
                timeSlider.singleThumbAsTimeInstant(true)
                timeSlider.setThumbIndexes([0])
                timeSlider.setThumbMovingRate(2500)
                timeSlider.startup()

                labels = dojo.map timeSlider.timeStops, (timeStop, i) ->
                        if duration == "esriTimeUnitsDays"
                                if timeStop.getDate() % 7 == 0
                                        return timeStop.getMonth()+1 + "-" + timeStop.getDate()
                                else
                                        return ""
                        else
                                if timeStop.getMonth() == 0
                                        return timeStop.getFullYear()
                                else return ""
                timeSlider.setLabels(labels)
                dojo.connect timeSlider, "onTimeExtentChange", (timeExtent) ->
                        endValString = timeExtent.endTime.toString()
                        dateArr = endValString.split(" ")
                        dojo.byId("daterange").innerHTML = "<i>#{dateArr[1]} #{dateArr[2]} #{dateArr[3]}</i>"
        else
                dojo.connect layer, 'onLoad', () ->
                        initSlider layer, duration

initLegend = (layer) ->
        if layer.loaded
                console.log layer
                layerInfo = {layer: layer, title: layer.legendLabel}
                console.log "Legend info:"
                console.log layerInfo
                if legend
                        legend.refresh [layerInfo]
                else
                        legend = new esri.dijit.Legend({
                                map: map,
                                layerInfos: [layerInfo]}, "legendDiv")
                        legend.startup()
        else
                dojo.connect layer, 'onLoad', () ->
                        initLegend layer

connectButtons = () ->
        dojo.connect dojo.byId("rateButton"), 'click', (evt) ->
                displayLayer rateLayer
                flayer.hide() if flayer.visible
                dojo.byId("rateButton").disabled = true
                dojo.byId("casesButton").disabled = false

        dojo.connect dojo.byId("casesButton"), 'click', (evt) ->
                displayLayer flayer
                rateLayer.hide() if rateLayer.visible
                dojo.byId("casesButton").disabled = true
                dojo.byId("rateButton").disabled = false
        dojo.connect dojo.byId("historical"), 'click', (evt) ->
                historicalMode(true)
        dojo.connect dojo.byId("modeling"), 'click', (evt) ->
                modelingMode(true)
        dojo.connect dojo.byId("news"), 'click', (evt) ->
                newsMode(true)
        dojo.connect dojo.byId("completed"), 'click', (evt) ->
                completedModelsMode(true)
        dojo.connect dojo.byId("about"), 'click', (evt) ->
                a = new AboutPage('wrapper')

displayLayer = (layer) ->
        if (layer.loaded)
                layer.show()
                initSlider layer, layer.tUnits
                initLegend layer
        else
                dojo.connect layer, 'onLoad', () ->
                        displayLayer layer

completedModelsMode = (bool) ->
        if bool
                modelingMode(false)
                newsMode(false)
                historicalMode(false)
                dojo.byId("completed").disabled = true
                displayLayer(predictionLayer2)
                displayLayer(predictionLayer)
        else
                dojo.byId("completed").disabled = false
                predictionLayer.hide()
                predictionLayer2.hide()

showSlider = (bool) ->
        sli = dojo.byId("timeSliderDiv")
        drange = dojo.byId("daterange")
        if bool
                sli.style.display = "block"
                drange.style.display = "block"
        else
                sli.style.display = "none"
                drange.style.display = "none"

historicalMode = (bool) ->
        if bool
                modelingMode(false)
                newsMode(false)
                completedModelsMode(false)
                historical = dojo.byId("historical")
                historical.disabled = true
                displayLayer(flayer)
                showSlider(true)
                dojo.byId("layers").style.display = "block"
                dojo.byId("casesButton").disabled = true
                dojo.byId("rateButton").disabled = false

                dojo.byId("scope").style.display = "none"
        else
                dojo.byId("historical").disabled = false
                dojo.byId("casesButton").disabled = true
                dojo.byId("rateButton").disabled = true
                flayer.hide()
                rateLayer.hide()
                showSlider(false)
                dojo.byId("layers").style.display = "none"

modelingMode = (bool) ->
        modeling = dojo.byId("modeling")
        national = dojo.byId("national")
        iowa = dojo.byId("iowa")
        if bool
                historicalMode(false)
                newsMode(false)
                completedModelsMode(false)
                modeling.disabled = true
                national.disabled = true
                iowa.disabled = false

                inputp = new inputPane('test', 'wrapper')
        else
                modeling.disabled = false
                if inputp != null && inputp != undefined
                        inputp.destroy()

                dojo.byId("scope").style.display = "none"

newsMode = (bool) ->
        news = dojo.byId("news")
        if bool
                modelingMode(false)
                historicalMode(false)
                completedModelsMode(false)
                news.disabled = true
                displayLayer(googAnim)
                showSlider(true)
        else
                news.disabled = false
                googAnim.hide()
                showSlider(false)

getRasterData = () ->
        dojo.xhrGet
                url: "westnile/rasters"
                handleAs: "json"
                load: (dataz) ->
                        raster_data = dataz
                        raster_data = for i in [0...raster_data.length]
                                raster_data[i].extent = JSON.parse raster_data[i].extent
                                raster_data[i].extent['spatialReference'] = { 'wkid': 102100 } unless raster_data[i].extent.spatialReference
                                raster_data[i]
                        console.log "raster data got"

modelingWidget = () ->
        _container = undefined
        create: () ->
                _container = dojo.create("div",
                        {className: "modelingWidgetContainer"})
                header = dojo.create("div",
                        {className: "modelingWidgetHeader"}, _container)
                closeButton = dojo.create("img",{
                        className: "modelingWidgetCloseButton"
                        click: this.destroy}, header)
                label = dojo.create("span",
                        {className: "modelingWidgetLabel"}, _container)
                dropdown = new dijit.form.Select(
                        {name: 'select1',
                        options: this.get_options()}).placeAt(_container)
                submitButton = dojo.create("button",{
                        className: "modelingWidgetSubmitButton",
                        value: "Submit"}, _container)
                dojo.connect submitButton, 'click', () ->
                        idx = dropdown.selectedIndex
                        mil = new esri.layers.MapImageLayer({
                                'id': raster_data[idx].name})
                        map.addLayer(mil)
                        ext = raster_data[idx].extent
                        #ext.spatialReference = {'wkid': 102003}
                        mi = new esri.layers.MapImage({
                                'extent': ext,
                                'href': "http://linlidar-xen.geog.uni.edu/raster/#{raster_data[idx].id}.jpg"})
                        mil.addImage(mi)
                dojo.place(_container, "wrapper", "last")
        destroy: () ->
                dojo.destroy(_container)
        get_options: () ->
                console.log raster_data
                options = []
                for i in [0 ... raster_data.length]
                        console.log i
                        options.push {label: raster_data[i].name, value: i}
                options

testImage = () ->
        mil = new esri.layers.MapImageLayer({
                'id': '2012-0808-test'})
        map.addLayer mil
        console.log raster_data
        mi = new esri.layers.MapImage({
                'extent': raster_data[3].extent
                'href': 'http://linlidar-xen.geog.uni.edu/rasters/2012.0808.test2.jpg'})
        mil.addImage mi

class AboutPage
        constructor: (@container) ->
                _container = dojo.create("div",{
                        className: "about_pane"})
                closeButton = dojo.create("img",{
                        src: 'img/close.png',
                        className: 'about_close'})
                dojo.place(closeButton, _container, 'first')
                p1 = dojo.create("p",{
                        className: "about_text",
                        innerHTML: "This website is the result of research being carried out by a coalition of researchers from the University of Northern Iowa GeoInformatics Training, Research, Education, and Extension (GeoTREE) Center, the Iowa State University Medical Entomology Laboratory, and Purdue Terrestrial Observatory. The research focuses on the ecology of vector-borne diseases with an emphasis on West Nile virus (WNV). This research is supported through funding from the National Geospatial-Intelligence Agency (NGA) University Research Initiative program (Award No. HM1582-10-1-0010).<hr />"}, _container)

                p2 = dojo.create("p",{
                        className: "about_text",
                        innerHTML: "This website uses GIS Server technology to convey a variety of information about the spatial and temporal occurrence of West Nile Virus. The data concerning the actual occurrence of WNV comes either directly from the the Division of Vector-Borne Diseases in the National Center for Infectious Diseases at the Centers for Disease Control and Prevention or from the website http://westnilemaps.usgs.gov/.<hr />"}, _container)
                p3 = dojo.create("p",{
                        className: "about_text",
                        innerHTML: "The Past Data tab allows the user to visualize through time the number of WNV cases or WNV rates by count from 1999 thru 2009.<hr />"}, _container)

                p4 = dojo.create("p",{
                        className: "about_text",
                        innerHTML: "The Completed Model tab demonstrates the result of a Weighted Linear Combination (WLC) model that was developed for estimating WNV risk using climate, landscape, and demographic data. The specific results shown are the result of running models for eight separate regions and then combining them into a final output. The high/low WNV incidence shown is the result of compiling WNV cases from http://westnilemaps.usgs.gov/ and calculating a high or low incidence for each of the eight regions based on if the disease incidence was spread evenly throughout the region. This model is just for demonstration purposes and is not offered as a definitive risk prediction effort.<hr />"}, _container)

                p5 = dojo.create("p",{
                        className: "about_text",
                        innerHTML: "The Modeling tab is meant to allow a user to choose a state or region and to construct their own WLC model based on a range of compiled climate, landscape, and demographic data.
The Google News tab demonstrates a visualization of digitized and georeferenced data points Google News alerts regarding WNV.<hr />"}, _container)

                p6 = dojo.create("p",{
                        className: "about_text",
                        innerHTML: "Acknowledgements: We would like to thank the NGA for funding, the Oregon State University PRISM group (http://www.prism.oregonstate.edu/) for the use of climatic data, and CDC for provision of WNV data.<hr />"}, _container)

                p7 = dojo.create("p",{
                        className: "about_text",
                        innerHTML: "Please contact John DeGroote at john.degroote@uni.edu if you have any questions."}, _container)

                dojo.place(_container, @container, 'last')
                dojo.connect closeButton, 'onclick', (evt) ->
                        dojo.destroy _container

class inputPane
        state = undefined
        constructor: (@name, @outer) ->
                display_list = []
                for state in state_list
                        display_item = {}
                        display_item.label = state
                        display_item.value = state
                        display_list.push(display_item)
                pane = dojo.create("div",{
                        className: "input_pane shadow",
                        name: @name})
                @pane = pane
                header = dojo.create("div",{
                        className: 'input_pane_header',
                        name: @name + "_header" }, @pane)
                container = dojo.create("div",{
                        className: 'input_pane_container',
                        name: @name + "_container"}, @pane)
                closeButton = dojo.create("img",{
                        src: 'img/close.png',
                        className: 'input_pane_close',
                        name: @name + "_close_button"}, container)
                dropdown = new dijit.form.Select(
                        {name: @name + "_state_select",
                        className: 'input_pane_select',
                        options: display_list}).placeAt(container)
                submitButton = dojo.create("button",{
                        className: "input_pane_submit",
                        innerHTML: "Submit"}, container)
                dojo.create("br",{}, @pane)
                item_box = dojo.create("div",{
                        className: "input_item_box",
                        name: @name + "_input_item_box"}, @pane)
                dojo.place(@pane, @outer, 'last')
                dojo.connect closeButton, 'onclick', () ->
                        dojo.destroy(pane)
                dojo.connect dropdown, 'onChange', (st) ->
                        state = st
                        for node in dojo.query(".input_item")
                                dojo.destroy(node)
                        dojo.xhrGet
                                url: "westnile/featclass"
                                handleAs: "json"
                                load: (fields) ->
                                        return if fields == null
                                        for field in fields
                                                addItem(field, list[field], item_box)

                dojo.connect submitButton, 'onclick', () ->
                        sendValues()

        addItem =  (name, display, pane) ->
                _container = dojo.create("div",{
                        name: name,
                        className: "input_item"}, pane)
                label = dojo.create("div",{
                        name: name + "_label",
                        className: 'input_item_name',
                        innerHTML: display }, _container)
                weight = dojo.create("input",{
                        type: 'text',
                        name: name + "_weight",
                        className: 'input_item_text',
                        value: '0' }, _container)
                label3 = dojo.create("div",{
                        name: name + "_label3",
                        className: 'input_item_label',
                        innerHTML: "weight" }, _container)
#                plus = dojo.create("input",{
#                        type: 'radio',
#                        name: name + "_radio",
#                        className: 'input_item_radio',
#                        value: 2,
#                        innerHTML: "+",
#                        checked: on }, _container)
#                label2 = dojo.create("div",{
#                        name: name + "_label2",
#                        className: 'input_item_label',
#                        innerHTML: "+"}, _container)
#                minus = dojo.create("input",{
#                        type: 'radio',
#                        name: name + "_radio",
#                        className: 'input_item_radio',
#                        value: 1,
#                        innerHTML: "-" }, _container)
#                label1 = dojo.create("div",{
#                        name: name + "_label1",
#                        className: 'input_item_label',
#                        innerHTML: "-" }, _container)

        destroy: ->
                if @pane
                       dojo.destroy(@pane)
        sendValues = () ->
                console.log state
                return if not state
                outData = {}
                outData.state = state
                outData.params = []
                for node in dojo.query('.input_item')
                        tmp = {}
                        tmp[node.getAttribute('name')] = node.childNodes[1].value
#                        tmp.pos = node.childNodes[3].checked
                        outData.params.push tmp
                console.log outData
                console.log dojo.toJson outData
                dojo.rawXhrPost
                        url: "westnile/processing"
                        postData: dojo.toJson outData
                        handleAs: 'json'
                        headers: {"Content-Type": "application/json", "Accept": "application/json"}
                        load: (data) ->
                                #display image

dojo.addOnLoad(init_map)

window.Map =
        map: map
        Initialize: init_map
        InitSlider: initSlider
        InitLegend: initLegend
        testImage: testImage
        modelingWidget: modelingWidget
        InputPane: inputPane


list = {
        "MEAN_elev": "Mean Elevation"
        "IrrPerc": "Irrigation Percentage"
        "MEDAGE2000": "Median Age"
        "MedIncome": "Median Income"
        "AveDrnCls": "Average Drainage Class"
        "All_Forest": "Forested Area"
        "All_Wetlan": "Wetlands"
        "prec01_06": "Precipitation Jan-June"
        "precPrYr": "Precipitation Previous Year"
        "tmaxPrYr": "Ave Max Temp Previous Year"
        "tmax01_06": "Ave Max Temp Jan-June"
        };
