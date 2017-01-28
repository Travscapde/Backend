var express = require('express');
var router = express.Router();
var winston = require('winston');

var mongoose = require('mongoose');
var UserInfo = require('./models/user_info');
var Card = require('./models/card');
var CardFunctions = require('./cardFunctions.js');
var gatherLocationInfo = require('./gatherLocationInfo.js');
var getLocationScore = require('./gatherWeatherInfo.js');
var fs = require('fs');

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
    res.json({ 'message': 'Travent API home  Hassan' });
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
    Card.find({}).sort({ created_at: 'desc' }).exec(function (err, cards) {
        res.json({ "cards": cards });
    });
});


router.post("/getCards", function (req, res) {
    //console.log(req.body.latitude);
    //console.log(req.body.longitude);
    
    
    Card.find().lean().exec(function (err, cards) {
        if (err) {
            console.log(err);
            res.json({ "message": "unable to fetch cards" });
        } else {
            if (typeof req.body.user_id == 'undefined') {
                console.log("No User ID");
                res.json({ "cards": cards });        
            } else {    
                UserInfo.find({"_id" : req.body.user_id}, function(err, users) {
                    if (err) {
                        console.log(err);
                        res.json({ "message": "unable to fetch user" });
                    } else {
                        var sortedCards = CardFunctions.ranker(cards, users[0], req.body.location);
                        //console.log(sortedCards.length);
                        CardFunctions.addInfo(sortedCards, users[0], req.body.latitude, req.body.longitude, function(finalCards) {
                            res.json({ "cards": finalCards });
                        });
                                
                    } 

                });
            }
            
        }
    })
});


router.get("/getSecretKey", function (req, res) {
    var file = __dirname + '/aws.json';
    res.sendFile(file);
});

router.get("/getInterests", function (req, res) {

    res.json({
        "interests": [
            { "interest": "Aerial view" },
            { "interest": "Architecture" },
            { "interest": "Biking" },
            { "interest": "Boat Ride" },
            { "interest": "Hiking" },
            { "interest": "Diving" },
            { "interest": "Camping" },
            { "interest": "Caving" },
            { "interest": "Cruise" },
            { "interest": "Cycling" },
            { "interest": "Desert" },
            { "interest": "Festival" },
            { "interest": "Fishing" },
            { "interest": "Foodie" },
            { "interest": "Heritage" },
            { "interest": "Kayaking" },
            { "interest": "Lake" },
            { "interest": "Landscape" },
            { "interest": "Massage" },
            { "interest": "Mountain" },
            { "interest": "Party" },
            { "interest": "Road Trip" },
            { "interest": "Sailing" },
            { "interest": "Sailing" },
            { "interest": "Sea Beach" },
            { "interest": "Snorkelling" },
            { "interest": "Surfing" },
            { "interest": "Thrill" },
            { "interest": "Train Ride" },
            { "interest": "Trekking" },
            { "interest": "Winter Sports" },
            { "interest": "Water Sports" },
            { "interest": "Waterfall" },
            { "interest": "Wildlife" },
            { "interest": "Yoga" },
            { "interest": "Others" }]
    });
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

/*router.post("/likeCard", function (req, res) {
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
});*/


router.post("/likeCard", function (req, res) {
    //console.log(req.body);
    UserInfo.findById(req.body.user_id, function (err, searchedUser) {
        if (!searchedUser) {
            res.json({ 'message': 'user_id not found' });
            return 0;
        } else {
            Card.findById(req.body.card_id, function (err, searchedCard) {
                if (!searchedCard) {
                    res.json({ 'message': 'card_id not found' });
                    return 0;
                } else {
                    //console.log(searchedCard.likes);
                    searchedCard.likes = searchedCard.likes + 1;
                    //console.log(searchedCard.likes);
                    searchedCard.save();
                    //console.log(searchedUser.like_list.length);
                    searchedUser.like_list.push(req.body.card_id);
                    //console.log(searchedUser.like_list.length);
                    searchedUser.save();
                    res.json(searchedCard);
                }
            });

            
        }
    });


});




router.post("/seenCard", function (req, res) {
    //console.log(req.body);
    UserInfo.findById(req.body.user_id, function (err, searchedUser) {
        if (!searchedUser) {
            res.json({ 'message': 'user_id not found' });
            return 0;
        } else {
            if (searchedUser.seen_list.indexOf(req.body.card_id) > -1) {
                //console.log("duplicate");
            } else {
                searchedUser.seen_list.push(req.body.card_id);
                searchedUser.save();
            }
            res.json(searchedUser);
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
        citizenship: req.body.citizenship,
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

router.post("/subscribe", function (req, res) {
    var email = req.body.email;
    fs.appendFile('subscribers.txt', email + ' ', function (err) {

        if (!err){
            res.json({ 'message': email });
        }
        else {
            console.log(err);
            res.json({ 'message': 'Error adding subscriber' });
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


router.post("/registerNationality", function (req, res) {
    var userId = req.body.user_id;
    var nationality = req.body.nationality;

    UserInfo.findById(userId, function (err, searchedUser) {
        if (!searchedUser)
            res.json('user_id not found');
        else {
            searchedUser.updated_at = new Date();
            searchedUser.nationality = nationality;
            searchedUser.save(function (err) {
                if (err)
                    res.json({ "message": "Error updating user interest" });
                else
                    res.json({ "nationality": nationality });
            });
        }
    });
});


router.post("/registerCard", function (req, res) {
    var newCard = Card({
        card_type: req.body.card_type,
        location: req.body.location,
        location_id: req.body.location_id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        user_info_id: req.body.user_id,
        url: req.body.url,
        thumbnail: req.body.thumbnail,
        title: req.body.title,
        description: req.body.description,
        interests: req.body.interests
    });

    //console.log(req.body.latitude + ", " + req.body.longitude);

    UserInfo.findById(req.body.user_id, function (err, searchedUser) {
        if (!searchedUser) {
            res.json({ 'message': 'user_id not found' });
            return 0;
        } else {
            newCard.user_profile_pic = searchedUser.profile_pic;
            newCard.user_home = searchedUser.home;
            newCard.user_name = searchedUser.name;

            newCard.save(function (err, savedCard) {
                if (err) {
                    res.json({ "message": err });
                } else {
                    gatherLocationInfo(savedCard._id, savedCard.title, savedCard.location.split(',')[0], function(location, extract){
                        console.log(location + " : " + extract);
                    });
                    getLocationScore(savedCard);
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
