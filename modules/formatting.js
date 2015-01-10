// Utility function, makes certain numbers for times and dates look better
function padNumber(num) {
    return (num < 10) ? "0" + num : "" + num;
}

module.exports = {
	seconds: function(seconds) {
		seconds = Math.floor(seconds);

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
		if (seconds > 0) { results.push(seconds + " second" + (seconds !== 1 ? "s" : "")); }

		if (results.length > 2) {
			var popped = results.pop();
			popped = "and " + popped;
			results.push(popped);
		}

		return results.join(", ");
	},

	dateDiff: function(dateToDiff) {
		return module.exports.seconds(Math.abs(Math.floor(new Date().getTime() / 1000) - Math.floor(dateToDiff)));
	},

	timestamp: function(seconds) {
		var results = "";

		var oneMinute = 60;
		var oneHour = 60 * oneMinute;

		var hours = Math.floor(seconds / oneHour);
		if (hours > 0) { results += hours + ":"; }
		seconds -= hours * oneHour;
		var minutes = Math.floor(seconds / oneMinute);
		if (minutes > 0) { results += padNumber(minutes) + ":"; }
		seconds -= minutes * oneMinute;
		seconds = Math.floor(seconds);
		results += padNumber(seconds);

		return results;
	},

	number: function(num, decimals) {
		if (decimals === null || decimals === undefined) { decimals = 0; }
	    num = (num === undefined || num === null || isNaN(num) ? 0 : parseFloat(num));
	    num = num.toFixed(decimals);
	    var parts = num.toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    return parts.join(".");
	},

	percentage: function(decimal) {
		return module.exports.number(decimal * 100, 2) + '%';
	},

	money: function(money) {
		return '$' + module.exports.number(money, 2);
	}
}