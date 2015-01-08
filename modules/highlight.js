var highlights = [];

module.exports = {
	create: function(channel_name, description, highlighter) {
		description = description || "No description";
		channel_name = channel_name.replace('#', '');
		var now = Math.floor(new Date().getTime() / 1000);

		uptime.getTwitchStreamUptime(channel_name, now, function(streamUptime) {
			if (streamUptime === 0) { return 0; }

			var highlight = {
				timestamp: now,
				timestampStr: format.timestamp(streamUptime),
				description: description,
				highlighter: highlighter
			};

			highlights.push(highlight);
			chat.send(highlighter + ": Highlight added.");
		});
	},

	recap: function() {
		var i = 0;
		for (var h in highlights) {
			setTimeout(function(highlighter, timestampStr, description) {
					chat.send(highlighter + ': ' + timestampStr + " => " + description + " (hl'd by " + highlighter + ")");
				},
				1000 * i,
				highlights[h].highlighter,
				highlights[h].timestampStr,
				highlights[h].description
			);
			i += 1;
		}
	}
}