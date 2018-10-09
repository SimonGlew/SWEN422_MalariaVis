var incidenceMap = {},
    mortalityMap = {},
    listOfCountries = []
function addIncidenceToMap(blob) {
    let index = listOfCountries.map(r => r.entity).indexOf(blob.Entity)

    if (index == -1) {
        listOfCountries.push({ entity: blob.Entity, code: blob.Code })
    }

    if (!incidenceMap[blob.Code]) {
        incidenceMap[blob.Code] = []
    }
    incidenceMap[blob.Code].push({ year: blob.Year, Value: blob.Value })
}

function addMortalityToMap(blob) {
    let index = listOfCountries.map(r => r.entity).indexOf(blob.Entity)

    if (index == -1) {
        listOfCountries.push({ entity: blob.Entity, code: blob.Code })
    }

    if (!mortalityMap[blob.Code]) {
        mortalityMap[blob.Code] = []
    }
    mortalityMap[blob.Code].push({ year: blob.Year, Value: blob.Value })
}

function getIncidences(){
    return incidenceMap
}

function getMortality(){
    return mortalityMap
}

function getCountries(){
    return listOfCountries
}


module.exports = {
    addIncidenceToMap: addIncidenceToMap,
    addMortalityToMap: addMortalityToMap,

    getIncidences: getIncidences,
    getMortality: getMortality,
    getCountries: getCountries
}