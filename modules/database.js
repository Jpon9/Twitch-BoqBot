var mongoose = require('mongoose');

var ChatMessage = undefined;
var Viewer = undefined;
var SpotifyUser = undefined;

module.exports = {
	// Connects to the database
	connect: function(hostname, databaseName, callback) {
		mongoose.connect("mongodb://" + hostname + "/" + databaseName);

		var db = mongoose.connection;
		var Schema = mongoose.Schema;

		db.on('error', function() {
			console.log("Could not connect to database, quitting...");
			process.exit(1);
		});
		db.once('open', function () {
			console.log("Connected successfully to database!")
			var ChatMessageSchema = new Schema({
				timestamp: {type: Number},
				text: {type: String}
			});

			var ViewerSchema = new Schema({
				username: {type: String, lowercase: true, unique: true},
				messages: {type: [ChatMessageSchema] },
				seconds_watched: {type: Number},
				donation_amount: {type: Number}
			});

			var SpotifyUserSchema = new Schema({
				username: {type: String, unique: true},
				refresh_token: {type: String},
				access_token: {type: String},
				expiration_epoch: {type: Number}
			});

			ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
			Viewer = mongoose.model('Viewer', ViewerSchema);
			SpotifyUser = mongoose.model('SpotifyUser', SpotifyUserSchema);
			callback();
		});
	},

	/* ======================
	 *	  VIEWER FUNCTIONS
	 * ====================== */

	// Returns the viewer's object from MongoDB
	getViewerData: function(viewer, callback) {
		Viewer.findOne({username: viewer}, function(err, v) {
			if (err) {
				console.error('Error getting ' + viewer + '\'s data');
				console.error(err);
				return;
			} else if (v === null) {
				// If the user isn't found, return a default object
				v = {
					username: viewer,
					messages: [],
					seconds_watched: 0,
					donation_amount: 0
				};
			}
			callback(v);
		});
	},

	// Adds a viewer to the MongoDB value
	addViewer: function(viewerData) {
		var messages = [];
		
		for (var message in viewerData.messages) {
			var chatMessage = new ChatMessage({
				timestamp: Math.floor(new Date().getTime() / 1000),
				text: viewerData.messages[message]
			});
			messages.push(chatMessage);
		}

		var viewer = new Viewer({
			username: viewerData.username,
			messages: messages,
			seconds_watched: viewerData.seconds_watched,
			donation_amount: viewerData.donation_amount
		});

		viewer.save(function (err) {
			if (err) {
				if (err.code === 11000) { return; } // Duplicate index, this is intentional
				console.error('Error adding user to MongoDB!');
				console.error(err);
			} else {
				console.log(viewerData.username + " has been added to MongoDB.");
			}
		});
	},

	// Alias for addViewer
	addViewerIfNotExists: function(viewerData) {
		module.exports.addViewer(viewerData);
	},

	// Returns all the viewers, string username only if option is set
	getViewers: function(opts, callback) {
		var allViewers = [];
		var options = {
			usernameOnly: opts.usernameOnly || false
		};
		Viewer.find({}, function(err, viewers) {
			for (var viewer in viewers) {
				if (options.usernameOnly) {
					allViewers.push(viewers[viewer].username);
				} else {
					allViewers.push(viewers[viewer]);
				}
			}
			callback(allViewers);
		});
	},

	// Adds a viewer message to the viewer's messages array
	addViewerMessage: function(viewer, message) {
		var query = {
			username: viewer
		};
		var update = {
			$push: {
				'messages': new ChatMessage({
					timestamp: Math.floor(new Date().getTime() / 1000),
					text: message
				})
			}
		};
		Viewer.update(query, update, function(err, data) {
			if (err) {
				console.error('Error adding message to ' + viewer);
				console.error(err);
			}
		});
	},

	// Calls getViewerData and adds new seconds
	addViewerSeconds: function(viewer, seconds) {
		module.exports.getViewerData(viewer, function(v) {
			v.seconds_watched += seconds;
			v.save(function(err) {
				if (err) {
					console.error('Error adding seconds to ' + viewer);
					console.error(err);
				}
			});
		});
	},

	// Calls getViewerData and returns seconds_watched value
	getViewerSeconds: function(viewer, callback) {
		module.exports.getViewerData(viewer, function(v) {
			callback(v.seconds_watched);
		});
	},

	// Calls getViewerData and adds to donation_amount value
	addViewerDonation: function(viewer, donation) {
		module.exports.getViewerData(viewer, function(v) {
			v.donation_amount += parseFloat(donation);
			v.save(function(err) {
				if (err) {
					console.error('Error adding donation to ' + viewer);
					console.error(err);
				}
			});
		});
	},

	// Calls getViewerData and returns the donation_amount value
	getViewerDonations: function(viewer, callback) {
		module.exports.getViewerData(viewer, function(v) {
			callback(v.donation_amount);
		});
	},

	/* =============================
	 *	  SPOTIFY OAUTH FUNCTIONS
	 * ============================= */

	addSpotifyUser: function(user) {
		if (typeof user.username !== 'string') {
			console.log("Invalid username attempted to be entered in Spotify Users document.");
			return;
		}
		user.access_token = user.access_token || "";
		user.refresh_token = user.refresh_token || "";
		user.expiration_epoch = user.expiration_epoch || 0;

		var spotifyUser = new SpotifyUser({
			username: user.username,
			access_token: user.access_token,
			refresh_token: user.refresh_token,
			expiration_epoch: user.expiration_epoch
		});

		spotifyUser.save(function (err) {
			if (err) {
				if (err.code === 11000) { // Duplicate index, this is intentional
					module.exports.updateSpotifyUser(user.username, user.refresh_token, user.access_token, user.expiration_epoch);
					return;
				}
				console.error('Error adding Spotify user to MongoDB!');
				console.error(err);
			} else {
				console.log(user.username + "'s Spotify has been added to MongoDB.");
			}
		});
	},

	updateSpotifyUser: function(username, access_token, refresh_token, expiration_epoch) {
		var query = {
			username: username
		};
		var update = {
			access_token: access_token,
			refresh_token: refresh_token,
			expiration_epoch: expiration_epoch
		};
		Viewer.update(query, update, function(err, data) {
			if (err) {
				console.error('Error updating ' + username + '\'s Spotify data.', err);
			} else if (data !== 0) {
				console.log('User ' + username + '\'s Spotify details have been updated.');
			}
		});
	},

	getSpotifyUser: function(username, callback) {
		SpotifyUser.findOne({username: username}, function(err, v) {
			if (err) {
				console.error('Error getting ' + username + '\'s Spotify data');
				console.error(err);
				callback(null);
			}
			callback(v);
		});
	}
}
