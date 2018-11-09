var path = window.location.href.split(':52724')[0]
var server = path + ":52724";

//Variables to store datasets
var mapData;
var incidence;
var mortality;

//Path object defines how countries are drawn
var path;

//Dimensions of map widget
var mapWidth;
var mapHeight;

//Zoom object for panning/zooming functionality
var zoom;

//SVG for map
var mapsvg = d3.select("#map");

//List of currently selected countries
var selected = [];

// Following is lifted from https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

//List of data files to load
var files = [server + "/worldmap.json", server + "/api/incidenceRates", server + "/api/mortalityRates"];
var promises = [];

//Define promises ensuring all data is loaded
files.forEach(function (url) {
  promises.push(d3.json(url))
});

//Process data once all data sets are loaded
Promise.all(promises).then(function (values) {
  processData(values);
});

//Add incidence and mortality data to the properties of each country filter.
function processData(data) {
  mapData = data[0]
  incidence = data[1];
  mortality = data[2]
  for (var i = 0; i < mapData.features.length; i++) {
    mapData.features[i].properties.incidenceRates = incidence[mapData.features[i].properties.adm0_a3];
    mapData.features[i].properties.mortalityRates = mortality[mapData.features[i].properties.adm0_a3];
  }
  drawMap()
}

//Translates and scales countries when zooming
function zoomed() {
  var t = [d3.event.transform.x, d3.event.transform.y];
  var s = d3.event.transform.k;
  var h = 0;

  //Limit translation to map cannot be moved off screen
  t[0] = Math.min(
    (mapWidth / mapHeight) * (s - 1),
    Math.max(mapWidth * (1 - s), t[0])
  );

  t[1] = Math.min(
    h * (s - 1) + h * s,
    Math.max(mapHeight * (1 - s) - h * s, t[1])
  );

  // Only show labels with filter information
  var meetsFiltered = mapData.features.filter(function (element) {
    return meetsFilters(element);
  });
  //Display labels of all countries
  var zoomFiltered1 = meetsFiltered.filter(function (element) {
    var c = path.bounds(element);
    var x = Math.abs(c[0][0] - c[1][0]);
    var y = Math.abs(c[0][1] - c[1][1]);
    var area = x;
    return x * y > 10;
  });
  //Display labels of some countries
  var zoomFiltered2 = meetsFiltered.filter(function (element) {
    var c = path.bounds(element);
    var x = Math.abs(c[0][0] - c[1][0]);
    var y = Math.abs(c[0][1] - c[1][1]);
    var area = x;
    return area > 10;
  });
  // Display labels of largest countries
  var zoomFiltered3 = meetsFiltered.filter(function (element) {
    var c = path.bounds(element);
    var x = Math.abs(c[0][0] - c[1][0]);
    var y = Math.abs(c[0][1] - c[1][1]);
    var area = x;
    return area > 30;
  });
  //Display labels accordingly
  if (s > 2.1 && s <= 3) {
    removeLabels();
    drawLabels(zoomFiltered3)
  } else if (s > 3 && s <= 8) {
    removeLabels();
    drawLabels(zoomFiltered2)
  } else if (s > 8) {
    removeLabels();
    drawLabels(zoomFiltered1)
  } else {
    removeLabels()
  }
  //Translate and scale texts and country features
  d3.select("#map").select(".worldmap").selectAll("path")
    .attr("transform", "translate(" + t + ")scale(" + s + ")");
  d3.select("#map").select(".worldmap").selectAll("text")
    .attr("transform", "translate(" + t + ")scale(" + s + ")");

  //Draw labels for each country
  function drawLabels(data) {
    mapsvg.select(".worldmap")
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "map-text")
      .style("pointer-events", "none")
      .attr("x", function (d) {
        let c = path.bounds(d);
        var x = c[0][0] + (Math.abs(c[0][0] - c[1][0]) / 2);
        var y = c[0][1] + (Math.abs(c[0][1] - c[1][1]) / 2);
        return x;
      })
      .attr("y", function (d) {
        let c = path.bounds(d);
        var y = c[0][1] + (Math.abs(c[0][1] - c[1][1]) / 1.5);
        return y;
      })
      .text(function (d) {
        return d.properties.name;
      })
      .style("font-size", function (d) {
        var min = 2;
        var size = ((Math.abs((path.bounds(d))[0][0] - (path.bounds(d))[1][0]) / (d.properties.name).length * 0.5));
        return min > size ? min + "px" : size + "px";
      })
      .attr("text-anchor", "middle")
      .style("text-shadow", "stroke: white");
  }

  //Remove country labels for all countries
  function removeLabels() {
    mapsvg
      .select(".worldmap")
      .selectAll("text")
      .remove()
  }
}

