var uptime = require('./modules/twitch-stream-uptime');
var db = require('./modules/database');
var cv = require('./modules/current-viewers');
var format = require('./modules/formatting');

module.exports = {
	handleCommand: function(bot, command, parameters, sender, channel) {
		var channel_name = channel.replace('#', '');

		switch (command) {
			/*
			 * !uptime returns the amount of time the streamer has been streaming
			 */
			case 'uptime': 
				uptime.getTwitchStreamUptimeString(channel, function(uptime) {
					bot.say(channel, sender + ", " + uptime);
				});
				break;
			/*
			 * !highlight records a timestamp for the streamer to go back the see later,
			 *			  in case they want to make a highlight for that moment
			 */
			case 'highlight':
				// Do nothing yet
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
							thanks = "! Thank you very much!"
						}
						bot.say(channel, sender + ": You've donated " + format.money(donations) + thanks);
					});
				} else if (sender === channel_name) {
					db.addViewerDonation(parameters[0], parameters[1]);
					bot.say(channel, sender + ": You've added " + format.money(parameters[1]) + " to " + parameters[0] + "'s donation amount.");
				}
				break;
			/*	======= DEBUG COMMAND =======
			 * !mytime returns the time a user has ever watched the stream
			 */
			case 'mytime':
				db.getViewerSeconds(sender, function(seconds) {
					seconds += (new Date().getTime() / 1000 - cv.timeLastUpdated);
					bot.say(channel, sender + ": You've watched " +
						channel_name + " sit at his computer for " + format.seconds(seconds) + " in total.");
				});
				break;
			/*	======= DEBUG COMMAND =======
			 * !mysessiontime returns the number of time the user has watched that session
			 */
			case 'mysessiontime':
				for (var v in cv.currentViewers) {
					if (cv.currentViewers[v].username === sender) {
						var secondsToday = Math.floor(Math.floor(new Date().getTime() / 1000) - cv.currentViewers[v].timestamp);
						bot.say(channel, sender + ": You've been watching for " + format.seconds(secondsToday) + " this session.");
						break;
					}
				}
				break;
			/*	======= DEBUG COMMAND =======
			 * !viewers returns the current number of viewers as recorded by the bot
			 */
			case 'viewers':
				bot.say(channel, sender + ": There are currently " + cv.currentViewers.length + " viewers.");
				break;
			/*	======= DEBUG COMMAND =======
			 * !viewerlist returns the full list of people watching the stream
			 */
			case 'viewerlist':
				var viewers = [];
				for (v in cv.currentViewers) {
					viewers.push(cv.currentViewers[v].username);
				}
				bot.say(channel, sender + ": " + viewers.join(', '));
				break;
			default:
				console.log(sender + " sent a command I don't recognize in " + channel + " (!" + command + ").");
				break;
		}
	}
};