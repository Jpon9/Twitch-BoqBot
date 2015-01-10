var help = require('./help.json');
var highlight = require('./modules/highlight');
var invite = require('./modules/invite-viewers');

function lowercase(arr) {
	return arr.join('`-*|').toLowerCase().split('`-*|');
}

function vetInput(re, params) {
	var vetted = [];
	for (var i in params) {
		if (re.exec(params[i]) !== null) {
			vetted.push(params[i]);
		}
	}
	return vetted;
}

function validateGroupToInvite(group) {
	var toInvite = null;
	switch (group) {
		case 'viewer':
		case 'viewers':
			toInvite = 'viewers';
			break;
		case 'mod':
		case 'mods':
		case 'moderator':
		case 'moderators':
			toInvite = 'moderators';
			break;
	}
	return toInvite;
}

function validateNumToInvite(num) {
	var numToInvite = null;
	if ((num >= 1 || num <= 10) && !isNaN(num)) {
		numToInvite = parseInt(num);
	}
	return numToInvite;
}

module.exports = {
	handleCommand: function(bot, command, parameters, sender, channel) {
		var channel_name = channel.replace('#', '');

		switch (command) {
			case 'help':
				break; // Not implemented yet
				parameters = lowercase(parameters);
				if (parameters.length > 2) {
					chat.send(sender + ': Invalid number of arguments.');
					// TODO: Implement the help command
					break;
				}
				chat.send(sender + ': ' + '');
				break;
			case 'boqbot':
				chat.send(sender + ": I am BoqBot, created by http://twitter.com/Jpon9 for boq_TV. " +
					"Type !help <command_name> for usage on any of the following commands: " +
					"!addsong !uptime !highlight !recap !donation !mytime !mysessiontime !invite");
				break;
			/*
			 *	Invites a certain number of people from a certain chat group to play with the broadcaster
			 */
			case 'invite':
				parameters = lowercase(parameters);
				var defaultNumToInvite = 4;
				var defaultGroupToInvite = 'viewers';
				var numToInvite = defaultNumToInvite;
				var groupToInvite = defaultGroupToInvite;

				if (parameters.length === 1) {
					groupToInvite = validateGroupToInvite(parameters[0]);
					numToInvite = validateNumToInvite(parameters[0]);
					if (groupToInvite === null && numToInvite === null) {
						chat.send(sender + ': Invalid usage of !invite');
						break;
					}
					if (groupToInvite === null) { groupToInvite = defaultGroupToInvite; }
					if (numToInvite === null) { numToInvite = defaultNumToInvite; }
				} else if (parameters.length === 2) {
					groupToInvite = validateGroupToInvite(parameters[0]);
					numToInvite = validateNumToInvite(parameters[1]);
					if (groupToInvite === null || numToInvite === null) {
						chat.send(sender + ': Invalid usage of !invite');
						break;
					}
				}
				switch (groupToInvite) {
					case 'viewers': invite.viewers(numToInvite); break;
					case 'moderators': invite.moderators(numToInvite); break;
					default: chat.send(sender + ': Invalid group to invite'); break;
				}
				break;
			/*
			 *	Adds a song to the playlist specified in settings.json
			 */
			case 'addsong':
				parameters = vetInput(/^spotify:track:[\dA-Za-z]{21,23}$/, parameters);
				if (parameters.length === 0) {
					chat.send(sender + ': No valid tracks were given.');
				}
				spotify.addSongs(sender, parameters);
				break;
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
				parameters = lowercase(parameters);
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
					var currentViewers = cv.getCurrentViewers();
					if (v === -1) {
						secondsToAdd = 0;
					} else if (currentViewers[v].timestamp < cv.timeLastUpdated) {
						secondsToAdd = now - cv.timeLastUpdated;
					// Time between when the user joined and now
					} else {
						secondsToAdd = now - currentViewers[v].timestamp;
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
				var currentViewers = cv.getCurrentViewers();
				for (var v in currentViewers) {
					if (currentViewers[v].username === sender) {
						var secondsToday = Math.floor(new Date().getTime() / 1000) - currentViewers[v].timestamp;
						chat.send(sender + ": You've been watching for " + format.seconds(secondsToday) + " this session.");
						break;
					}
				}
				if (!cv.isStreaming && currentViewers.length === 0) {
					chat.send(sender + ": " + channel_name + " is not streaming right now, so your time is not being tracked.");
				}
				break;
			default:
				console.log(sender + " sent a command I don't recognize in " + channel + " (!" + command + ").");
				break;
		}
	}
};