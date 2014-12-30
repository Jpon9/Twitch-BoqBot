function str_contains(str, words) {
	for (var word in words) {
		if (str.search(words[word]) !== -1) {
			return true;
		}
	}
	return false;
}

var greetings = [
	"hello", "hey", "howdy", "greetings",
	"what's up", "how's it going", "hi"
];

var insults = [
	"\\*\\*\\*", "fuck", "suck",
	"hate", "terrible", "damn",
	"dammit", "shit", "cunt",
	"bitch", "loser"
];

var compliments = [
	"awesome", "love", "great",
	"fantastic", "amazing", "best",
	"wonderful"
];

botHateList = ['soulprinter', 'tistergaming']

module.exports = {
	botMention: function(bot, channel_name, sender, text) {
		// If user is not on the hate list
		if (botHateList.indexOf(sender.toLowerCase()) === -1) {
			if (str_contains(text, greetings)) {
				bot.say(channel_name, "Howdy, " + sender + "!");
			} else if (str_contains(text, insults)) {
				bot.say(channel_name, "That's not very nice, " + sender + " :(");
			} else if (str_contains(text, compliments)) {
				bot.say(channel_name, "Aww, you're alright too, " + sender + " :D");
			}
		// If user is on the hate list
		} else {
			if (str_contains(text, greetings)) {
				bot.say(channel_name, "I'm not talking to you, " + sender + ".");
			} else if (str_contains(text, insults)) {
				bot.say(channel_name, "I already hate you enough, " + sender + ", why are you making me hate you more?");
			} else if (str_contains(text, compliments)) {
				bot.say(channel_name, "That's nice but I still hate you, " + sender + ".");
			}
		}
	}
};