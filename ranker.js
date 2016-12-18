var Card = require('./models/card');
var UserInfo = require('./models/user_info');

function ranker(cards, user, location) {
    
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
        var idx = user.bucket_list.indexOf(cards[i]._id);
        if( idx > -1) {
            var seenCard = cards.splice(i, 1);
            seenCards.push(seenCard);    
            i--;
        }
    }

    //console.log(seenCards.length);
    cards.push(seenCards);
    //console.log(cards.length);
    return cards;


        
   

}


function cardScore(card, user, location) {
    return card.created_at;
}


/*var testID = "57c78ee12bffa2af75e14cf1";
    
  */  

module.exports = ranker;

