var server = "http://localhost:8000";

var mapData;

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
  console.log(mapData)
  incidence = data[1];
  console.log(incidence)
  for(var i = 0; i < mapData.features.length; i++){
    console.log(mapData.features[i].properties.adm0_a3)
  }
  drawMap()
}

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
     .attr("fill", "#333")
     .attr("stroke-width", 0.5)
     .attr("stroke", "#000")
     .attr("pointer-events", "all")
     .style("opacity", 0.6)
     .on("mouseover", function(d){
       d3.select(this).style("opacity", 0.8);
     })
     .on("mouseout", function(d){
       d3.select(this).style("opacity", 0.6);
     })




}
