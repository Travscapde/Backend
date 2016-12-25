var Card = require('./models/card');
var UserInfo = require('./models/user_info');

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





exports.addInfo = function(cards, user) {
    //console.log(user.like_list);
    var i;
    for (i=0;i<cards.length;i++) {
        //console.log(cards[i]._id);
        if (user.like_list.indexOf(cards[i]._id) > -1) {
            cards[i].is_liked = true;
        } else {
            cards[i].is_liked = false;
        }
         
        if (user.bucket_list.indexOf(cards[i]._id) > -1) {
            cards[i].is_bucket_listed = true;
        } else {
            cards[i].is_bucket_listed = false;
        }  
    }

    
    return cards;
}


