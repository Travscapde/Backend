var request = require('request');
var Card = require('./models/card');
var LocationInfo = require('./models/location_info');



function gatherLocationInfo (cardID, title, location, callback) {
	

	getWikiTravelInfo(title, function(err, extract) {
		if (!err) {
			saveLocationInfo(cardID, title, extract);
			callback(title, extract);
		} else if (err == "Page Not Found") {
			getWikiTravelInfo(location, function(err, extract) {
				if (!err) {
					saveLocationInfo(cardID, location, extract);
					callback(location, extract);
				} else {
					callback ("", "");		
				}
			});
		} 

	}); 



}


function saveLocationInfo (cardID, location, extract) {

	//Check if location exists in database 
	LocationInfo.findOne({name:location}, function(err, searchedlocation) {
		if(searchedlocation) {
			//console.log("location already in database");
			Card.findById(cardID, function (err, card) {
				if(err) {
					//console.log('Could not find card');
				} else {
					card.location_info_id = searchedlocation._id;
					//console.log(card);
					card.save();
				}
			});
		} else {
			//Create new location schema
			console.log("creating new location");
			var newLocationInfo = LocationInfo({
				name: location,
				summary: extract
		    });
		    
			newLocationInfo.save(function (err, location){
				if(err) {
					console.log(err);
				} else {
					Card.findById(cardID, function (err, card) {
						if(err) {
							console.log('Could not find card');
						} else {
							card.location_info_id = location._id;
							//console.log(card);
							card.save();
						}
					});
				}	

			});
		}
	});
}


function getWikiTravelInfo(title, callback) {

	title = toTitleCase(title);
	
	getPageAbstract(title, function(err, extract) {
		callback(err, extract);
	});

}



function getPageAbstract(title, callback) {

	var wikitravelQueryUrl = 'http://en.wikivoyage.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&format=json&titles=' + title;
	//console.log(wikitravelQueryUrl);
		request({
			url: wikitravelQueryUrl,
			json: true
		}, function (error, response, body) {
			if (error) {
				console.log(error);
				callback(error, "");
			} else if (body.query == undefined) {
				callback("Page Not Found", "");	
			} else {
				var pageID = Object.keys(body.query.pages)[0];
				if (pageID == '-1') {
					callback("Page Not Found", "");
				}
				else {
					var extract = body.query.pages[pageID].extract;
					if(extract == "") {
						callback("Page Not Found", "");		
					} else {
						callback(null, extract);
					}								
				}
				

			}
	});

}


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}



//gatherLocationInfo('mount rinjani', 123);

module.exports = gatherLocationInfo;