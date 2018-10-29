var actionStack = [],
    index = 0


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
}

function exportCSV() {

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
            }
            else {
                handleA.text(ui.value);
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
            }
            else {
                handleA.text(ui.value);
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
            }
            else {
                handleA.text(ui.value);
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

setMortalitySlider()
setIncidentsSlider()
setDeathPercentageSlider()
