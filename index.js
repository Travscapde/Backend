var express = require("express");
var cors = require('cors')
var app = express();
app.use(cors());
app.options('*', cors());
var router = require('./api');

//start db
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/myappdatabase');
mongoose.Promise = global.Promise;
var authInfo = require("./auth_info.json");
var options = authInfo.dp_options;
mongoose.connect('mongodb://127.0.0.1:27017/mytestdatabase', options);

//Enable error reporting
var bugsnag = require("bugsnag");
bugsnag.register("c669659b4c3d3c6f1194f3e3937a44c5");

//support posting
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '10mb'}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '10mb',
    extended: true
}));
app.use(bodyParser.raw({limit: '10mb'}));
app.use('/api', router);

// Listen to this Port
app.listen(8080, function () {
    console.log("Live at Port 8080");
});
