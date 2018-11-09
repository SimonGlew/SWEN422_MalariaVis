/**
 * Defining cached variables for data to be stored within
 */
var incidenceMap = {},
    mortalityMap = {},
	listOfCountries = []
	
/**
 * Adds a CSV row Object containing the values into the incidence map and country list if required
 * 
 * @param {Row} blob - row to be added 
 */
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

/**
 * Adds a CSV row Object containing the values into the mortality map and country list if required
 * 
 * @param {Row} blob - row to be added 
 */
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

/**
 * Returns the map of incidences
 */
function getIncidences(){
    return incidenceMap
}

/**
 * Returns the map of mortality
 */
function getMortality(){
    return mortalityMap
}

/**
 * Returns the list of countries
 */
function getCountries(){
    return listOfCountries
}

/**
 * Gets the CSV download from the filters
 * 
 * @param {*} req - Request of express 
 * @param {*} res - Response of express
 */
function getFilteredData(req, res){
    let incidenceRates = this.getIncidences()
	let mortalityRates = this.getMortality()

	//filter countries out that arent in query and get their incidence rate
	let filteredCountries = []
	Object.keys(incidenceRates).forEach(r => {
		let dat = Object.assign({ country: r }, { data: incidenceRates[r] })
		if(req.query.countries){
			if(req.query.countries.indexOf(r) != -1){
				filteredCountries.push(dat)
			}
		}else{
			filteredCountries.push(dat)
		}
	})

	//add mortality rate for each year to filtered countries list
	Object.keys(mortalityRates).forEach(r => {
		let index = filteredCountries.map(c => c.country).indexOf(r)
		if(index != -1){
			let countryData = filteredCountries[index].data
			let newData = []
			countryData.forEach(incidence => {
				mortalityRates[r].forEach(mortality => {
					if(incidence.year == mortality.year){
						newData.push({ year: incidence.year, incidence: parseFloat(incidence.Value), mortality: parseFloat(mortality.Value) })
					}
				})
			})
			filteredCountries[index].data = newData
		}
	})

	//filter out years for countries that dont meet requirements
	filteredCountries.forEach(country => {
		country.data = country.data.filter(data => {
			let death = data.incidence != 0 ? data.mortality / data.incidence : 0
			return death >= parseInt(req.query.minDeath) && death <= parseInt(req.query.maxDeath) &&
				data.incidence >= parseInt(req.query.minIncidents) && data.incidence <= parseInt(req.query.maxIncidents) &&
				data.mortality >= parseInt(req.query.minMortality) && data.mortality <= parseInt(req.query.maxMortality);
		})
	})

	//filter out countries that now have no data
    filteredCountries = filteredCountries.filter(r => r.data.length > 0)
    
    return filteredCountries
}


module.exports = {
    addIncidenceToMap: addIncidenceToMap,
    addMortalityToMap: addMortalityToMap,

    getIncidences: getIncidences,
    getMortality: getMortality,
    getCountries: getCountries,

    getFilteredData: getFilteredData
}