var highlight = require('./modules/highlight');

module.exports = {
	handleCommand: function(bot, command, parameters, sender, channel) {
		var channel_name = channel.replace('#', '');

		switch (command) {
			/*
			 * !uptime returns the amount of time the streamer has been streaming
			 */
			case 'uptime': 
				uptime.getTwitchStreamUptimeString(channel, function(uptime) {
					chat.send(sender + ": " + uptime);
				});
				break;
			/*
			 * !highlight records a timestamp for the streamer to go back the see later,
			 *			  in case they want to make a highlight for that moment
			 */
			case 'highlight':
				if (!moderators.isMod(sender)) {
					chat.send(sender + ': You must be a moderator to do that.');
					break;
				}
				highlight.create(channel, parameters.join(' '), sender);
				break;
			/*
			 * !recap works in tandem with !highlight to let the broadcaster
			 * grab the highlighted moments after a stream
			 */
			case 'recap':
				if (sender === channel_name) {
					highlight.recap();
				}
				break;
			/*
			 * !donation allows the streamer (or bot creator) to specify a donation amount
			 *			 coming from a certain generous user
			 */
			case 'donation':
				if (parameters.length === 0) {
					db.getViewerDonations(sender, function(donations) {
						var thanks = "";
						if (donations >= 1) {
							thanks = "! Thank you very much!";
						}
						chat.send(sender + ": You've donated " + format.money(donations) + thanks);
					});
				} else if (sender === channel_name) {
					db.addViewerDonation(parameters[0], parameters[1]);
					chat.send(sender + ": You've added " + format.money(parameters[1]) + " to " + parameters[0] + "'s donation amount.");
				}
				break;
			/*	======= DEBUG COMMAND =======
			 * !mytime returns the time a user has ever watched the stream
			 */
			case 'mytime':
				db.getViewerSeconds(sender, function(seconds) {
					var secondsToAdd = 0;
					var now = Math.floor(new Date().getTime() / 1000);
					// Time between pings
					var v = cv.indexOfViewer(sender);
					if (v === -1) {
						secondsToAdd = 0;
					} else if (cv.currentViewers[v].timestamp < cv.timeLastUpdated) {
						secondsToAdd = now - cv.timeLastUpdated;
					// Time between when the user joined and now
					} else {
						secondsToAdd = now - cv.currentViewers[v].timestamp;
					}
					seconds += secondsToAdd;
					chat.send(sender + ": You've watched " +
						channel_name + " sit at his computer for " +
						format.seconds(seconds) + " in total.");
				});
				break;
			/*	======= DEBUG COMMAND =======
			 * !mysessiontime returns the number of time the user has watched that session
			 */
			case 'mysessiontime':
				for (var v in cv.currentViewers) {
					if (cv.currentViewers[v].username === sender) {
						var secondsToday = Math.floor(new Date().getTime() / 1000) - cv.currentViewers[v].timestamp;
						chat.send(sender + ": You've been watching for " + format.seconds(secondsToday) + " this session.");
						break;
					}
				}
				if (!cv.isStreaming && cv.currentViewers.length === 0) {
					chat.send(sender + ": " + channel_name + " is not streaming right now, so your time is not being tracked.");
				}
				break;
			default:
				console.log(sender + " sent a command I don't recognize in " + channel + " (!" + command + ").");
				break;
		}
	}
};