//Draw all map countries to form the map.
function drawMap() {
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

  //Define zoom object
  zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed)

  //Rectangle mouse lister for handling dragging/zooming
  mapsvg.append("rect")
    .attr("id", "mouselistener")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .style("fill", "white")
    .style("opacity", 1)

  //Scale and translate upon scrolling/dragging on svg
  mapsvg.call(zoom)

  //Draw each country
  mapsvg.append("g")
    .attr("class", "worldmap")
    .selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "mapfeature")
    .attr("id", function (d) {
      return "feature-" + d.properties.adm0_a3;
    })
    .attr("stroke-width", 0.5)
    .attr("fill", "#FFF")
    .attr("stroke", "#777")
    .style("cursor", function(d){ //Pointer indicates when features can be cloicked
      if(d.properties.incidenceRates){
        return "pointer"
      }
      return "default"
    })
    .attr("pointer-events", "all")
    .style("opacity", 0.8)
    .on("mousemove", function (d) {
      d3.select(this)
        .attr("stroke", function(d){ //Blue border indicates when featres can be clicked
          if(d.properties.incidenceRates){
            return "#00F"
          }
          return "#777"
        })
        .attr("stroke-width", 1);
        //Set the position and text of the tooltip
        d3.select(this).moveToFront();
        d3.selectAll('text').moveToFront();
        d3.select("#tooltip").style("display", "inline-block")
          .style("left", d3.event.pageX + 5 + "px")
          .style("top", d3.event.pageY + 5 + "px");
        currentYearMortality = getDataPointRounded(d.properties.mortalityRates);
        currentYearIncidence = getDataPointRounded(d.properties.incidenceRates);
        if (Number.isFinite(currentYearIncidence)) {
          currentYearPerc = (100 * currentYearMortality / (currentYearIncidence * 100)).toFixed(2);
        } else {
          currentYearPerc = "-";
        }
        d3.selectAll("#tooltip > p > .mortality").html(currentYearMortality);
        d3.selectAll("#tooltip > p > .incidence").html(currentYearIncidence);
        d3.selectAll("#tooltip > p > .percentage").html(currentYearPerc);
        d3.selectAll("#tooltip > h1").html(d.properties.name);
    })
    .on("mouseout", function (d) {
      //Remove highlight (unless selected)
      if (selected.includes(d)) {
        d3.select(this)
          .attr("stroke", "#00F")
          .attr("stroke-width", 1);
      } else {
        d3.select(this)
          .attr("stroke", "#777")
          .style("opacity", 0.8)
          .attr("stroke-width", 0.5);
      }
      //Hide tooltip
      d3.select("#tooltip").style("display", "none");
    })
    .on("click", function (d) {
      /* toggle item's presence in selection */
      if (!selected.includes(d)) {
        if(selected.length < 8 && d.properties.incidenceRates){
          selected.push(d);
          addToChart(d);
        }
      } else {
        selected = selected.filter(function (e) { return e != d; });
        removeFromChart(d)
      }
    });


  //Round data point for display in tooltip`
  function getDataPointRounded(data) {
    nd = "No data";
    if (!data) {
      return nd;
    }
    e = data.filter(function (p) { return p.year == year })[0];
    return Math.round(e.Value * 100) / 100 || nd;
  }

  drawScale();
  updateMap();
}

