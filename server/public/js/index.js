var actionStack = [],
    index = 0

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

        $('.mortality-slider').slider("values", 0, action.minMortality)
        $(".mortality-rate-slider.lower-handle").text(action.minMortality)
        $('.mortality-slider').slider("values", 1, action.maxMortality)
        $(".mortality-rate-slider.upper-handle").text(action.maxMortality)


        $('.incidents-slider').slider("values", 0, action.minIncidents)
        $(".incidents-rate-slider.lower-handle").text(action.minIncidents)
        $('.incidents-slider').slider("values", 1, action.maxIncidents)
        $(".incidents-rate-slider.upper-handle").text(action.maxIncidents)

        $('.deathPercentage-slider').slider("values", 0, action.minDeath)
        $(".deathPercentage-rate-slider.lower-handle").text(action.minDeath)
        $('.deathPercentage-slider').slider("values", 1, action.maxDeath)
        $(".deathPercentage-rate-slider.upper-handle").text(action.maxDeath)


        $('.year-slider').slider('value', action.year)
        $(".year-rate-slider").text(action.year)

        //Do something with incidentMortality
        if (action.incidentMortality == 'i') {
            $('#incidence').removeClass('btn-action')
            $('#mortality').addClass('btn-action')
            $('#mortality').removeClass('btn-action-selected-switch')
        } else {
            $('#incidence').removeClass('btn-action-selected-switch')
            $('#incidence').addClass('btn-action')
            $('#mortality').removeClass('btn-action')
        }


        year = action.year
        minMortality = action.minMortality
        maxMortality = action.maxMortality
        minIncidents = action.minIncidents
        maxIncidents = action.maxIncidents
        minDeath = action.minDeath
        maxDeath = action.maxDeath

        countries = action.countries
        incidentMortality = action.incidentMortality

        //redraw things
        applyFilter(true)

        $('#redo').removeClass('btn-action-disabled')
        $('#redo').removeAttr('disabled')

    }
    else if(index == 0){
      clearFilters();
      $('#undo').attr('disabled','disabled')
      $('#undo').addClass('btn-action-disabled')

    }
}

function redoAction() {
    if (index < actionStack.length - 1) {
        let action = JSON.parse(actionStack[++index])

        $('.mortality-slider').slider("values", 0, action.minMortality)
        $(".mortality-rate-slider.lower-handle").text(action.minMortality)
        $('.mortality-slider').slider("values", 1, action.maxMortality)
        $(".mortality-rate-slider.upper-handle").text(action.maxMortality)


        $('.incidents-slider').slider("values", 0, action.minIncidents)
        $(".incidents-rate-slider.lower-handle").text(action.minIncidents)
        $('.incidents-slider').slider("values", 1, action.maxIncidents)
        $(".incidents-rate-slider.upper-handle").text(action.maxIncidents)

        $('.deathPercentage-slider').slider("values", 0, action.minDeath)
        $(".deathPercentage-rate-slider.lower-handle").text(action.minDeath)
        $('.deathPercentage-slider').slider("values", 1, action.maxDeath)
        $(".deathPercentage-rate-slider.upper-handle").text(action.maxDeath)


        $('.year-slider').slider('value', action.year)
        $(".year-rate-slider").text(action.year)

        //Do something with incidentMortality
        if (action.incidentMortality == 'i') {
            $('#incidence').removeClass('btn-action')
            $('#mortality').addClass('btn-action')
            $('#mortality').removeClass('btn-action-selected-switch')
        } else {
            $('#incidence').removeClass('btn-action-selected-switch')
            $('#incidence').addClass('btn-action')
            $('#mortality').removeClass('btn-action')
        }


        year = action.year
        minMortality = action.minMortality
        maxMortality = action.maxMortality
        minIncidents = action.minIncidents
        maxIncidents = action.maxIncidents
        minDeath = action.minDeath
        maxDeath = action.maxDeath

        countries = action.countries
        incidentMortality = action.incidentMortality

        //redraw things
        applyFilter(true)

        $('#undo').removeClass('btn-action-disabled')
        $('#undo').removeAttr('disabled')
        if (index == actionStack.length - 1) {
            $('#redo').addClass('btn-action-disabled')
            $('#redo').attr('disabled','disabled')
        }
    }
    console.log('redoing action')
}

function clearFilters() {
    $('.mortality-slider').slider("values", 0, 0)
    $(".mortality-rate-slider.lower-handle").text(0)
    $('.mortality-slider').slider("values", 1, 250)
    $(".mortality-rate-slider.upper-handle").text(250)


    $('.incidents-slider').slider("values", 0, 0)
    $(".incidents-rate-slider.lower-handle").text(0)
    $('.incidents-slider').slider("values", 1, 1000)
    $(".incidents-rate-slider.upper-handle").text(1000)

    $('.deathPercentage-slider').slider("values", 0, 0)
    $(".deathPercentage-rate-slider.lower-handle").text(0)
    $('.deathPercentage-slider').slider("values", 1, 0.70)
    $(".deathPercentage-rate-slider.upper-handle").text(0.70)


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

    $('#redo').addClass('btn-action-disabled')
    $('#redo').attr('disabled','disabled')
    $('#undo').addClass('btn-action-disabled')
    $('#undo').attr('disabled','disabled')

}

function submit() {
    console.log('submit')

    actionStack.push(JSON.stringify({
        incidentMortality: incidentMortality,
        year: year,
        minMortality: minMortality,
        maxMortality: maxMortality,
        minIncidents: minIncidents,
        maxIncidents: maxIncidents,
        minDeath: minDeath,
        maxDeath: maxDeath,
        countries: countries
    }))

    $('#undo').removeClass('btn-action-disabled')
    $('#undo').removeAttr('disabled')

    index = actionStack.length - 1

    applyFilter(true)
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

function doSwitch(selected) {
    /* Do nothing (don't toggle) if already selected */
    if (incidentMortality == selected) {
        return;
    }
    incidentMortality = selected
    if (selected == 'i'){
        $('#mortality').removeClass('btn-action-selected-switch')
        $('#incidence').addClass('btn-action-selected-switch')
    } else {
        $('#mortality').addClass('btn-action-selected-switch')
        $('#incidence').removeClass('btn-action-selected-switch')
    }

    setYearSlider()
    applyFilter()

}

function init() {
    setMortalitySlider()
    setIncidentsSlider()
    setDeathPercentageSlider()
    setYearSlider()
}

init()
