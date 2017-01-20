var Card = require('./models/card');
var UserInfo = require('./models/user_info');
var LocationInfo = require('./models/location_info');
var VisaInfo = require('./models/visa_info');

exports.ranker = function(cards, user, location) {

    cards.sort(function (card1, card2) {
        if(cardScore(card1, user, 111) > cardScore(card2, user, 111)) {
            return -1;
        } else {
            return 1;
        }
    });

    var i;
    var seenCards = [];
    for (i=0;i<cards.length;i++){
        var idx = user.seen_list.indexOf(cards[i]._id);
        if( idx > -1) {
            var seenCard = (cards.splice(i, 1))[0];
            seenCards.push(seenCard);    
            i--;
        }
    }
    
    var sortedCards = cards.concat(seenCards);

    
    return sortedCards;

}

function cardScore(card, user, location) {
    return card.created_at;
}



function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}



function addLocationInfo (cards, user, latitude, longitude) {
    return new Promise (function(resolve, reject) {
        LocationInfo.find({}, function(err, location_info_array){
            if (err) {
                reject(err);
            } else {
                var i;
                for (i=0;i<cards.length;i++) {
                    if(cards[i].location_info_id) {
                        var locationInfo = location_info_array.filter(function(value){return value._id==cards[i].location_info_id.toString();})[0];
                        cards[i].location_info_name = locationInfo.name;
                        cards[i].location_info_summary = locationInfo.summary;
                        cards[i].location_info_link = locationInfo.link;   
                    } else {
                        cards[i].location_info_name = "";
                        cards[i].location_info_summary = "";
                        cards[i].location_info_link = "";      
                    }


                    if (latitude!=500 && longitude!=500) {
                        var dist = parseInt(getDistanceFromLatLonInKm(latitude, longitude, cards[i].latitude, cards[i].longitude));
                        cards[i].distance = dist; 
                    }
                }

                resolve();            
            }
        });    
    });
}



function addVisaInfo (cards, user) {
   
    return new Promise (function(resolve, reject) {
   
        if (!user.nationality) {
            var i;
            for (i=0;i<cards.length;i++) {
                cards[i].visa_info = "Nationality needed";
            }      
            resolve();  
            return;
        }

        VisaInfo.findOne({'origin': user.nationality}, function(err, VisaInfo) {
            if (err) {
                reject(err);
            } else {
                for (i=0;i<cards.length;i++) {
                    var destination = cards[i].location.split(',')[1].trim();

                    if(user.nationality == destination) {
                        cards[i].visa_info = "Visa Not Required";
                    } else if (!VisaInfo) {
                        cards[i].visa_info = "Not available";
                    } else if(VisaInfo.visa_required.indexOf(destination) > -1) {
                        cards[i].visa_info = "Visa Required";
                    } else if(VisaInfo.not_required.indexOf(destination) > -1) {
                        cards[i].visa_info = "Visa Not Required";
                    } else if(VisaInfo.on_arrival.indexOf(destination) > -1) {
                        cards[i].visa_info = "Visa On Arrival";
                    } else if(VisaInfo.e_visa.indexOf(destination) > -1) {
                        cards[i].visa_info = "Electronic Visa Required";
                    } else {
                        cards[i].visa_info = "Unknown"
                    }
                }
                resolve();
                
            }
        });
    });
}



exports.addInfo = function(cards, user, latitude, longitude, callback) {


    var i;
    for (i=0;i<cards.length;i++) {
        //Checking if user likes the card    
        if (user.like_list.indexOf(cards[i]._id) > -1) {
            cards[i].is_liked = true;
        } else {
            cards[i].is_liked = false;
        }
         
        //Checking if user bucket listed the card
        if (user.bucket_list.indexOf(cards[i]._id) > -1) {
            cards[i].is_bucket_listed = true;
        } else {
            cards[i].is_bucket_listed = false;
        }       
    }


    Promise.all([
        addLocationInfo(cards,user,latitude,longitude),
        addVisaInfo(cards,user)
    ])
    .then(function() {
        callback(cards);
    })
    .catch(function(err) {
        console.log(err);
    });
   


    //callback(cards);

    /*Promise.all([
        getAllLocationInfoDB(),
        getVisaInfoDB(user.citizenship)
    ])
    .then(function(location_info_array) {
        var i;
        for (i=0;i<cards.length;i++) {
            //Checking if user likes the card    
            if (user.like_list.indexOf(cards[i]._id) > -1) {
                cards[i].is_liked = true;
            } else {
                cards[i].is_liked = false;
            }
             
            //Checking if user bucket listed the card
            if (user.bucket_list.indexOf(cards[i]._id) > -1) {
                cards[i].is_bucket_listed = true;
            } else {
                cards[i].is_bucket_listed = false;
            }       


            //Adding location info
            if(cards[i].location_info_id) {
                var locationInfo = location_info_array.filter(function(value){return value._id==cards[i].location_info_id.toString();})[0];
                //console.log(locationInfo.name);   
                cards[i].location_info_name = locationInfo.name;
                cards[i].location_info_summary = locationInfo.summary;
                cards[i].location_info_link = locationInfo.link;   
            } else {
                cards[i].location_info_name = "";
                cards[i].location_info_summary = "";
                cards[i].location_info_link = "";      
            }



            if (latitude!=500 && longitude!=500) {
                var dist = parseInt(getDistanceFromLatLonInKm(latitude, longitude, cards[i].latitude, cards[i].longitude));
                
                cards[i].distance = dist; 
                //console.log(latitude + " " + longitude + " " + cards[i].latitude + " " + cards[i].longitude + " " + cards[i].distance);

            }
        }
        callback(cards);

    }).catch(function(err) {
        console.log(err);
        callback(cards);
    });*/


    
    /*LocationInfo.find({}, function(err, location_info_array){
        if (err) {
            console.log(err);
            callback(cards);
            //return cards;
        } else {

            var i;
            for (i=0;i<cards.length;i++) {
                //Checking if user likes the card    
                if (user.like_list.indexOf(cards[i]._id) > -1) {
                    cards[i].is_liked = true;
                } else {
                    cards[i].is_liked = false;
                }
                 
                //Checking if user bucket listed the card
                if (user.bucket_list.indexOf(cards[i]._id) > -1) {
                    cards[i].is_bucket_listed = true;
                } else {
                    cards[i].is_bucket_listed = false;
                }       


                //Adding location info
                if(cards[i].location_info_id) {
                    var locationInfo = location_info_array.filter(function(value){return value._id==cards[i].location_info_id.toString();})[0];
                    //console.log(locationInfo.name);   
                    cards[i].location_info_name = locationInfo.name;
                    cards[i].location_info_summary = locationInfo.summary;
                    cards[i].location_info_link = locationInfo.link;   
                } else {
                    cards[i].location_info_name = "";
                    cards[i].location_info_summary = "";
                    cards[i].location_info_link = "";      
                }



                if (latitude!=500 && longitude!=500) {
                    var dist = parseInt(getDistanceFromLatLonInKm(latitude, longitude, cards[i].latitude, cards[i].longitude));
                    

                    //console.log(roundedDist);
                    
                    cards[i].distance = dist; 
                    //console.log(latitude + " " + longitude + " " + cards[i].latitude + " " + cards[i].longitude + " " + cards[i].distance);
    
                }
            }
            //console.log(cards);          
            callback(cards);
            //return cards;
        }


    });*/

}

