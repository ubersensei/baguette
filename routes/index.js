var express = require('express');

//var app = require('./../server').app;
var passport = require('./../server').passport;
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


module.exports = router;
