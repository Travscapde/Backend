var express = require('express');
var router = express.Router();
var winston = require('winston');

//setup logger
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './logs/routes.log' })
    ]
});

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    logger.info(req.originalUrl);
    next();
});

// define the home page route
router.get('/', function(req, res) {
    res.json({ 'message': 'Travent API home' });
});

// define the about route
router.get('/about', function(req, res) {
    res.json({ 'message': 'Welcome to TravnetDiscover Backend!' });
});

router.get("/getImages", function(req, res) {
    var imgs = ["https://s3-ap-southeast-1.amazonaws.com/travnet/1.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/2.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/3.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/4.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/5.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/6.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/7.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/8.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/9.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/10.jpg"]

    res.json({ "image": imgs });
});

router.get("/getImage", function(req, res) {
    var imgs = ["https://s3-ap-southeast-1.amazonaws.com/travnet/1.jpg"];
    res.json({ "image": imgs });
});

module.exports = router;