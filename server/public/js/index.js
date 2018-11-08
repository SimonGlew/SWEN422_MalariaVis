var actionStack = [],
    index = -1

var incidentMortality = 'm',
    year = 2000,
    minMortality = 0,
    maxMortality = 250,
    minIncidents = 0,
    maxIncidents = 1000,
    minDeath = 0,
    maxDeath = 0.70,
    countries = []

function undoAction() {
    console.log('undoing action')
    if (index > 0) {
        let action = JSON.parse(actionStack[--index])
        loadAction(action);
        //redraw things
        applyFilter(true)
        setUndoRedo();
    }
    else if(index == 0){
      setDefaults();
      index--;
      setUndoRedo();
    }
}

function redoAction() {
    console.log('redoing action');
    if (index < actionStack.length - 1) {
        let action = JSON.parse(actionStack[++index])
        //Do something with incidentMortality
        loadAction(action)
        //redraw things
        applyFilter(true)
        setUndoRedo();
    }
}

function loadAction(action){
  year = action.year
  minMortality = action.minMortality
  maxMortality = action.maxMortality
  minIncidents = action.minIncidents
  maxIncidents = action.maxIncidents
  minDeath = action.minDeath
  maxDeath = action.maxDeath
  countries = action.countries
  incidentMortality = action.incidentMortality

  if (action.incidentMortality == 'i') {
      $('#incidence').removeClass('btn-action')
      $('#mortality').addClass('btn-action')
      $('#mortality').removeClass('btn-action-disabled-switch')

      $('#mapDisplayLabel').text('You have selected: Incidence Rate')
  } else {
      $('#incidence').removeClass('btn-action-disabled-switch')
      $('#incidence').addClass('btn-action')
      $('#mortality').removeClass('btn-action')

      $('#mapDisplayLabel').text('You have selected: Mortality Rate')
  }

  updateMortalitySlider(action.minMortality, action.maxMortality);
  updateIncidenceSlider(action.minIncidents, action.maxIncidents);
  updateDeathPrecentSlider(action.minDeath, action.maxDeath);
  $('.year-slider').slider('value', action.year)
  $(".year-rate-slider").text(action.year)
}



function clearFilters() {
    setDefaults();
    if(index != -1){
      submit();
    }
}

function setUndoRedo(){
  if(index == -1){
    $('#undo').attr('disabled','disabled')
    $('#undo').addClass('btn-action-disabled')
  }
  if(index > -1){
    $('#undo').removeClass('btn-action-disabled')
    $('#undo').removeAttr('disabled')
  }
  if(index == actionStack.length - 1){
    $('#redo').addClass('btn-action-disabled')
    $('#redo').attr('disabled','disabled')
  }
  if(index < actionStack.length -1){
    $('#redo').removeClass('btn-action-disabled')
    $('#redo').removeAttr('disabled')
  }

}

function setDefaults(){
  updateMortalitySlider(0, 250);
  updateIncidenceSlider(0, 1000);
  updateDeathPrecentSlider(0, 0.7);

  $('.year-slider').slider('value', 2000)
  $(".year-rate-slider").text(2000)

  year = 2000
  minMortality = 0
  maxMortality = 250
  minIncidents = 0
  maxIncidents = 1000
  minDeath = 0
  maxDeath = 0.70

  countries = []

  applyFilter()
  zoomMapToFull()
}

function updateMortalitySlider(valA, valB){
    $('.mortality-slider').slider("values", 0, valA)
    $(".mortality-rate-slider.lower-handle").text(valA)
    $('.mortality-slider').slider("values", 1, valB)
    $(".mortality-rate-slider.upper-handle").text(valB)
}

function updateIncidenceSlider(valA, valB){
    $('.incidents-slider').slider("values", 0, valA)
    $(".incidents-rate-slider.lower-handle").text(valA)
    $('.incidents-slider').slider("values", 1, valB)
    $(".incidents-rate-slider.upper-handle").text(valB)
}

function updateDeathPrecentSlider(valA, valB){
    $('.deathPercentage-slider').slider("values", 0, valA)
    $(".deathPercentage-rate-slider.lower-handle").text(valA)
    $('.deathPercentage-slider').slider("values", 1, valB)
    $(".deathPercentage-rate-slider.upper-handle").text(valB)
}

function submit() {
    var action = JSON.stringify({
        incidentMortality: incidentMortality,
        year: year,
        minMortality: minMortality,
        maxMortality: maxMortality,
        minIncidents: minIncidents,
        maxIncidents: maxIncidents,
        minDeath: minDeath,
        maxDeath: maxDeath,
        countries: countries
    });
    console.log('submit', actionStack);
    console.log('action',action);
    if(!(action === actionStack[index])){
      actionStack.push(action);

      index = actionStack.length - 1;
      applyFilter(true)
      setUndoRedo();
      console.log(actionStack);
      console.log(index);
    }
    else{
      console.log("action duplicate")
    }

}

function exportCSV() {
    let params = '?year=' + year + '&minMortality=' + minMortality + '&maxMortality=' + maxMortality + '&minIncidents=' + minIncidents + '&maxIncidents=' + maxIncidents + '&minDeath=' + minDeath + '&maxDeath=' + maxDeath + '&incidentMortality=' + incidentMortality

    countries.forEach(function (country) {
        params += '&countries=' + country
    })

    window.location = "/api/exportcsv" + params
}

