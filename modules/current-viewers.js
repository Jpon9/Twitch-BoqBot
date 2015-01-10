/*	The Current Viewers module
 *
 *	This module assists in keeping track of which viewers are currently
 *	viewing the stream and tracks their seconds in the connected MongoDB
 */

var currentViewers = [];
var allChatters = [];

module.exports = {
	// Holds all currently viewing individuals as,
	// This is checked to update seconds_watched values.
	// Objects in this array hold a join timestamp and nick
	timeLastUpdated: Math.floor(new Date().getTime() / 1000),

	getCurrentViewers: function(namesOnly) {
		namesOnly = (typeof namesOnly === 'boolean' ? namesOnly : false) || false;
		if (!namesOnly) { return currentViewers; }

		var names = [];
		for (var i in currentViewers) {
			names.push(currentViewers[i].username);
		}
		return names;
	},

	getAllChatters: function(namesOnly) {
		namesOnly = namesOnly || false;
		if (!namesOnly) { return allChatters; }

		var names = [];
		for (var i in allChatters) {
			names.push(allChatters[i].username);
		}
		return names;
	},

	// Returns the index of the viewer based on his/her string name
	indexOfViewer: function(viewer) {
		for (var i in currentViewers) {
			if (currentViewers[i].username === viewer) {
				return i;
			}
		}
		return -1;
	},

	// Returns the index of the viewer based on his/her string name
	indexOfChatter: function(viewer) {
		for (var i in allChatters) {
			if (allChatters[i].username === viewer) {
				return i;
			}
		}
		return -1;
	},

	chattersNowViewing: function() {
		for (var i in allChatters) {
			module.exports.addViewer(allChatters[i].username);
		}
	},

	chattersNotViewing: function() {
		for (viewer in allChatters) {
			module.exports.removeViewer(allChatters[viewer].username, true);
		}
	},

	// Adds a viewer to the current viewers list
	addViewer: function(nick) {
		// Create the viewer object
		var viewer = {
			username: nick,
			timestamp: Math.floor(new Date().getTime() / 1000)
		};

		// Keep track of chatters i.e. viewers when stream is not live
		if (module.exports.indexOfChatter(nick) === -1) {
			allChatters.push(viewer);
		}
		// If the viewer isn't already in the list, add them
		if (module.exports.indexOfViewer(nick) === -1 && uptime.isStreaming) {
			currentViewers.push(viewer);
		}

		db.addViewerIfNotExists({
			username: nick,
			messages: [],
			seconds_watched: 0,
			donation_amount: 0
		});
	},

	// Removes a viewer from the current viewers list
	removeViewer: function(nick, stillInChat) {
		stillInChat = stillInChat || false;
		var index = module.exports.indexOfViewer(nick);

		if (index !== -1) {
			// Get the viewer object
			var viewer = currentViewers[index];

			// Remove parted viewer from the current viewers
			currentViewers.splice(index, 1);

			// Add the delta seconds to the user's seconds.
			var seconds = Math.floor(Math.floor(new Date().getTime() / 1000) - viewer.timestamp);
			db.addViewerSeconds(viewer.username, seconds);
		}

		index = module.exports.indexOfChatter(nick);

		if (index !== -1 && !stillInChat) {
			// Remove parted viewer from the chatters list
			allChatters.splice(index, 1);
		}
	},

	init: function(bot) {
		// Listen for the list of names you get when you join
		bot.addListener('names', function(channel, nicks) {
			for (var nick in nicks) {
				module.exports.addViewer(nick);
			}
		});

		// Listen for joins, add viewer to currentViewers and database if needed
		bot.addListener('join' + settings.channel, function(nick, message) {
			module.exports.addViewer(nick);
		});

		// Listen for parts, remove parted viewer from currentViewers
		bot.addListener('part' + settings.channel, function(nick, message) {
			module.exports.removeViewer(nick);
		});

		bot.addListener('+mode', function(channel, by, mode, argument, message) {
			if (message.args.length === 3) {
				moderators.add(message.args[2]);
			}
		});

		bot.addListener('-mode', function(channel, by, mode, argument, message) {
			if (message.args.length === 3) {
				moderators.remove(message.args[2]);
			}
		});

		// Adds
		bot.addListener('ping', function(server) {
			var now = Math.floor(new Date().getTime() / 1000);
			for (var v in currentViewers) {
				var secondsAdded = 0;
				// Time between pings
				if (currentViewers[v].timestamp < module.exports.timeLastUpdated) {
					secondsAdded = now - module.exports.timeLastUpdated;
					db.addViewerSeconds(
						currentViewers[v].username,
						now - module.exports.timeLastUpdated
					);
				// Time between when the user joined and now
				} else {
					secondsAdded = now - currentViewers[v].timestamp;
					db.addViewerSeconds(
						currentViewers[v].username,
						now - currentViewers[v].timestamp
					);
				}
			}
			module.exports.timeLastUpdated = now;
		});
	}
}