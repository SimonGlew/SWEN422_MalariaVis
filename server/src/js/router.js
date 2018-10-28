const express = require('express');

const dataHandler = require('../../handlers/dataHandler')

var router = express.Router();


router.get('/', (req, res) => {
	res.render('index');
});

router.get('/api/countriesList', (req, res) => {
	let data = dataHandler.getCountries()
	res.send(data)
})


module.exports = router;
