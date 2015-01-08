var bot = null;
var messagesSent = 0;
var resetTime = 0;

module.exports = {
	/*	Sends a message to the channel
	 *	This function mainly serves to protect us from the
	 *	message sending rate limit which blocks us for 8 hrs
	 *	if we hit it.  For users, it's 20 msgs/30 seconds,
	 *	for mods it is 100 msgs/30 seconds
	 */
	init: function(client) {
		bot = client;
	},

	send: function(message) {
		var messageLimit = 20;
		if (moderators.isMod(settings.username)) {
			messageLimit = 100;
		}

		var now = Math.floor(new Date().getTime() / 1000);

		if (resetTime < now) {
			resetTime = now + 30;
			messagesSent = 0;
		}

		if (messagesSent >= messageLimit) {
			return;
		}

		bot.say(settings.channel, message);
	}
}