//Update map colors based on filter selection
function updateMap() {
  d3.selectAll(".mapfeature")
    .attr("fill", function (d) {
      return getColor(d);
    })
  updateScale()
}

//Returns true if the country meets the filter requirements for the selected year
function meetsFilters(feature) {
  //Check for incidence and mortality data
  var incidenceData = feature.properties.incidenceRates;
  var mortalityData = feature.properties.mortalityRates;
  if (!incidenceData || !mortalityData) {
    return false;
  }
  var incValue, mortValue;
  //Check incidence data in range
  var yearInInc = false;
  for (var i = 0; i < incidenceData.length; i++) {
    if (incidenceData[i].year == year) {
      yearInInc = true;
      incValue = incidenceData[i].Value;
      if (incidenceData[i].Value < minIncidents || incidenceData[i].Value > maxIncidents) {
        return false;
      }
    }
  }
  if (!yearInInc) {
    return false;
  }
  //Check mortality data in range
  var yearInMort = false;
  for (var i = 0; i < mortalityData.length; i++) {
    if (mortalityData[i].year == year) {
      yearInMort = true;
      mortValue = mortalityData[i].Value;
      if (mortalityData[i].Value < minMortality || mortalityData[i].Value > maxMortality) {
        return false;
      }
    }
  }
  if (!yearInMort) {
    return false;
  }
  //Check death percentage in range
  var deathPercentage = mortValue / (incValue * 100) * 100;
  if (deathPercentage < minDeath || deathPercentage > maxDeath) {
    return false;
  }
  return true;
}

//Return color to fill the country features
function getColor(feature) {
  //Return grey if country does not meet filters
  if (!meetsFilters(feature)) {
    return "#EEE"
  }

  //If viewing incidence rates, color by incidence color scale
  if (incidentMortality == "i") {
    var data = feature.properties.incidenceRates;
    if (!data) {
      return incidenceScale(0);
    }
    for (var i = 0; i < data.length; i++) {
      if (data[i].year == year) {
        return incidenceScale(data[i].Value);
      }
    }
  }
  //If vuewing mortality rates, color by mortality color scale
  if (incidentMortality == "m") {
    var data = feature.properties.mortalityRates;
    if (!data) {
      return mortalityScale(0);
    }
    for (var i = 0; i < data.length; i++) {
      if (data[i].year == year) {
        return mortalityScale(data[i].Value);
      }
    }
  }
}

//Draw a scale legend at the bottom left of the map
function drawScale() {
  //Define scale dimensions
  var margin = 30, scaleHeight = 20;
  var x = margin;
  var y = mapHeight - margin - scaleHeight;

  //Add rectangles to display legend colors
  mapsvg.append("g").attr("id", "scaleg")
  for (var i = 0; i < 200; i += 2) {
    mapsvg.select("#scaleg").append("rect")
      .datum(i)
      .attr("class", "scalerect")
      .attr("x", x + i)
      .attr("y", y)
      .attr("width", 2)
      .attr("height", scaleHeight)
  }

  //Add outline to scale
  mapsvg.append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width", 200)
    .attr("height", scaleHeight)
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-width", 1)

  //Add label to scale
  mapsvg.append("text")
    .attr("id", "scalelabel")
    .attr("x", x)
    .attr("y", y - 25)

  //Add label to show the units of the scale
  mapsvg.append("text")
    .attr("id", "scaleunits")
    .attr("x", x)
    .attr("y", y - 10)
    .attr("font-size", 12)

  //Add group to store axis on bottom of scale.
  mapsvg.append("g")
    .attr("id", "scaleaxis")
    .attr("transform", "translate(" + x + ", " + (y + scaleHeight) + ")")

  updateScale()
}


