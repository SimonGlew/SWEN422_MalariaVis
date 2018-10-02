var express = require('express');
var app = express();
var config = require('./config')

app.use('/', express.static(__dirname + '/public'));

app.listen(config.port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log(`server is listening on ${config.port}`)
})
