var mongoose = require('mongoose');
var cv = require('./current-viewers');

var ChatMessage = undefined;
var Viewer = undefined;

module.exports = {
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
				username: {type: String, lowercase: true},
				messages: {type: [ChatMessageSchema] },
				minutes_watched: {type: Number},
				donation_amount: {type: Number}
			});

			ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
			Viewer = mongoose.model('Viewer', ViewerSchema);
		});
	},

	addViewer: function(viewerData) {
		// TODO/NOTE: Get viewers, check if the username is in them, then execute this
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
			minutes_watched: viewerData.minutes_watched,
			donation_amount: viewerData.donation_amount
		});

		viewer.save(function (err) {
			if (err) {
				console.error('Error adding user to MongoDB!');
				console.error(err);
			} else {
				console.log(viewerData.username + " has been added to MongoDB.");
			}
		});
	},

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

	addViewerMinutes: function(viewer, minutes) {
		Viewer.findOne({username: viewer}, function(err, v) {
			if (err) {
				console.error('Error getting ' + viewer + '\'s data');
				console.error(err);
			}
			v.minutes_watched += minutes;
			v.save(function(err) {
				if (err) {
					console.error('Error adding minutes to ' + viewer);
					console.error(err);
				}
			});
		});
	},

	getViewerMinutes: function(viewer, callback) {
		Viewer.findOne({username: viewer}, function(err, v) {
			var sessionMinutes = 0;
			for (var i in cv.currentViewers) {
				if (cv.currentViewers[i].username === viewer) {
					sessionMinutes = Math.floor((Math.floor(new Date().getTime() / 1000) - cv.currentViewers[i].timestamp) / 60);
					break;
				}
			}
			callback(sessionMinutes + v.minutes_watched);
		});
	},

	addViewerDonation: function(viewer, donation) {
		Viewer.findOne({username: viewer}, function(err, v) {
			if (err) {
				console.error('Error getting ' + viewer + '\'s data');
				console.error(err);
			}
			v.donation_amount += parseFloat(donation);
			v.save(function(err) {
				if (err) {
					console.error('Error adding donation to ' + viewer);
					console.error(err);
				}
			});
		});
	},

	getViewerDonations: function(viewer, callback) {
		Viewer.findOne({username: viewer}, function(err, v) {
			if (err || v === null) {
				console.error('Error getting ' + viewer + '\'s data');
				console.error(err);
			}
			callback(v.donation_amount);
		});
	},
}
