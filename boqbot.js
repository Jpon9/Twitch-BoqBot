// Load the settings file
settings = require('./settings.json');

// Dependencies for Spotify Web API wrapper
require('promise');
require('restler');

// Used to connect to IRC
var irc = require('irc');

// Our modules, global ones can be used anywhere
var cmds = require('./commands');
var hal9000 = require('./modules/hal9000');
db = require('./modules/database');
cv = require('./modules/current-viewers');
uptime = require('./modules/twitch-stream-uptime');
format = require('./modules/formatting');
moderators = require('./modules/moderator');
chat = require('./modules/chat');
spotify = require('./modules/spotify');
swearJar = require('./modules/swear-jar');

// Called once the database connection is established
function initializeBoqbot() {
	console.log("Connecting to IRC...");
	var bot = new irc.Client(settings.server, settings.username, {
		channels: [settings.channel + " " + settings.oauth_token],
		password: settings.oauth_token,
		userName: settings.username,
		realName: "boq_TV's Chat Bot",
		debug: false,
		showErrors: true,
		autoRejoin: true
	});

	// Initialize modules
	chat.init(bot);
	cv.init(bot, db);
	uptime.init(settings.channel);
	spotify.init();

	bot.addListener("connect", function() {
		console.log("Connected to the channel.");
		setTimeout(function() {
			console.log("Sending welcome message...");
			chat.send("/color " + settings.chatname_color);
			chat.send("BoqBot is ALIVE!  I am a bot coded by http://twitter.com/Jpon9/ to help facilitate boq_TV's stream chat.  You can find my code on GitHub at http://github.com/Jpon9/Twitch-BoqBot/.");
		}, 2500);
	});

	// ========================
	// Listen for user messages
	// ========================
	bot.addListener('message', function(sender, channel, text, message) {
		// Ignore certain users / greeters
		if (sender === "jtv" || sender === "nightbot" || sender === "moobot") {
			return;
		}
		
		// Add them to the currently viewing list
		// if Twitch didn't tell us about the yet
		if (cv.indexOfViewer(sender) === -1) {
			cv.addViewer(sender);
		}

		// Get the number of viewers, add if they're not already
		db.getViewers({usernameOnly: true}, function(viewers) {
			// Keep track of user stats
			if (viewers.indexOf(sender) === -1) {
				db.addViewer({
					username: sender,
					messages: [text],
					seconds_watched: 0,
					donation_amount: 0
				});
			} else {
				db.addViewerMessage(sender, text);
			}
		});

		// Convert the command text to lowercase so it's easier to work with
		var text_lc = text.toLowerCase();

		var hasSwear = swearJar.messageHasSwear(text_lc);

		if (hasSwear !== 0) {
			var secondsBanned = 0;

			var timeUnit = hasSwear.substr(-1);
			var baseTime = parseFloat(hasSwear.substr(0, hasSwear.length - 1));

			if (baseTime !== 0) {
				if (timeUnit === 'm') {
					secondsBanned = baseTime * 60;
				} else if (timeUnit === 'h') {
					secondsBanned = baseTime * 3600;
				}

				chat.send(sender + ': Your last message would warrant a ' + format.seconds(secondsBanned) + ' ban from chat.');
			}
		}

		// If a messages starts with !, it's a command
		if (text.substr(0, 1) === '!') {
			var commandName = text_lc.substr(1, text_lc.indexOf(' ') > 0 ? text_lc.indexOf(' ') - 1 : text_lc.length - 1);
			var parameters = text.split(' ');
			// Removes command name from command, if there are no parameters it returns an empty array
			parameters.splice(0, 1);
			cmds.handleCommand(bot, commandName, parameters, sender, channel);
		// If we're mentioned, run the hal9000 module to talk back
		} else if (text_lc.search(settings.username) != -1) {
			hal9000.botMention(bot, channel, sender, text_lc);
		}
	});
}

console.log("Connecting to the database...");
db.connect('localhost', 'test', initializeBoqbot);