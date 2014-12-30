var https = require('https');

function dateDiff(dateToDiff) {
    var seconds = (new Date().getTime() / 1000) - dateToDiff;

	var results = [];

	var oneMinute = 60;
	var oneHour = 60 * oneMinute;
	var oneDay = oneHour * 24;
	var oneWeek = oneDay * 7;
	var oneMonth = oneWeek * 4;
	var oneYear = oneMonth * 12;

	var years = Math.floor(seconds / oneYear);
	if (years > 0) { results.push(years + " year" + (years !== 1 ? "s" : "")); }
	seconds -= years * oneYear;
	var months = Math.floor(seconds / oneMonth);
	if (months > 0) { results.push(months + " month" + (months !== 1 ? "s" : "")); }
	seconds -= months * oneMonth;
	var weeks = Math.floor(seconds / oneWeek);
	if (weeks > 0) { results.push(weeks + " week" + (weeks !== 1 ? "s" : "")); }
	seconds -= weeks * oneWeek;
	var days = Math.floor(seconds / oneDay);
	if (days > 0) { results.push(days + " day" + (days !== 1 ? "s" : "")); }
	seconds -= days * oneDay;
	var hours = Math.floor(seconds / oneHour);
	if (hours > 0) { results.push(hours + " hour" + (hours !== 1 ? "s" : "")); }
	seconds -= hours * oneHour;
	var minutes = Math.floor(seconds / oneMinute);
	if (minutes > 0) { results.push(minutes + " minute" + (minutes !== 1 ? "s" : "")); }
	seconds -= minutes * oneMinute;
	seconds = Math.floor(seconds);
	results.push(seconds + " second" + (seconds !== 1 ? "s" : ""));

	return results.join(", ");
}

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
						callback(streamer + " has been streaming for " + dateDiff(new Date(dateStr).getTime() / 1000));
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