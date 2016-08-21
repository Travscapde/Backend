var express = require('express');
var router = express.Router();
var winston = require('winston');

var mongoose = require('mongoose');
var UserInfo = require('./models/user_info');
var Card = require('./models/card');

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
router.get('/', function (req, res) {
    res.json({ 'message': 'Travent API home' });
});

// define the about route
router.get('/about', function (req, res) {
    res.json({ 'message': 'Welcome to TravnetDiscover Backend!' });
});

router.get("/getImages", function (req, res) {
    res.json(dummyInstance.getImages());
});

router.get("/getImage", function (req, res) {
    res.json(dummyInstance.getImage());
});

router.get("/getCards", function (req, res) {
    Card.find({}, function (err, users) {
        /*        var userMap = {};
        
                users.forEach(function (user) {
                    userMap[user._id] = user;
                });
        */
        res.json({ "cards": users });
    });
});

router.get("/getSecretKey", function (req, res) {
    var file = __dirname + '/aws.json';
    res.sendFile(file);
});

router.get("/getInterests", function (req, res) {
    res.json({ "interests": [{ "interest": "Surfing" }, { "interest": "Diving" }, { "interest": "Biking" }, { "interest": "Yoga" }, { "interest": "Sight-seeing" }] });
});

router.post("/getUserInfo", function (req, res) {
    UserInfo.findById(req.body.user_id, function (err, searchedUser) {
        if (err) {
            res.json({ "message": "user not found" });
        } else {
            res.json(searchedUser);
        }
    });
});

router.post("/getUserPhotoCount", function (req, res) {
    UserInfo.findById(req.body.user_id, function (err, searchedUser) {
        if (err) {
            res.json({ "message": "user not found" });
        } else {
            //found user
            var count = searchedUser.photo_count;
            res.json({ "count": count });
        }
    });
});

router.post("/likeCard", function (req, res) {
    Card.findById(req.body.card_id, function (err, searchedCard) {
        if (!searchedCard) {
            res.json({ 'message': 'card_id not found' });
            return 0;
        } else {
            //check if user_id exists before adding
            searchedCard.like_list.push(req.body.user_id);
            searchedCard.likes = searchedCard.likes + 1;
            searchedCard.save();
            res.json(searchedCard);
        }
    });
});

router.post("/addToBucket", function (req, res) {
    Card.findById(req.body.card_id, function (err, searchedCard) {
        if (!searchedCard) {
            res.json({ 'message': 'card_id not found' });
            return 0;
        } else {
            UserInfo.findById(req.body.user_id, function (err, searchedUser) {
                if (!searchedUser)
                    res.json('user_id not found');
                else {
                    searchedUser.bucket_list.push(req.body.card_id);
                    searchedCard.bucket_users.push(req.body.user_id);
                    searchedCard.bucket_count = searchedCard.bucket_count + 1;
                    searchedCard.save();
                    searchedUser.save();
                    res.json(searchedCard);
                }
            });
        }
    });
});

router.post("/getBucketList", function (req, res) {
    UserInfo.findById(req.body.user_id, function (err, searchedUser) {
        if (!searchedUser) {
            res.json({ 'message': 'user_id not found' });
            return 0;
        } else {
            var cards = searchedUser.bucket_list;
            var cardObjectIds = [];
            cards.forEach(function (card_id) {
                cardObjectIds.push(mongoose.Types.ObjectId(card_id));
            });
            Card.find({ '_id': { $in: cardObjectIds } }, function (err, bucket_cards) {
                res.send({ "bucket_list": bucket_cards });
            });
        }
    });
});

router.post("/getUserCards", function (req, res) {
    var id = mongoose.Types.ObjectId(req.body.user_id);

    Card.find({ "user_info_id": id }, function (err, cards) {
        if (err) return res(err);
        if (cards) {
            res.json({ "cards": cards });
        } else {
            res.send({ 'message': 'no user cards found' });
        }
    });
});

// assuming POST: name=foo&color=red            <-- URL encoding
// or       POST: {"name":"foo","color":"red"}  <-- JSON encoding
router.post("/registerUser", function (req, res) {
    var newUserInfo = UserInfo({
        name: req.body.name,
        email: req.body.email,
        date_of_birth: req.body.age,
        home: req.body.home,
        living_in: req.body.living_in,
        profile_pic: req.body.profile_pic,
        facebook_id: req.body.facebook_id
    });

    UserInfo.findOne({ 'email': req.body.email }, function (err, searchedUser) {
        if (err) {
            res.json({ 'message': 'Error creating user' });
        } else {
            if (searchedUser) {
                res.json({ "user_id": searchedUser._id });
            } else {
                newUserInfo.save(function (err) {
                    if (err) {
                        res.json({ 'message': 'Error creating user, possibly duplicate' });
                    } else {
                        res.json({ "user_id": newUserInfo._id });
                    }
                });
            }
        }
    });
});

router.post("/registerInterests", function (req, res) {
    var userId = req.body.user_id;
    var interestList = req.body.interests;

    UserInfo.findById(userId, function (err, searchedUser) {
        if (!searchedUser)
            res.json('user_id not found');
        else {
            searchedUser.updated_at = new Date();
            searchedUser.interests = interestList;
            searchedUser.save(function (err) {
                if (err)
                    res.json({ "message": "Error updating user interest" });
                else
                    res.json({ "interests": interestList });
            });
        }
    });
});

router.post("/registerCard", function (req, res) {
    var newCard = Card({
        card_type: req.body.card_type,
        location: req.body.location,
        location_id: req.body.location_id,
        user_info_id: req.body.user_id,
        url: req.body.url,
        thumbnail: req.body.thumbnail,
        title: req.body.title,
        description: req.body.description,
        interests: req.body.interests
    });


    UserInfo.findById(req.body.user_id, function (err, searchedUser) {
        if (!searchedUser) {
            res.json({ 'message': 'user_id not found' });
            return 0;
        } else {
            newCard.user_profile_pic = searchedUser.profile_pic;
            newCard.user_home = searchedUser.home;
            newCard.user_name = searchedUser.name;

            newCard.save(function (err) {
                if (err) {
                    res.json({ "message": err });
                } else {
                    if (req.body.card_type == "photo") {
                        searchedUser.photo_count = searchedUser.photo_count + 1;
                        searchedUser.save();
                    }
                    res.json(newCard);
                }
            });
        }
    });

});

module.exports = router;
