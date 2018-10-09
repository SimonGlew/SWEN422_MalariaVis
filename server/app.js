var express = require('express');

var app = express();
var config = require('./config')

var router = require('./src/js/router')();
app.use(express.static('public'));
app.set('views', './src/views');
app.set('view engine', 'html');
app.use('/', router);

app.listen(config.port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log(`server is listening on ${config.port}`)
})