//Update the scale to reflect currently selected indicator
function updateScale() {
  //Color scale rectangles based on mortality or incidence color scales
  d3.selectAll(".scalerect")
    .attr("fill", function (d) {
      if (incidentMortality == "m") {
        return mortalityScale((d / 200) * 250);
      } else if (incidentMortality == "i") {
        return incidenceScale((d / 200) * 1000);
      }
    })

  //Update scale labels
  d3.select("#scaleunits")
    .text(function () {
      if (incidentMortality == "m") {
        return "(per 100,000 population)";
      } else if (incidentMortality == "i") {
        return "(per 1,000 at risk)"
      }
    })

  d3.select("#scalelabel")
    .text(function () {
      if (incidentMortality == "m") {
        return "Mortality Rate";
      } else if (incidentMortality == "i") {
        return "Incidence Rate"
      }
    })

  //Update axis on bottom of scale
  if (incidentMortality == "m") {
    d3.select("#scaleaxis")
      .call(mortalityAxis);
  } else if (incidentMortality == "i") {
    d3.select("#scaleaxis")
      .call(incidenceAxis)
  }

}

//Zoom out to show the entire map
function zoomMapToFull() {
  if (!mapData) return;
  var t = d3.zoomIdentity.translate(0, 0).scale(1)
  d3.select("#map").call(zoom).transition()
    .duration(750)
    .call(zoom.transform, t);
}

//Zoom the map to show only countries meeting the filters
function zoomMap() {
  if (!mapData) return;
  //Find the bounding boxes of all features meeting the filters
  var bboxList = [];
  for (var i = 0; i < mapData.features.length; i++) {
    var feat = mapData.features[i];
    if (!meetsFilters(feat)) continue;
    bboxList.push(path.bounds(mapData.features[i]))
  }
  //If nothing selected, zoom map to show all countries.
  if (bboxList.length == 0) {
    zoomMapToFull();
    return;
  }
  //Calculate bounding box containing all selected countries
  var bbox = bboxList[0];
  for (var i = 1; i < bboxList.length; i++) {
    if (bbox[0][0] > bboxList[i][0][0]) bbox[0][0] = bboxList[i][0][0];
    if (bbox[0][1] > bboxList[i][0][1]) bbox[0][1] = bboxList[i][0][1];
    if (bbox[1][0] < bboxList[i][1][0]) bbox[1][0] = bboxList[i][1][0];
    if (bbox[1][1] < bboxList[i][1][1]) bbox[1][1] = bboxList[i][1][1];
  }

  //Calculate scale to show all countries
  var pathw = bbox[1][0] - bbox[0][0];
  var pathh = bbox[1][1] - bbox[0][1];
  var kx = mapWidth / pathw;
  var ky = mapHeight / pathh;
  k = 0.95 * Math.min(kx, ky);

  //Calculate translation to show all countries
  var x = bbox[0][0] + (pathw) / 2;
  var y = bbox[0][1] + (pathh) / 2;

  //Apply transformation to map
  var t = d3.zoomIdentity.translate(mapWidth / 2, mapHeight / 2).scale(k).translate(-x, -y)
  d3.select("#map").call(zoom).transition()
    .duration(750)
    .call(zoom.transform, t);
}

//Color scale for incidence rates
var incidenceScale = d3.scaleLinear()
  .domain([0, 200, 1000])
  .range(['#FFF', '#fc9272', '#de2d26'])

//Numeric scale for displaying axis on scale legend for incidence
var incidenceScaleLegend = d3.scaleLinear()
  .domain([0, 200, 1000])
  .range([0, 100, 200])

//Axis to display on scale legend for incidence
var incidenceAxis = d3.axisBottom()
  .scale(incidenceScaleLegend)
  .tickValues([0, 200, 1000])

//Color scale for mortality rates
var mortalityScale = d3.scaleLinear()
  .domain([0, 100, 250])
  .range(['#FFF', '#fc9272', '#de2d26'])

//Numeric scale for displaying the axis on scale legend for mortality
var mortalityScaleLegend = d3.scaleLinear()
  .domain([0, 100, 250])
  .range([0, 100, 200])

//Axis to display on scale legend for mortality
var mortalityAxis = d3.axisBottom()
  .scale(mortalityScaleLegend)
  .tickValues([0, 100, 250])
