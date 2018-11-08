var linesvg = d3.select("#line");
var svgWidth, svgHeight;
var lineWidth, margin = 50;
var legendHeight = 20, legendWidth = 50, legendPadding = 5;
var xScale, yScale;

var legendColors = ['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f'];
var data = [];

var line = d3.line()
  .x(function(d, i) { return xScale(parseInt(d.year)); })
  .y(function(d) { return yScale(d.Value); })
  .curve(d3.curveMonotoneX)

var zeroLine = d3.line()
  .x(function(d, i){ return xScale(parseInt(d.year)); })
  .y(function(){ return yScale(0); })
  .curve(d3.curveMonotoneX)

function drawChart(){
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
    .domain([1000, 0])
    .range([0, svgHeight - margin*2])

  var yAxis = d3.axisLeft()
    .scale(yScale);

  linesvg.append("g")
    .attr("class", "yAxis")
    .attr("transform", "translate( " + 2*margin + ", " + margin + ")")
    .call(yAxis);

  //TODO: Format ticks
  linesvg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate( " + 2*margin + ", " + (svgHeight - margin) + ")")
    .call(xAxis);
}

function addToChart(feature){
  //Find unused color
  var color;
  for(var i = 0; i < legendColors.length; i++){
    var colorUsed = false;
    for(var j = 0; j < data.length; j++){
      if(data[j].color == legendColors[i]){
        colorUsed = true;
      }
    }
    if(!colorUsed){
      color = legendColors[i];
      break;
    }
  }
  feature.color = color;
  data.push(feature)

  //Add to legend
  linesvg.append("rect")
    .datum({id: feature.properties.adm0_a3})
    .attr("class", "legendrect")
    .attr("id", "legendrect-" + feature.properties.adm0_a3)
    .attr("x", lineWidth + margin)
    .attr("y", margin + (data.length-1) * (legendPadding + legendHeight))
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", color);

  linesvg.append("text")
    .datum({id: feature.properties.adm0_a3})
    .attr("class", "legendtext")
    .attr("id", "legendtext-" + feature.properties.adm0_a3)
    .attr("x", lineWidth + margin + legendWidth + legendPadding)
    .attr("y", margin + (data.length-1) * (legendPadding + legendHeight) + legendHeight/2)
    .text(feature.properties.brk_name)
    .style("alignment-baseline", "central");


    console.log(feature.properties.incidenceRates)

  //Add line
  linesvg.append("path")
    .datum(feature.properties.incidenceRates)
    .attr("class", "line")
    .attr("id", "line-" + feature.properties.adm0_a3)
    .attr("transform", "translate(" + (2*margin) + "," + (margin) + ")")
    .attr("d", zeroLine)
    .style("opacity", 0)
    .transition()
    .style("opacity", 1)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", color)
}

function removeFromChart(feature){
  var index = -1;
  for(var i = 0; i < data.length; i++){
    if(data[i].properties.adm0_a3 == feature.properties.adm0_a3){
      index = i;
      break;
    }
  }
  data.splice(index, 1)

  d3.select("#legendrect-" + feature.properties.adm0_a3).remove();
  d3.select("#legendtext-" + feature.properties.adm0_a3).remove();
  d3.select("#line-" + feature.properties.adm0_a3)
    .transition()
    .attr("d", zeroLine)
    .style("opacity", 0)
    .on("end", function(){
      d3.select(this).remove();
    })


  redrawLegend();
}

function redrawLegend(){
  d3.selectAll(".legendtext")
    .transition()
    .attr("y", function(d){
      for(var i = 0; i < data.length; i++){
        if(data[i].properties.adm0_a3 == d.id){
          return margin + i * (legendPadding + legendHeight) + legendHeight/2;
        }
      }
    })

  d3.selectAll(".legendrect")
    .transition()
    .attr("y", function(d){
      for(var i = 0; i < data.length; i++){
        if(data[i].properties.adm0_a3 == d.id){
          return margin + i * (legendPadding + legendHeight);
        }
      }
    })
}



drawChart();
