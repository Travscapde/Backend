var Card = require('./models/card');
var UserInfo = require('./models/user_info');
var LocationInfo = require('./models/location_info');

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



exports.addInfo = function(cards, user, latitude, longitude, callback) {

    
    LocationInfo.find({}, function(err, location_info_array){
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
                } else {
                    cards[i].location_info_name = "";
                    cards[i].location_info_summary = "";   
                }

                if (latitude!=500 && longitude!=500) {
                    var dist = parseInt(getDistanceFromLatLonInKm(latitude, longitude, cards[i].latitude, cards[i].longitude));
                    var roundedDist;
                    
                    if (dist < 100)
                        roundedDist = Math.round(dist / 10) * 10;
                    else if (dist < 500)
                        roundedDist = Math.round(dist / 50) * 50;
                    else if (dist < 1000)
                        roundedDist = Math.round(dist / 100) * 100;
                    else if (dist < 5000)
                        roundedDist = Math.round(dist / 500) * 500;
                    else 
                        roundedDist = Math.round(dist / 1000) * 1000;

                    //console.log(roundedDist);
                    
                    cards[i].distance = roundedDist; 
                    //console.log(latitude + " " + longitude + " " + cards[i].latitude + " " + cards[i].longitude + " " + cards[i].distance);
    
                }



            }
            //console.log(cards);          
            callback(cards);
            //return cards;
        }
    });

}

