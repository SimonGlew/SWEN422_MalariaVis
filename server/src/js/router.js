const express = require('express');

const dataHandler = require('../../handlers/dataHandler'),
	parserHandler = require('../../handlers/parserHandler')

var router = express.Router();


router.get('/', (req, res) => {
	res.render('index');
});

//Get countries
router.get('/api/countriesList', (req, res) => {
	let data = dataHandler.getCountries()
	res.send(data)
})

//Get incidences from countries or all
router.get('/api/incidenceRates', (req, res) => {
	requested_countries = req.query.countries
	if (requested_countries == undefined) {
		// No specific country was requested so return all of the data
		res.send(dataHandler.getIncidences())
	} else {
		requested_countries_data = []
		if (!Array.isArray(requested_countries)) requested_countries = [requested_countries]
		Object.keys(dataHandler.getIncidences()).filter(r => requested_countries.indexOf(r) != -1).forEach(country => {
			requested_countries_data.push({
				key: country,
				value: dataHandler.getIncidences()[country]
			});
		})
		res.send(requested_countries_data)
	}
})

//Get mortality from countries or all
router.get('/api/mortalityRates', (req, res) => {
	requested_countries = req.query.countries
	if (requested_countries == undefined) {
		// No specific country was requested so return all of the data
		res.send(dataHandler.getMortality())
	} else {
		requested_countries_data = []
		if (!Array.isArray(requested_countries)) requested_countries = [requested_countries]
		Object.keys(dataHandler.getMortality()).filter(r => requested_countries.indexOf(r) != -1).forEach(country => {
			requested_countries_data.push({
				key: country,
				value: dataHandler.getMortality()[country]
			});
		})
		res.send(requested_countries_data)
	}
})

//CSV download for filtered data
router.get('/api/exportcsv', (req, res) => {
	console.log(req.query)
	let data = dataHandler.getFilteredData(req, res)
	if (data.length) {
		let csv = parserHandler.turnDataToCSV(data).trim()

		res.set({ 'Content-Disposition': 'attachment; filename=data.csv', 'Content-Type': 'text/csv' })
		res.status(200).send(csv);
	}
})

module.exports = router;
