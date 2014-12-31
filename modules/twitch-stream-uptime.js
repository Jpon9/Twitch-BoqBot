var https = require('https');
var format = require('./formatting');

module.exports = {
	getTwitchStreamUptimeString: function(channel_name, callback) {
		var streamer = channel_name.replace('#', '');
		https.get("https://api.twitch.tv/kraken/streams/" + streamer, function(res) {
			res.on('data', function(d) {
				var dateStr = undefined;

				try {
					responseJson = JSON.parse(d);
					if (responseJson['stream'] !== null) {
						dateStr = responseJson['stream']['created_at'];
					} else {
						dateStr = -1;
					}
				} catch(e) {
					console.error("Error getting created_at");
					console.error(e);
					return;
				}
				if (dateStr !== undefined) {
					if (dateStr === -1) {
						callback(streamer + " is not currently streaming.");
					} else {
						callback(streamer + " has been streaming for " + format.dateDiff(new Date(dateStr).getTime() / 1000));
					}
				} else {
					console.error("Error getting created_at");
				}
			});
		}).on('error', function(e) {
			console.error("Error using the Twitch API");
			console.error(e);
		});
	}
};