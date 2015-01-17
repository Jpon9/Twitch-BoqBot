// via http://jsfromhell.com/array/shuffle
function shuffleArray(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function invitePeople(sender, people, demonym, numOfInvites) {
	numOfInvites = numOfInvites > people.length ? people.length : numOfInvites;
	
	if (numOfInvites === 0) {
		chat.send(sender + ': No valid ' + demonym + 's could be invited.');
		return;
	}

	people = shuffleArray(people);
	people.slice(0, numOfInvites);

	var plurality = people.length > 1 ? 's have' : ' has';

	chat.send(sender + ': The following ' + demonym + plurality + ' been invited: ' + people.join(', '));
}

module.exports = {
	moderators: function(sender, numOfInvites) {
		invitePeople(sender, moderators.getMods(), 'moderator', numOfInvites);
	},

	viewers: function(sender, numOfInvites) {
		invitePeople(sender, cv.getAllChatters(true), 'viewer', numOfInvites);
	}
};