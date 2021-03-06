var express = require('express');

var app = express();
var server = require('http').Server(app);

var config = require('./config')

var parser = require('./handlers/parserHandler')

app.use(express.static(__dirname + '/public'));

var router = require('./src/js/router')
app.set('views', './public');

app.use('/', router);

server.listen(config.port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log(`server is listening on ${config.port}`)
	parser.parse(__dirname)
})
