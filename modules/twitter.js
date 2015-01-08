var Twit = require('twit');
var fs = require('fs');
var util = require('util');
settings = require('../settings.json');

var client = new Twit({
	consumer_key: settings.twitter.consumer_key,
	consumer_secret: settings.twitter.consumer_secret,
	access_token: settings.twitter.access_token,
	access_token_secret: settings.twitter.access_token_secret
});

module.exports = {
	getRetweeters: function() {
		// https://dev.twitter.com/rest/reference/get/statuses/retweeters/ids
		client.get('statuses/retweeters/ids',
			{id: settings.tweet_to_check, stringify_ids: true, count: 50, cursor: -1},
			function(error, data, response) {
				if (error) {
					console.error(error);
					return;
				}
				
				fs.writeFile('./cache/twitter-response-' + Math.floor(new Date().getTime() / 1000) + '.json', util.inspect(response), function(err) {
					if (err) {
						console.error(err);
						return;
					} else {
						console.log("Cached a Twitter response");
					}
				});

				fs.writeFile('./cache/twitter-data-' + Math.floor(new Date().getTime() / 1000) + '.json', util.inspect(data), function(err) {
					if (err) {
						console.error(err);
						return;
					} else {
						console.log("Cached a Twitter response");
					}
				});

				console.log(data);

				console.log("That tweet was retweeted " + data.ids.length + " times.");
				console.log("Requests Remaining: " + response.headers['x-rate-limit-remaining'] +
					" (" + format.seconds(response.headers['x-rate-limit-reset'] - Math.floor(new Date().getTime() / 1000)) + ")");
			}
		);
	}
}