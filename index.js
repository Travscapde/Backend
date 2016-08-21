var express = require("express");
var app = express();
var router = require('./api');

//start db
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/myappdatabase');
mongoose.connect('mongodb://54.169.51.25:27017/mytestdatabase');

//support posting
var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use('/api', router);

// Listen to this Port
app.listen(8080, function () {
    console.log("Live at Port 8080");
});