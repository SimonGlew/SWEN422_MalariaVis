var linesvg = d3.select("#line");
var svgWidth, svgHeight;
var lineWidth;
var xScale, yScale;

function drawChart(){
  var margin = 20;
  var chartBbox = linesvg.node().getBoundingClientRect();
  svgWidth = chartBbox.width;
  svgHeight = chartBbox.height;

  lineWidth = 0.7*svgWidth;

  xScale = d3.scaleLinear()
    .domain([2000, 2015])
    .range([0, lineWidth - margin*2])

  var xAxis = d3.axisBottom()
    .scale(xScale);

  yScale = d3.scaleLinear()
    .domain([0, 1000])
    .range([0, svgHeight - margin*2])


  var yAxis = d3.axisLeft()
    .scale(yScale);

  linesvg.append("g")
    .attr("class", "yAxis")
    .attr("transform", "translate( " + 2*margin + ", " + margin + ")")
    .call(yAxis);

  linesvg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate( " + 2*margin + ", " + margin + ")")
    .call(xAxis);

}

drawChart();
