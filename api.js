var express = require('express');
var router = express.Router();
var winston = require('winston');

var mongoose = require('mongoose');
var User = require('./models/user');

//var db_manager = require('./db-manager.js');
//var db = new db_manager();

var dummy = require('./dummy.js');
var dummyInstance = new dummy();

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
    res.json(dummyInstance.getImages());
});

router.get("/getImage", function(req, res) {
    res.json(dummyInstance.getImage());
});

router.get("/getCards", function(req, res) {
    res.json(dummyInstance.getCards());
});


router.get("/add-user", function(req, res) {

    mongoose.connect('mongodb://localhost/myappdatabase');
    // create a new user
    var newUser = User({
        name: 'Peter Quill',
        username: 'starlord555',
        password: 'password',
        admin: true
    });

//handle duplicate users
//send error if user already added  

    // save the user
    newUser.save(function(err) {
        if (err) {
            res.json({ 'message': 'Error creating User' });
        } else {
            res.json({ 'message': 'Added User!' });
            console.log('User created!');
        }
    });
});


module.exports = router;