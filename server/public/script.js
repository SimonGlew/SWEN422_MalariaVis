var server = "http://localhost:8000";

var mapData;
var incidence;
var mortality;

var path;
var mapWidth;
var mapHeight;

var files = [server + "/worldmap.json", server + "/api/incidenceRates", server + "/api/mortalityRates"];
var promises = [];

files.forEach(function(url) {
    promises.push(d3.json(url))
});

Promise.all(promises).then(function(values) {
    processData(values);
});

function processData(data){
  mapData = data[0]
  incidence = data[1];
  mortality = data[2]
  for(var i = 0; i < mapData.features.length; i++){
    mapData.features[i].properties.incidenceRates = incidence[mapData.features[i].properties.adm0_a3];
    mapData.features[i].properties.mortalityRates = mortality[mapData.features[i].properties.adm0_a3];
  }
  drawMap()
}

function drawMap(){
  var mapsvg = d3.select("#map");
  //Get svg dimensions
  var mapbbox = mapsvg.node().getBoundingClientRect();
  mapWidth = mapbbox.width;
  mapHeight = mapbbox.height;
  var margin = 5;

  //Project map to fit in svg
  var masterProject = d3.geoMercator();
  masterProject.fitExtent([[margin, margin], [mapWidth, mapHeight]], mapData);
  path = d3.geoPath().projection(masterProject);

  //TODO: rethink this
  var zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed)

  function zoomed(){
    var t = [d3.event.transform.x,d3.event.transform.y];
    var s = d3.event.transform.k;
    var h = 0;

    t[0] = Math.min(
      (mapWidth/mapHeight)  * (s - 1),
      Math.max( mapWidth * (1 - s), t[0] )
    );

    t[1] = Math.min(
      h * (s - 1) + h * s,
      Math.max(mapHeight  * (1 - s) - h * s, t[1])
    );
    mapsvg.select(".worldmap").selectAll("path")
      .attr("transform", "translate(" + t + ")scale(" + s + ")");
  }

  //Rectangle mouse lister for handling dragging/zooming
  mapsvg.append("rect")
    .attr("id", "mouselistener")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .style("opacity", 0)

  mapsvg.call(zoom)


  //Draw countries
  mapsvg.append("g")
   .attr("class", "worldmap")
   .selectAll("path")
   .data(mapData.features)
   .enter()
   .append("path")
     .attr("d", path)
     .attr("class", "mapfeature")
     .attr("stroke-width", 0.5)
     .attr("fill", "#FFF")
     .attr("stroke", "#777")
     .attr("pointer-events", "all")
     .style("opacity", 0.8)
     .on("mousemove", function(d){
       d3.select(this)
         .attr("stroke", "#ff0000")
         .attr("stroke-width", 1);
       d3.select("#tooltip").style("display", "inline-block")
                            .style("left", d3.event.pageX + 5 + "px")
                            .style("top" , d3.event.pageY + 5 + "px");
       currentYearMortality = getDataPointRounded(d.properties.mortalityRates);
       currentYearIncidence = getDataPointRounded(d.properties.incidenceRates);
       if (Number.isFinite(currentYearIncidence)) {
           currentYearPerc = Math.round(100*currentYearMortality / currentYearIncidence);
       } else {
         currentYearPerc = "-";
       }
       d3.selectAll("#tooltip > p > .mortality").html(currentYearMortality);
       d3.selectAll("#tooltip > p > .incidence").html(currentYearIncidence);
       d3.selectAll("#tooltip > p > .percentage").html(currentYearPerc);
       d3.selectAll("#tooltip > h1").html(d.properties.name);
     })
     .on("mouseout", function(d){
       d3.select(this)
         .style("opacity", 0.8)
         .attr("stroke", "#777")
         .attr("stroke-width", 0.5);
       d3.select("#tooltip").style("display", "none");
     })

