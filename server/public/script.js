var server = "http://localhost:8000";

var mapData;

d3.json(server + "/worldmap.json").then(function(data){
  mapData = data;
  drawMap();
})

function drawMap(){

}
