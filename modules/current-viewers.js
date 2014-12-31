/*	The Current Viewers module
 *
 *	This module assists in keeping track of which viewers are currently
 *	viewing the stream and tracks their minutes in the connected MongoDB
 */

module.exports = {
	// Holds all currently viewing individuals as,
	// This is checked to update minutes_watched values.
	// Objects in this array hold a join timestamp and nick
	currentViewers: [],
	
	// Returns the index of the viewer based on his/her string name
	indexOfViewer: function(viewer) {
		for (var i in module.exports.currentViewers) {
			if (module.exports.currentViewers[i].username === viewer) {
				return i;
			}
		}
		return -1;
	},

	// Adds a viewer to the current viewers list
	addViewer: function(nick, db) {
		// If the viewer isn't already in the list
		if (module.exports.indexOfViewer(nick) === -1) {
			// Add them to the current viewers list
			module.exports.currentViewers.push({
				username: nick,
				timestamp: Math.floor(new Date().getTime() / 1000)
			});
		}

		// Add viewer to the list of total viewers
		db.getViewers({usernameOnly: true}, function(viewers) {
			// Keep track of user stats
			console.log("current-viewers.js L-37: newUsersThisSession");
			console.log(newUsersThisSession);
			if (viewers.indexOf(nick) === -1 && newUsersThisSession.indexOf(nick) === -1) {
				db.addViewer({
					username: nick,
					messages: [],
					minutes_watched: 0,
					donation_amount: 0
				});
			}
		});
	},

	// Removes a viewer from the current viewers list
	removeViewer: function(nick, db) {
		var index = module.exports.indexOfViewer(nick);

		if (index !== -1) {
			// Get the viewer object
			var viewer = module.exports.currentViewers[index];

			// Remove parted viewer from the current viewers
			module.exports.currentViewers.splice(index, 1);

			// Add the delta minutes to the user's minutes.
			var minutes = Math.floor((Math.floor(new Date().getTime() / 1000) - viewer.timestamp) / 60);
			db.addViewerMinutes(viewer.username, minutes);
		}
	},

	init: function(bot, db) {
		// Listen for the list of names you get when you join
		bot.addListener('names', function(channel, nicks) {
			for (var nick in nicks) {
				module.exports.addViewer(nick, db);
			}
		});

		// Listen for joins
		bot.addListener('join' + settings.channel, function(nick, message) {
			module.exports.addViewer(nick, db);
		});

		// Listen for parts
		bot.addListener('part' + settings.channel, function(nick, message) {
			module.exports.removeViewer(nick, db);
		});
	}
}