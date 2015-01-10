// via http://jsfromhell.com/array/shuffle
function shuffleArray(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function invitePeople(people, demonym, numOfInvites) {
	numOfInvites = numOfInvites > people.length ? people.length : numOfInvites;
	people = shuffleArray(people);
	people.slice(0, numOfInvites);
	chat.send('The following ' + demonym + ' have been invited: ' + people.join(', '));
}

module.exports = {
	moderators: function(numOfInvites) {
		invitePeople(moderators.getMods(), 'moderators', numOfInvites);
	},

	viewers: function(numOfInvites) {
		invitePeople(cv.getCurrentViewers(true), 'viewers', numOfInvites);
	}
};