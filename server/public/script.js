var path = window.location.href.split(':52724')[0]
var server = path + ":52724";

var mapData;
var incidence;
var mortality;

var path;
var mapWidth;
var mapHeight;

var zoom;
var mapsvg = d3.select("#map");

var files = [server + "/worldmap.json", server + "/api/incidenceRates", server + "/api/mortalityRates"];
var promises = [];

/* FIXME this list of selected countries is just that; nothing is done with it */
var selected = [];

// Following is lifted from https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

files.forEach(function (url) {
  promises.push(d3.json(url))
});

Promise.all(promises).then(function (values) {
  processData(values);
});

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

function zoomed() {
  var t = [d3.event.transform.x, d3.event.transform.y];
  var s = d3.event.transform.k;
  var h = 0;

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
  //contains all the data
  var zoomFiltered1 = meetsFiltered.filter(function (element) {
    var c = path.bounds(element);
    var x = Math.abs(c[0][0] - c[1][0]);
    var y = Math.abs(c[0][1] - c[1][1]);
    var area = x;
    return x * y > 10;
  });

  var zoomFiltered2 = meetsFiltered.filter(function (element) {
    var c = path.bounds(element);
    var x = Math.abs(c[0][0] - c[1][0]);
    var y = Math.abs(c[0][1] - c[1][1]);
    var area = x;
    return area > 10;
  });
  // Largest area countries are displayed
  var zoomFiltered3 = meetsFiltered.filter(function (element) {
    var c = path.bounds(element);
    var x = Math.abs(c[0][0] - c[1][0]);
    var y = Math.abs(c[0][1] - c[1][1]);
    var area = x;
    return area > 30;
  });

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

  d3.select("#map").select(".worldmap").selectAll("path")
    .attr("transform", "translate(" + t + ")scale(" + s + ")");
  d3.select("#map").select(".worldmap").selectAll("text")
    .attr("transform", "translate(" + t + ")scale(" + s + ")");

  function drawLabels(data) {
    mapsvg.select(".worldmap")
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "map-text")
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

  function removeLabels() {
    mapsvg
      .select(".worldmap")
      .selectAll("text")
      .remove()
  }
}

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

  //TODO: rethink this
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

  mapsvg.call(zoom)

  //Draw countries
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
    .attr("pointer-events", "all")
    .style("opacity", 0.8)
    .on("mousemove", function (d) {
      d3.select(this)
        .attr("stroke", "#00F")
        .attr("stroke-width", 1);
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
      d3.select("#tooltip").style("display", "none");
    })
    .on("click", function (d) {
      /* toggle item's presence in selection */
      if (!selected.includes(d)) {
        selected.push(d);
        addToChart(d)
      } else {
        selected = selected.filter(function (e) { return e != d; });
        removeFromChart(d)
      }
    });


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

function updateMap() {
  d3.selectAll(".mapfeature")
    .attr("fill", function (d) {
      return getColor(d);
    })
  updateScale()
}

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

function getColor(feature) {

  if (!meetsFilters(feature)) {
    return "#EEE"
  }

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

function drawScale() {
  var margin = 30, scaleHeight = 20;
  var x = margin;
  var y = mapHeight - margin - scaleHeight;

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

  mapsvg.append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width", 200)
    .attr("height", scaleHeight)
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-width", 1)

  mapsvg.append("text")
    .attr("id", "scalelabel")
    .attr("x", x)
    .attr("y", y - 25)

  mapsvg.append("text")
    .attr("id", "scaleunits")
    .attr("x", x)
    .attr("y", y - 10)
    .attr("font-size", 12)

  mapsvg.append("g")
    .attr("id", "scaleaxis")
    .attr("transform", "translate(" + x + ", " + (y + scaleHeight) + ")")

  updateScale()
}



function updateScale() {
  d3.selectAll(".scalerect")
    .attr("fill", function (d) {
      if (incidentMortality == "m") {
        return mortalityScale((d / 200) * 250);
      } else if (incidentMortality == "i") {
        return incidenceScale((d / 200) * 1000);
      }
    })

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

  if (incidentMortality == "m") {
    d3.select("#scaleaxis")
      .call(mortalityAxis);
  } else if (incidentMortality == "i") {
    d3.select("#scaleaxis")
      .call(incidenceAxis)
  }

}

function zoomMapToFull() {
  if (!mapData) return;
  var t = d3.zoomIdentity.translate(0, 0).scale(1)
  d3.select("#map").call(zoom).transition()
    .duration(750)
    .call(zoom.transform, t);
}


function zoomMap() {
  if (!mapData) return;
  var bboxList = [];
  for (var i = 0; i < mapData.features.length; i++) {
    var feat = mapData.features[i];
    //check incidence
    var incInRange = false;
    if (!meetsFilters(feat)) continue;
    bboxList.push(path.bounds(mapData.features[i]))
  }
  if (bboxList.length == 0) {
    zoomMapToFull();
    return;
  }
  var bbox = bboxList[0];
  for (var i = 1; i < bboxList.length; i++) {
    if (bbox[0][0] > bboxList[i][0][0]) bbox[0][0] = bboxList[i][0][0];
    if (bbox[0][1] > bboxList[i][0][1]) bbox[0][1] = bboxList[i][0][1];
    if (bbox[1][0] < bboxList[i][1][0]) bbox[1][0] = bboxList[i][1][0];
    if (bbox[1][1] < bboxList[i][1][1]) bbox[1][1] = bboxList[i][1][1];
  }

  var pathw = bbox[1][0] - bbox[0][0];
  var pathh = bbox[1][1] - bbox[0][1];
  var kx = mapWidth / pathw;
  var ky = mapHeight / pathh;
  k = 0.95 * Math.min(kx, ky);

  var x = bbox[0][0] + (pathw) / 2;
  var y = bbox[0][1] + (pathh) / 2;

  var t = d3.zoomIdentity.translate(mapWidth / 2, mapHeight / 2).scale(k).translate(-x, -y)

  d3.select("#map").call(zoom).transition()
    .duration(750)
    .call(zoom.transform, t);
}

var incidenceScale = d3.scaleLinear()
  .domain([0, 200, 1000])
  .range(['#FFF', '#fc9272', '#de2d26'])

var incidenceScaleLegend = d3.scaleLinear()
  .domain([0, 200, 1000])
  .range([0, 100, 200])

var incidenceAxis = d3.axisBottom()
  .scale(incidenceScaleLegend)
  .tickValues([0, 200, 1000])

var mortalityScale = d3.scaleLinear()
  .domain([0, 100, 250])
  .range(['#FFF', '#fc9272', '#de2d26'])

var mortalityScaleLegend = d3.scaleLinear()
  .domain([0, 100, 250])
  .range([0, 100, 200])

var mortalityAxis = d3.axisBottom()
  .scale(mortalityScaleLegend)
  .tickValues([0, 100, 250])
