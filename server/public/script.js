var server = "http://localhost:8000";

var mapData;
var incidence;
var mortality;

var files = [server + "/worldmap.json", server + "/api/incidenceRates", server + "/api/mortalityRates"];
var promises = [];

var year = 2000;
var colorBy = "incidence";

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
  console.log(incidence)
  drawMap()
}



function getColor(feature){
  if(colorBy == "incidence"){
    var data = feature.properties.incidenceRates;
    if(!data){
      return colorScale(0);
    }
    for(var i = 0; i < data.length; i++){
      console.log(data[i].year)
      if(data[i].year == year){
        console.log(data[i].Value)
        return colorScale(data[i].Value);
      }
    }
  }
}


var colorScale = d3.scaleLinear()
  .domain([0, 200, 1000])
  .range(['#FFF', '#fc9272', '#de2d26'])

function drawMap(){
  var mapsvg = d3.select("#map");
  var mapbbox = mapsvg.node().getBoundingClientRect();
  var mapWidth = mapbbox.width;
  var mapHeight = mapbbox.height;
  var margin = 5;
  var masterProject = d3.geoMercator();
  masterProject.fitExtent([[margin, margin], [mapWidth, mapHeight]], mapData);
  path = d3.geoPath().projection(masterProject);

  var zoom = d3.zoom()
    .scaleExtent([1, 100])
    .on("zoom", zoomed)

  mapsvg.append("rect")
    .attr("id", "mouselistener")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", mapWidth)
        .attr("height", mapHeight)
        .style("opacity", 0)
        .call(zoom)

    //Transform the map and markers based on how it has been zoomed and translated.
    function zoomed(){
      console.log(d3.event.transform)
      mapsvg.select(".worldmap").selectAll("path")
        .attr("transform", d3.event.transform);
    }



  mapsvg.append("g")
   .attr("class", "worldmap")
   .selectAll("path")
   .data(mapData.features)
   .enter()
   .append("path")
     .attr("d", path)
     .attr("class", "mapfeature")
     .attr("fill", function(d){
       return getColor(d)

     })
     .attr("stroke-width", 0.5)
     .attr("stroke", "#000")
     .attr("pointer-events", "all")
     .style("opacity", 0.6)
     .on("mousemove", function(d){
       d3.select(this).style("opacity", 0.8);
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
       d3.select(this).style("opacity", 0.6);
       d3.select("#tooltip").style("display", "none");
     })

  function getDataPointRounded(data) {
    nd = "No data";
    if (!data) {
        return nd;
    }
    e = data.filter(function(p){return p.year == year})[0];
    return Math.round(e.Value*100)/100 || nd;
  }

}
