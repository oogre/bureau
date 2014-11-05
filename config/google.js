module.exports.google = {

	keys : {
		client : process.env.GOOGLE_API_KEY_CLIENT,
		server : process.env.GOOGLE_API_KEY_SERVER
	},

	geocode : function(addres, success, fail){

		var getGeocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=[ADDRES]&key=[APIKEY]";
		var apiKey = sails.config.google.keys.server;

		getGeocodeUrl = getGeocodeUrl
		.replace("[ADDRES]", addres)
		.replace("[APIKEY]", apiKey);
		
		var request = require('request');
		request(getGeocodeUrl, function (err, response, body) {
			if(err || response.statusCode != 200){
				fail("geocode_request_error");
			}
			try{
				location = JSON.parse(body).results[0].geometry.location;
				success(location);
			}catch(e){
				fail("geocode_parsing_error");
			}
		});
	}
}