/*  mapsvg.append("g")
    .attr("class", "worldmap")
    .selectAll("path")
    .data(mapData.features)
    .enter()
    .attr("x", function(d) {
      console.log(d)
    })
    .append("text");*/


  function getDataPointRounded(data) {
    nd = "No data";
    if (!data) {
        return nd;
    }
    e = data.filter(function(p){return p.year == year})[0];
    return Math.round(e.Value*100)/100 || nd;
  }
  updateMap();
}

function updateMap(){
  d3.selectAll(".mapfeature")
    .attr("fill", function(d){
      return getColor(d);
    })
}

function meetsFilters(feature){
  //Check for incidence and mortality data
  var incidenceData = feature.properties.incidenceRates;
  var mortalityData = feature.properties.mortalityRates;
  if(!incidenceData || !mortalityData){
    return false;
  }

  var incValue, mortValue;

  //Check incidence data in range
  var yearInInc = false;
  for(var i = 0; i < incidenceData.length; i++){
    if(incidenceData[i].year == year){
      yearInInc = true;
      incValue = incidenceData[i].Value;
      if(incidenceData[i].Value < minIncidents || incidenceData[i].Value > maxIncidents){
        return false;
      }
    }
  }
  if(!yearInInc){
    return false;
  }

  //Check mortality data in range
  var yearInMort = false;
  for(var i = 0; i < mortalityData.length; i++){
    if(mortalityData[i].year == year){
      yearInMort = true;
      mortValue = mortalityData[i].Value;
      if(mortalityData[i].Value < minMortality || mortalityData[i].Value > maxMortality){
        return false;
      }
    }
  }
  if(!yearInMort){
    return false;
  }

  //Check death percentage in range
  var deathPercentage = mortValue / (incValue * 1000) * 100;
  // console.log(deathPercentage)
  if(deathPercentage < minDeath || deathPercentage> maxDeath){
    return false;
  }

  return true;
}

function getColor(feature){

  if(!meetsFilters(feature)){
    return "#EEE"
  }

  if(incidentMortality == "i"){
    var data = feature.properties.incidenceRates;
    if(!data){
      return colorScale(0);
    }
    for(var i = 0; i < data.length; i++){
      if(data[i].year == year){
        return colorScale(data[i].Value);
      }
    }
  }
  if(incidentMortality == "m"){
    var data = feature.properties.mortalityRates;
    if(!data){
      return colorScale(0);
    }
    for(var i = 0; i < data.length; i++){
      if(data[i].year == year){
        return colorScale(data[i].Value);
      }
    }
  }
}

function zoomMap(){
  if(!mapData) return;
  var bboxList = [];
  for(var i = 0; i < mapData.features.length; i++){
    var feat = mapData.features[i];
    //check incidence
    var incInRange = false;
    if(!meetsFilters(feat)) continue;
    bboxList.push(path.bounds(mapData.features[i]))
  }
  var bbox = bboxList[0];
  for(var i = 1; i < bboxList.length; i++){
    if(bbox[0][0] > bboxList[i][0][0]) bbox[0][0] = bboxList[i][0][0];
    if(bbox[0][1] > bboxList[i][0][1]) bbox[0][1] = bboxList[i][0][1];
    if(bbox[1][0] < bboxList[i][1][0]) bbox[1][0] = bboxList[i][1][0];
    if(bbox[1][1] < bboxList[i][1][1]) bbox[1][1] = bboxList[i][1][1];
  }



  var pathw = bbox[1][0] - bbox[0][0];
  var pathh = bbox[1][1] - bbox[0][1];
  var kx = mapWidth/pathw;
  var ky = mapHeight/pathh;
  k = 0.95*Math.min(kx, ky);

  var x = bbox[0][0] + (pathw)/2;
  var y = bbox[0][1] + (pathh)/2;


  d3.selectAll(".mapfeature")
    .transition()
    .duration(750)
    .attr("transform", "translate(" + mapWidth / 2 + "," + mapHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .style("stroke-width", 1 / k + "px");
}

var colorScale = d3.scaleLinear()
  .domain([0, 200, 1000])
  .range(['#FFF', '#fc9272', '#de2d26'])
