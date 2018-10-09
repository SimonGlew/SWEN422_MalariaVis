var express = require('express');

var router = express.Router();
var route = function(nav){

	//Redirect '/' path to '/week'
	router.route('/').get(function(req, res){
		res.sendFile('index.html');
	});

	return router
}

module.exports = route;