function triggerDownload(imgURI) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
    });

    var a = document.createElement('a');
    a.setAttribute('download', 'Export.png');
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');

    a.dispatchEvent(evt);
}

function exportImage(htmlId) {
    var svg = document.getElementById(htmlId);
    var canvas = document.getElementById('saveCanvas');
    canvas.height = svg.clientHeight;
    canvas.width = svg.clientWidth;
    var ctx = canvas.getContext('2d');
    var data = (new XMLSerializer()).serializeToString(svg);
    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    var url = DOMURL.createObjectURL(svgBlob);
    img.src = url;

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        var imgURI = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

        triggerDownload(imgURI);
    };

}

function setMortalitySlider() {
    var handleA = $(".mortality-rate-slider.lower-handle");
    var handleB = $(".mortality-rate-slider.upper-handle");

    $('.mortality-slider').slider({
        create: function (e, ui) {
            handleA.text(0);
            handleB.text(250);
        },
        slide: function (e, ui) {
            if (ui.values[0] == ui.values[1])
                return false;
            if ($(ui.handle).hasClass("upper-handle")) {
                handleB.text(ui.value);
                maxMortality = ui.value
            }
            else {
                handleA.text(ui.value);
                minMortality = ui.value
            }
        },
        orientation: 'horizontal',
        range: true,
        min: 0,
        max: 250,
        step: 5,
        values: [0, 250],
        animate: true
    });
}

function setIncidentsSlider() {
    var handleA = $(".incidents-rate-slider.lower-handle");
    var handleB = $(".incidents-rate-slider.upper-handle");

    $('.incidents-slider').slider({
        create: function (e, ui) {
            handleA.text(0);
            handleB.text(1000);
        },
        slide: function (e, ui) {
            if (ui.values[0] == ui.values[1])
                return false;
            if ($(ui.handle).hasClass("upper-handle")) {
                handleB.text(ui.value);
                maxIncidents = ui.value
            }
            else {
                handleA.text(ui.value);
                minIncidents = ui.value
            }
        },
        orientation: 'horizontal',
        range: true,
        min: 0,
        max: 1000,
        step: 10,
        values: [0, 1000],
        animate: true
    });
}

function setDeathPercentageSlider() {
    var handleA = $(".deathPercentage-rate-slider.lower-handle");
    var handleB = $(".deathPercentage-rate-slider.upper-handle");

    $('.deathPercentage-slider').slider({
        create: function (e, ui) {
            handleA.text(0);
            handleB.text(0.70);
        },
        slide: function (e, ui) {
            if (ui.values[0] == ui.values[1])
                return false;
            if ($(ui.handle).hasClass("upper-handle")) {
                handleB.text(ui.value);
                maxDeath = ui.value
            }
            else {
                handleA.text(ui.value);
                minDeath = ui.value
            }
        },
        orientation: 'horizontal',
        range: true,
        min: 0,
        max: 0.70,
        step: 0.05,
        values: [0, 0.70],
        animate: true
    });
}
var x = 0;

function setYearSlider() {

    var handleA = $(".year-rate-slider");

    var slider = $('.year-slider').slider({
        create: function (e, ui) {
            handleA.text(2000);
        },
        slide: function (e, ui) {
            handleA.text(ui.value);
            year = ui.value;
            applyFilter()
        },
        orientation: 'horizontal',
        min: 2000,
        max: 2015,
        step: 5,
        animate: true
    });


    function go() {
        slider.slider('value', slider.slider('value') + 5);
        handleA.text(slider.slider('value'));
        year = slider.slider('value');
        applyFilter();

        if (slider.slider('value') >= 2015) {
            moving = false;
            clearInterval(x);
            $('#playBtn').html("<i id=\"playIcon\" class=\"fas fa-play\"></i> Play")
        }
    }
    var moving = false;
    var x = 0;

    $('#playBtn').click(function () {

        var btn = $('#playBtn');

        if (moving) {
            moving = false;
            clearInterval(x);
            btn.html("<i id=\"playIcon\" class=\"fas fa-play\"></i> Play")

        } else {
            moving = true;
            if (slider.slider('value') >= 2015) {
                slider.slider('value', 2000);
                handleA.text(2000);
                year = 2000;
                applyFilter();
            }
            x = setInterval(go, 1000);
            btn.html("<i id=\"playIcon\" class=\"fas fa-pause\"></i> Pause")

        }
    });
}


function applyFilter(zoom) {
    //REDRAW MAP
    updateMap();
    if (zoom) {
        zoomMap();
    }
    //CLEAR LINE GRAPH MAYBE, WHO KNOWS

}

$('.btn-toggle').click(function () {
    if(incidentMortality == 'i'){
        incidentMortality = 'm'
        $('#mortality').addClass('btn-action-disabled-switch')
        $('#incidence').removeClass('btn-action-disabled-switch')

        $('#mapDisplayLabel').text('You have selected: Mortality Rate')
    }else{
        incidentMortality = 'i'
        $('#mortality').removeClass('btn-action-disabled-switch')
        $('#incidence').addClass('btn-action-disabled-switch')

        $('#mapDisplayLabel').text('You have selected: Incidence Rate')
    }


    setYearSlider()
    applyFilter()
});


function init() {
    setMortalitySlider()
    setIncidentsSlider()
    setDeathPercentageSlider()
    setYearSlider()
}

init()
