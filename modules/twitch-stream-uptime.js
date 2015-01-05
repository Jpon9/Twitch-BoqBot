var https = require('https');
var format = require('./formatting');

function getIsStreaming(channel_name, callback) {
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
					callback(false);
				} else {
					callback(true);
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

var numTimesDifferent = 0;

function updateIsStreaming(channel_name) {
	getIsStreaming(channel_name, function(streaming) {
		if (typeof streaming === 'boolean') {
			if (!streaming !== module.exports.isStreaming) {
				numTimesDifferent += 1;
			}
			if (numTimesDifferent > 4) {
				module.exports.isStreaming = !streaming;
				numTimesDifferent = 0;
			}
			console.log(channel_name.replace('#','') + " is" + (streaming ? "" : " not") + " streaming");
		}
	})
}

module.exports = {
	isStreaming: false,

	init: function(channel_name) {
		setInterval(updateIsStreaming, 30000, channel_name);
		updateIsStreaming(channel_name);
	},

	getStreamData: function(channel_name, callback) {
		var streamer = channel_name.replace('#', '');
		https.get("https://api.twitch.tv/kraken/streams/" + streamer, function(res) {
			res.on('data', function(d) {
				var responseJson = undefined;

				try {
					responseJson = JSON.parse(d);
				} catch(e) {
					console.error("Error getting created_at");
					console.error(e);
					return;
				}

				callback(responseJson);
			});
		}).on('error', function(e) {
			console.error("Error using the Twitch API");
			console.error(e);
		});
	},

	getTwitchStreamUptimeString: function(channel_name, callback) {
		var streamer = channel_name.replace('#', '');
		module.exports.getStreamData(channel_name, function(streamData) {
			var dateStr = undefined;
			if (streamData['stream'] !== null) {
				dateStr = streamData['stream']['created_at'];
			} else {
				dateStr = -1;
			}

			if (dateStr === -1) {
				callback(streamer + " is not currently streaming.");
			} else {
				callback(streamer + " has been streaming for " + format.dateDiff(new Date(dateStr).getTime() / 1000));
			}
		});
	}
};