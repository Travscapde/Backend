var request = require('request');
var WeatherInfo = require('./models/weather_info');
var Card = require('./models/card');


function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}




function getLocationScore(card) {
	//console.log("score of" + card.location_id);
	//Check if already exists
	WeatherInfo.findOne({google_place_id:card.location_id}, function(err, searchedlocation) {
		if(searchedlocation) {
			console.log("Location already exists");
			Card.findById(card._id, function (err, card) {
				if(err) {
					console.log(err);
				} else {
					card.location_score_id = searchedlocation._id;
					card.save();
				}
			});
		
		} else {
			getWeatherInfo(card);
		}
	});
}



function getWeatherInfo (card) {

	var latitude = card.latitude;
	var longitude = card.longitude;

	var replies = [{},{},{},{},{},{},{},{},{},{},{},{},{}];
	var noOfReplies = 0;

	var month;
	for (month=1;month<13;month++) {
		setTimeout(function(monthStr, latitude, longitude) {
			getWeatherMonth (monthStr, latitude, longitude, function(month, reply) {
				replies[month] = reply;
				noOfReplies++;

				if(noOfReplies == 12) {
					saveweatherInfo(card, replies);
				}
			})
		}, 10000*month, pad(month,2), latitude, longitude);
	}

}


function getWeatherMonth(monthStr, latitude, longitude, callback) {
	var authInfo = require("./auth_info.json");
	var key = authInfo.weather_key;

	var getWeatherUrl = 'http://api.wunderground.com/api/' + key + '/planner_' + monthStr + '01' + monthStr + '28/q/' + latitude + ',' + longitude + '.json';
	//console.log(getWeatherUrl);

	request({
			url: getWeatherUrl,
			json: true
		}, function (error, response, body) {
			if (error) {
				console.log(error);
			} else  {
				//console.log(body.trip);
				callback(parseInt(monthStr, 10), body);
			}

		});
}







function saveweatherInfo(card, replies) {
	

	var newWeatherInfoObj = {
		google_place_id: card.location_id,
	    high_temp_max: [],
	    high_temp_avg: [],
	    high_temp_min: [],
		low_temp_max: [],
	    low_temp_avg: [],
	    low_temp_min: [],
		precip_max: [],
		precip_avg: [],
		precip_min: [],

	    score: [],
	};


	var month;
	for (month=1;month<13;month++) {
		newWeatherInfoObj.high_temp_max.push(replies[month].trip.temp_high.max.C);
		newWeatherInfoObj.high_temp_avg.push(replies[month].trip.temp_high.avg.C);
		newWeatherInfoObj.high_temp_min.push(replies[month].trip.temp_high.min.C);

		newWeatherInfoObj.low_temp_max.push(replies[month].trip.temp_low.max.C);
		newWeatherInfoObj.low_temp_avg.push(replies[month].trip.temp_low.avg.C);
		newWeatherInfoObj.low_temp_min.push(replies[month].trip.temp_low.min.C);
		
		newWeatherInfoObj.precip_max.push(replies[month].trip.precip.max.cm);
		newWeatherInfoObj.precip_avg.push(replies[month].trip.precip.avg.cm);
		newWeatherInfoObj.precip_min.push(replies[month].trip.precip.min.cm);
	}

	for (month=1;month<13;month++) {
		var score = calculateWeatherScore(newWeatherInfoObj.high_temp_avg[month], 
															Math.max.apply(null, newWeatherInfoObj.high_temp_avg),
															Math.min.apply(null, newWeatherInfoObj.high_temp_avg),
															newWeatherInfoObj.precip_avg[month]);
		newWeatherInfoObj.score.push(score);	
	}

	newWeatherInfoObj.score = normalizeScore(newWeatherInfoObj.score);



	//console.log(newWeatherInfoObj);

	var newWeatherInfo = WeatherInfo(newWeatherInfoObj);

	newWeatherInfo.save(function(err, savedWeatherCard) {
		if(err) {
			console.log(err);
		} else {
			console.log("Weather Info Saved");
			Card.findById(card._id, function (err, card) {
				if(err) {
					console.log(err);
				} else {
					card.location_score_id = savedWeatherCard._id;
					card.save();
				}
			});

		}

	});

}


function calculateWeatherScore(temp, temp_max, temp_min, precip) {

	var score = 0;

	
	if(temp > 15 && temp < 30) {
		score=score+2;
	} else if (temp > 5 && temp > 35) {
		score=score+1;
	}


	//Cold region
	if(temp_max<5) {
		var range = temp_max - temp_min;
		if(temp > (temp_min + 0.8*range)) {
			score=score+2;
		} else if (temp > (temp_min + 0.5*range)) {
			score=score+1;
		}
	}


	//Hot region
	if(temp_min<35) {
		var range = temp_max - temp_min;
		if(temp < (temp_max - 0.8*range)) {
			score=score+2;
		} else if (temp < (temp_max - 0.5*range)) {
			score=score+1;
		}
	}


	if (precip < 3) {
		score=score+2;
	} else if (precip < 4) {
		score = score + 1;
	}


	return score;

}



function normalizeScore(scores) {
	var month, maxScore=0;
	for (month=1;month<13;month++) {
		if(scores[month] > maxScore) {
			maxScore = scores[month];
		}
	}

	var factor = 3.0/maxScore;

	for (month=1;month<13;month++) {
		scores[month] = scores[month] * factor;
	}

	//console.log(scores);
	return scores;
}


module.exports = getLocationScore;