var Twitter = require('twitter');
settings = require('../settings.json');

var client = new Twitter({
	consumer_key: settings.twitter.consumer_key,
	consumer_secret: settings.twitter.consumer_secret,
	access_token_key: settings.twitter.access_token_key,
	access_token_secret: settings.twitter.access_token_secret
});

module.exports = {
	getRetweeters: function() {
		// https://dev.twitter.com/rest/reference/get/statuses/retweeters/ids
		client.get('statuses/retweeters/ids',
			{"id": settings.tweet_to_check, "stringify_ids": true},
			function(error, params, response) {
				if (error) { throw error; }

				console.log(response);
			}
		);
	}
}

module.exports.getRetweeters();