var actionStack = [],
    index = 0

var incidentMortality = 'm',
    year = 2000,
    minMortality = 0,
    maxMortality = 250,
    minIncidents = 0,
    maxIncidents = 1000,
    minDeath = 0,
    maxDeath = 100,
    countries = []

function undoAction() {
    console.log('undoing action')
    if (index > 0) {
        let action = actionStack[index]
        index--;

        //do something with action
    }
}

function redoAction() {
    if (index < actionStack.length) {
        let action = actionStack[index]
        index++;

        //do something with action
    }
    console.log('redoing action')
}

function clearFilters() {
    console.log('clearing filtes')
}

function submit() {
    console.log('submit')
    applyFilter(true)
}

function exportCSV() {
    let params = '?year=' + year + '&minMortality=' + minMortality + '&maxMortality=' + maxMortality + '&minIncidents=' + minIncidents + '&maxIncidents=' + maxIncidents + '&minDeath=' + minDeath + '&maxDeath=' + maxDeath + '&incidentMortality=' + incidentMortality

    countries.forEach(function (country) {
        params += '&countries=' + country
    })

    window.location = "/api/exportcsv" + params
}

function exportImage(htmlId) {

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
            handleB.text(100);
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
        max: 100,
        step: 5,
        values: [0, 100],
        animate: true
    });
}

function setYearSlider() {
    var handleA = $(".year-rate-slider");
      $('.year-slider').slider({
          create: function (e, ui) {
              handleA.text(2000);
          },
          slide: function (e, ui) {
              handleA.text(ui.value);
              year = ui.value
              applyFilter()
          },
          orientation: 'horizontal',
          min: 2000,
          max: 2015,
          step: 5,
          animate: true
      });
}


function applyFilter(zoom) {
    //REDRAW MAP
    updateMap();
    if(zoom){
      zoomMap();
    }
    //CLEAR LINE GRAPH MAYBE, WHO KNOWS

}

$('.btn-toggle').click(function () {
    if ($(this).find('.btn-action').length > 0) {
        $(this).find('.btn').toggleClass('btn-action');
        incidentMortality = (incidentMortality == 'i' ? 'm' : 'i')
        setYearSlider()
    }
    $(this).find('.btn').toggleClass('btn-default');
    applyFilter()
});


function init() {
    setMortalitySlider()
    setIncidentsSlider()
    setDeathPercentageSlider()
    setYearSlider()
}

init()
