var hal9000 = require('./hal9000.json');

function str_contains(str, words) {
	for (var word in words) {
		if (str.search(words[word]) !== -1) {
			return true;
		}
	}
	return false;
}

function getRandomResponse(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}

botHateList = ['soulprinter', 'tistergaming']

module.exports = {
	botMention: function(bot, channel_name, sender, text) {
		var hateList = botHateList.indexOf(sender.toLowerCase()) !== -1 ? 'hatelist' : 'normal';
		if (str_contains(text, hal9000.triggers.greetings1)) {
			bot.say(channel_name, getRandomResponse(hal9000.responses[hateList].greetings1).replace('{SENDER}', sender));
		} else if (str_contains(text, hal9000.triggers.greetings2)) {
			bot.say(channel_name, getRandomResponse(hal9000.responses[hateList].greetings2).replace('{SENDER}', sender));
		} else if (str_contains(text, hal9000.triggers.insults)) {
			bot.say(channel_name, getRandomResponse(hal9000.responses[hateList].insults).replace('{SENDER}', sender));
		} else if (str_contains(text, hal9000.triggers.compliments)) {
			bot.say(channel_name, getRandomResponse(hal9000.responses[hateList].compliments).replace('{SENDER}', sender));
		}
	}
};