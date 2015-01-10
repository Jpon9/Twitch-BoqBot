var moderators = [settings.channel.replace('#','')];

module.exports = {
	add: function(nick) {
		if (moderators.indexOf(nick) === -1) {
			moderators.push(nick);
		}
	},

	remove: function(nick) {
		var index = moderators.indexOf(nick);
		if (index !== -1) {
			moderators.splice(index, 1);
		}
	},

	isMod: function(nick) {
		if (moderators.indexOf(nick) !== -1) {
			return true;
		} else {
			return false;
		}
	},

	getMods: function() {
		return moderators.slice();
	}
}