swearList = require('./swear-jar.json');

module.exports = {
	messageHasSwear: function(message) {
		if (message.indexOf('***') > -1) {
			console.log('Either the global filter is still enabled or they used a very naughty word.');
			return '1h';
		}

		for (var category in swearList) {
			console.log('MESSAGE: ', message);
			console.log('\tChecking message for swears...');
			for (var swear in swearList[category]) {
				console.log('\t\tChecking for ' + swearList[category][swear] + '...');
				if (message.indexOf(' ' + swearList[category][swear]) > -1 || message.indexOf(swearList[category][swear]) === 0) {
					console.log('\t\t-> Found!');
					return category; // Returns the ban length, e.g. 10m, 1h, 24h, etc.
				}
			}
		}
		
		return '0s';
	}
};