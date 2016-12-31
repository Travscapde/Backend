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





exports.addInfo = function(cards, user, callback) {

    
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

            }
            //console.log(cards);          
            callback(cards);
            //return cards;
        }
    });

}

