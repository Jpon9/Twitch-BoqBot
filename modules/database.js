var mongoose = require('mongoose');
var cv = require('./current-viewers');

var ChatMessage = undefined;
var Viewer = undefined;

module.exports = {
	// Connects to the database
	connect: function(hostname, databaseName) {
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

			ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
			Viewer = mongoose.model('Viewer', ViewerSchema);
		});
	},

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
			var sessionSeconds = 0;
			for (var i in cv.currentViewers) {
				if (cv.currentViewers[i].username === viewer) {
					sessionSeconds = Math.floor(new Date().getTime() / 1000) - cv.currentViewers[i].timestamp;
					break;
				}
			}
			callback(v.seconds_watched + sessionSeconds);
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
	}
}
