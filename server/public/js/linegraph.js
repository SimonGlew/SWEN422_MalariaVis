var linesvg = d3.select("#line");
var svgWidth, svgHeight;
var lineWidth, margin = 50;
var legendHeight = 20, legendWidth = 50, legendPadding = 5;
var xScale, yScale;

var legendColors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'];
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

  linesvg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("fill", "#FFF")

  lineWidth = 0.7*svgWidth;

  xScale = d3.scaleLinear()
    .domain([2000, 2015])
    .range([0, lineWidth - margin*2])

  var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(4, "d");

  yScale = d3.scaleLinear()
    .domain([1000, 0])
    .range([0, svgHeight - margin*2])

  var yAxis = d3.axisLeft()
    .scale(yScale);

  linesvg.append("g")
    .attr("class", "yAxis")
    .attr("transform", "translate( " + 2*margin + ", " + margin + ")")
    .call(yAxis);

  linesvg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate( " + 2*margin + ", " + (svgHeight - margin) + ")")
    .call(xAxis);

  linesvg.append("text")
    .attr("id", "line-title")
    .attr("x",  margin*2 + (lineWidth - 2*margin)/2)
    .attr("y", margin/2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .text("Malaria Incidence Rates, 2000 - 2015")

  linesvg.append("text")
    .attr("id", "line-xLabel")
    .attr("x", margin*2 + (lineWidth - 2*margin)/2)
    .attr("y", svgHeight - margin/2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .text("Year")

  linesvg.append("text")
    .attr("id", "line-yLabel")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .attr("transform", "rotate(-90)translate(" + (-svgHeight/2) + "," + (margin/2) + ")")
    .text("Incidence Rate")

  linesvg.append("text")
    .attr("id", "line-yLabel")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("font-size", 13)
    .attr("alignment-baseline", "central")
    .attr("transform", "rotate(-90)translate(" + (-svgHeight/2) + "," + (margin) + ")")
    .text("(per 100,000 population)")

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
    .attr("y", margin + (data.length) * (legendPadding + legendHeight))
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", color)
    .style("opacity", 0);

  linesvg.append("text")
    .datum({id: feature.properties.adm0_a3})
    .attr("class", "legendtext")
    .attr("id", "legendtext-" + feature.properties.adm0_a3)
    .attr("x", lineWidth + margin + legendWidth + legendPadding)
    .attr("y", margin + (data.length) * (legendPadding + legendHeight) + legendHeight/2)
    .text(feature.properties.brk_name)
    .style("alignment-baseline", "central")
    .style("opacity", 0);

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

  //Add circles
  linesvg.append("g")
    .attr("id", "markers-" + feature.properties.adm0_a3)
    .selectAll("circle")
    .data(feature.properties.incidenceRates)
    .enter()
    .append("circle")
      .attr("cx", function(d){
        return margin * 2 + xScale(d.year)
      })
      .attr("cy", margin + yScale(0))
      .attr("r", 5)
      .attr("fill", color)
      .attr("stroke", "#FFF")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .attr("cy", function(d){
        return margin + yScale(d.Value)
      })
      .style("opacity", 1)

    redrawLegend();
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
  d3.select("#markers-" + feature.properties.adm0_a3).selectAll("circle")
    .transition()
    .attr("cy", margin + yScale(0))
    .style("opacity", 0)
    .on("end", function(){
      d3.select("#markers-" + feature.properties.adm0_a3).remove();
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
    .style("opacity", 1)

  d3.selectAll(".legendrect")
    .transition()
    .attr("y", function(d){
      for(var i = 0; i < data.length; i++){
        if(data[i].properties.adm0_a3 == d.id){
          return margin + i * (legendPadding + legendHeight);
        }
      }
    })
    .style("opacity", 1)
}



drawChart();
