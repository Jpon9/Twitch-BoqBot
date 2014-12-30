var uptime = require('./modules/twitch-stream-uptime');
var db = require('./modules/database');
var cv = require('./modules/current-viewers');

module.exports = {
	handleCommand: function(bot, command, parameters, sender, channel) {
		var channel_name = channel.replace('#', '');

		switch (command) {
			// !uptime returns the amount of time the streamer has been streaming
			case 'uptime': 
				function callback(uptime) {
					bot.say(channel, sender + ", " + uptime);
				}
				uptime.getTwitchStreamUptimeString(channel, callback);
				break;
			// !highlight records a timestamp for the streamer to go back the see later,
			//			  in case they want to make a highlight for that moment
			case 'highlight':
				// Do nothing yet
				break;
			// !donation allows the streamer (or bot creator) to specify a donation amount
			//			 coming from a certain generous user
			case 'donation':
				if (sender !== 'boq_tv' || sender !== 'jpon9') {
					break;
				}
				// Add a donation
				break;
			// !myminutes returns the number of minutes a user has ever watched the stream
			case 'myminutes': // DEBUG COMMAND
				function callback(minutes) {
					bot.say(channel, sender + ": You've watched " +
						channel_name + " sit at his computer for " + minutes + " minutes in total.");
				}
				db.getViewerMinutes(sender, callback);
				break;
			// !mysessionminutes returns the number of minutes the user has watched that session
			case 'mysessionminutes': // DEBUG COMMAND
				for (var v in cv.currentViewers) {
					if (cv.currentViewers[v].username === sender) {
						var minutesToday = Math.floor((Math.floor(new Date().getTime() / 1000) - cv.currentViewers[v].timestamp) / 60);
						bot.say(channel, sender + ": You've been watching for " + minutesToday + " minutes this session.");
						break;
					}
				}
				break;
			// !viewers returns the current number of viewers as recorded by the bot
			case 'viewers': // DEBUG COMMAND
				bot.say(channel, sender + ": There are currently " + cv.currentViewers.length + " viewers.");
				break;
			// !viewerlist returns the full list of people watching the stream
			case 'viewerlist': // DEBUG COMMAND
				var viewers = [];
				for (v in cv.currentViewers) {
					viewers.push(cv.currentViewers[v].username);
				}
				bot.say(channel, sender + ": " + viewers.join(', '));
				break;
			default:
				console.log(sender + " sent a command I don't recognize in " + channel + ".");
				break;
		}
	}
};