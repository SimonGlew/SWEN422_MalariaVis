var server = "http://localhost:8000";

var mapData;

d3.json(server + "/worldmap.json").then(function(data){
  mapData = data;
  drawMap();
})

function drawMap(){
  var mapsvg = d3.select("#map");
  var mapWidth = parseInt(mapsvg.style("width"));
  var mapHeight = parseInt(mapsvg.style("height"));
  var margin = 5;
  var masterProject = d3.geoMercator();
  masterProject.fitExtent([[margin, margin], [mapWidth, mapHeight]], mapData);
  path = d3.geoPath().projection(masterProject);
  
  mapsvg.append("g")
   .attr("class", "worldmap")
   .selectAll("path")
   .data(mapData.features)
   .enter()
   .append("path")
     .attr("d", path)
     .attr("fill", "#333")
     .attr("stroke-width", 0.5)
     .attr("stroke", "#000")
     .attr("pointer-events", "none")


}
