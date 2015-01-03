/*	The Current Viewers module
 *
 *	This module assists in keeping track of which viewers are currently
 *	viewing the stream and tracks their seconds in the connected MongoDB
 */
var uptime = require('./twitch-stream-uptime');

module.exports = {
	// Holds all currently viewing individuals as,
	// This is checked to update seconds_watched values.
	// Objects in this array hold a join timestamp and nick
	currentViewers: [],
	timeLastUpdated: Math.floor(new Date().getTime() / 1000),

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
		if (module.exports.indexOfViewer(nick) === -1 && uptime.isStreaming) {
			// Add them to the current viewers list
			module.exports.currentViewers.push({
				username: nick,
				timestamp: Math.floor(new Date().getTime() / 1000)
			});

			console.log(nick + " is now viewing.");
		}

		db.addViewerIfNotExists({
			username: nick,
			messages: [],
			seconds_watched: 0,
			donation_amount: 0
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

			// Add the delta seconds to the user's seconds.
			var seconds = Math.floor(Math.floor(new Date().getTime() / 1000) - viewer.timestamp);
			db.addViewerSeconds(viewer.username, seconds);

			console.log(nick + " is no longer viewing.");
		}
	},

	init: function(bot, db) {
		// Listen for the list of names you get when you join
		bot.addListener('names', function(channel, nicks) {
			for (var nick in nicks) {
				module.exports.addViewer(nick, db);
			}
		});

		// Listen for joins, add viewer to currentViewers and database if needed
		bot.addListener('join' + settings.channel, function(nick, message) {
			module.exports.addViewer(nick, db);
		});

		// Listen for parts, remove parted viewer from currentViewers
		bot.addListener('part' + settings.channel, function(nick, message) {
			module.exports.removeViewer(nick, db);
		});

		// Adds
		bot.addListener('ping', function(server) {
			if (!uptime.isStreaming) {
				for (viewer in module.exports.currentViewers) {
					module.exports.removeViewer(viewer.username, db);
				}
			}
			var now = Math.floor(new Date().getTime() / 1000);
			for (var v in module.exports.currentViewers) {
				var secondsAdded = 0;
				// Time between pings
				if (module.exports.currentViewers[v].timestamp < module.exports.timeLastUpdated) {
					secondsAdded = now - module.exports.timeLastUpdated;
					db.addViewerSeconds(
						module.exports.currentViewers[v].username,
						now - module.exports.timeLastUpdated
					);
				// Time between when the user joined and now
				} else {
					secondsAdded = now - module.exports.currentViewers[v].timestamp;
					db.addViewerSeconds(
						module.exports.currentViewers[v].username,
						now - module.exports.currentViewers[v].timestamp
					);
				}
				console.log("Added " + secondsAdded + " seconds to " + module.exports.currentViewers[v].username);
			}
			module.exports.timeLastUpdated = now;
		});
	}
}