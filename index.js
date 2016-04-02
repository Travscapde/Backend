var express = require("express");
var app = express();
var router = require('./api');

app.use('/api', router);

// Listen to this Port
app.listen(8080, function() {
    console.log("Live at Port 8080");
});