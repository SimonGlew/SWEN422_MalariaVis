var server = "http://localhost:8000";

var mapData;

d3.json(server + "/worldmap.json").then(function(data){
  mapData = data;
  drawMap();
})

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

  console.log(mapData)

  mapsvg.append("g")
   .attr("class", "worldmap")
   .selectAll("path")
   .data(mapData.features)
   .enter()
   .append("path")
     .attr("d", path)
     .attr("class", "mapfeature")
     .attr("id", function(d){
       return d.properties.adm0_a3;
     })
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

     mapsvg.append("rect")
       .attr("id", "mouselistener")
           .attr("x", 0)
           .attr("y", 0)
           .attr("width", mapWidth)
           .attr("height", mapHeight)
           .style("opacity", 0)
           .on("mousemove", function(){
             var e = d3.event;
             var prev = this.style.pointerEvents;
             this.style.pointerEvents = 'none';
             var el = document.elementFromPoint(d3.event.x, d3.event.y);
             console.log(d3.select(el).attr("id"))
             this.style.pointerEvents = prev;
           })
           .call(zoom)

       //Transform the map and markers based on how it has been zoomed and translated.
       function zoomed(){
         console.log(d3.event)
         console.log(d3.event.transform)
         mapsvg.select(".worldmap").selectAll("path")
           .attr("transform", d3.event.transform);
       }


}
