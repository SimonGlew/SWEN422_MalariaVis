var linesvg = d3.select("#line");
var svgWidth, svgHeight;
var lineWidth, margin = 50;
var legendHeight = 20, legendWidth = 50, legendPadding = 5;
var xScale, yScale;

var legendColors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'];
var data = [];

var line = d3.line()
  .x(function(d, i) {
    return xScale(parseInt(d.year));
  })
  .y(function(d) {
    if(incidentMortality == "m"){
      return mortalityYScale(d.mortality)
    }else if(incidentMortality == "i"){
      return incidenceYScale(d.incidence);
    }
  })
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


  incidenceYScale = d3.scaleLinear()
    .domain([1000, 0])
    .range([0, svgHeight - margin*2])


  mortalityYScale = d3.scaleLinear()
    .domain([250, 0])
    .range([0, svgHeight - margin*2])

  var yAxis = d3.axisLeft()
    .scale(mortalityYScale);

  linesvg.append("g")
    .attr("id", "yAxis")
    .attr("transform", "translate( " + 2*margin + ", " + margin + ")")
    .call(yAxis);

  linesvg.append("g")
    .attr("id", "xAxis")
    .attr("transform", "translate( " + 2*margin + ", " + (svgHeight - margin) + ")")
    .call(xAxis);

  linesvg.append("text")
    .attr("id", "line-title")
    .attr("x",  margin*2 + (lineWidth - 2*margin)/2)
    .attr("y", margin/2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .text("Malaria Mortality Rates, 2000 - 2015")

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
    .text("Mortality Rate")

  linesvg.append("text")
    .attr("id", "line-ySubLabel")
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

  //combine incidence and mortality data
  var points = [];
  for(var i = 0; i < feature.properties.incidenceRates.length; i++){
    for(var j = 0; j < feature.properties.mortalityRates.length; j++){
      if(feature.properties.incidenceRates[i].year == feature.properties.mortalityRates[j].year){
        points.push({
          "name" : feature.properties.brk_name,
          "year" : feature.properties.incidenceRates[i].year,
          "incidence" : feature.properties.incidenceRates[i].Value,
          "mortality" : feature.properties.mortalityRates[i].Value
        })
      }
    }
  }

  //Add line
  linesvg.append("path")
    .datum(points)
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
    .data(points)
    .enter()
    .append("circle")
      .attr("class", "linepoint")
      .attr("cx", function(d){
        return margin * 2 + xScale(d.year)
      })
      .attr("cy", function(d){
        if(incidentMortality == 'm'){
          return margin + mortalityYScale(0)
        }else if(incidentMortality == 'i'){
          return margin + incidenceYScale(0);
        }
      })
      .attr("r", 5)
      .attr("fill", color)
      .attr("stroke", "#FFF")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .on("mousemove", function (d) {
        d3.select("#line-tooltip").style("display", "inline-block")
          .style("left", d3.event.pageX + 5 + "px")
          .style("top", d3.event.pageY + 5 + "px");
        var value;
        if(incidentMortality == "m"){
          value = parseFloat(d.mortality);
        }else if(incidentMortality == "i"){
          value =  parseFloat(d.incidence);
        }
        value = value.toFixed(2)
        d3.selectAll("#line-tooltip > p > .year").html(d.year);
        d3.selectAll("#line-tooltip > p > .label").html(function(){
          if(incidentMortality == "m"){
            return "Mortality Rate:"
          }else if(incidentMortality == "i"){
            return "Incidence Rate:"
          }
        });
        d3.selectAll("#line-tooltip > p > .value").html(value);
        d3.selectAll("#line-tooltip > h1").html(d.name);
      })
      .on("mouseout", function(){
        d3.select("#line-tooltip").style("display", "none")
      })
      .transition()
      .attr("cy", function(d){
        if(incidentMortality == 'm'){
          return margin + mortalityYScale(d.mortality)
        }else if(incidentMortality == 'i'){
          return margin + incidenceYScale(d.incidence);
        }
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

function redrawChart(){
  if(incidentMortality == "m"){
    d3.select("#line-yLabel").text("Mortality Rate")
    d3.select("#line-ySubLabel").text("(Per 100,000 Population)");
    d3.select("#line-title").text("Malaria Mortality Rates, 2000 - 2015")
    d3.select("#yAxis").call(d3.axisLeft().scale(mortalityYScale).ticks(10));
  }else if(incidentMortality == "i"){
    d3.select("#line-yLabel").text("Incidence Rate")
    d3.select("#line-ySubLabel").text("(Per 1,000 Population)");
    d3.select("#line-title").text("Malaria Incidence Rates, 2000 - 2015")
    d3.select("#yAxis").call(d3.axisLeft().scale(incidenceYScale).ticks(10));
  }
  d3.selectAll(".line").transition().attr("d", line)
  d3.selectAll(".linepoint").transition().attr("cy", function(d){
    if(incidentMortality == 'm'){
      return margin + mortalityYScale(d.mortality)
    }else if(incidentMortality == 'i'){
      return margin + incidenceYScale(d.incidence);
    }
  })
}



drawChart();
