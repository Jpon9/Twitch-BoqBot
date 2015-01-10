var spotifyApiWrapper = require('spotify-web-api-node');
var util = require('util');

var tokenExpirationEpoch;

var spotify = new spotifyApiWrapper({
	clientId : settings.spotify.oauth.client_id,
	clientSecret : settings.spotify.oauth.client_secret,
	redirectUri : settings.spotify.oauth.redirect_uri
});

function refreshAccessToken() {
	spotify.refreshAccessToken()
		.then(
			function(data) {
				var now = Math.floor(new Date().getTime() / 1000);
				// The epoch in seconds of the expiration of the token
				tokenExpirationEpoch = now + data['expires_in'];
				db.updateSpotifyUser(settings.spotify.current_user, data['access_token'], data['refresh_token'], tokenExpirationEpoch);
				console.log('Refreshed Spotify access token. It will expire in exactly ' + format.seconds(tokenExpirationEpoch - now) + '.');
				setTimeout(refreshAccessToken, (data['expires_in'] - 5) * 1000);
			},
			function(err) {
				console.error('Could not refresh the Spotify access token!', err);
			}
		);
}

module.exports = {
	// Alias of addSongs that takes one song instead of an array
	addSong: function(sender, spotify_id) {
		module.exports.addSongs(sender, [spotify_id]);
	},

	// Takes an array of songs, usually the alias above is used more frequently
	addSongs: function(sender, spotify_ids) {
		spotify.addTracksToPlaylist(settings.spotify.current_user, '64n69M2EintjjtB87POxtk', spotify_ids)
			.then(
				function(data) {
					var plurality = spotify_ids.length > 1 ? 's have' : ' has';
					chat.send(sender + ': Your track' + plurality + ' been added.');
				},
				function(err) {
					console.error('Something went wrong adding a song to the Spotify playlist!', err);
					if (err === '[Error: The access token expired]') {
						console.info('String detectable! spotify.js:45');
					}
				}
			);
	},

	// Initializes the Spotify authentication stuff and refreshes our access token.
	init: function() {
		db.getSpotifyUser(settings.spotify.current_user, function(currentUserData) {
			if (currentUserData === null) {
				spotify.authorizationCodeGrant(settings.spotify.oauth.authorization_code)
					.then(
						function(data) {
							// Set the access token and refresh token
							spotify.setAccessToken(data['access_token']);
							spotify.setRefreshToken(data['refresh_token']);

							// Save the amount of seconds until the access token expired
							tokenExpirationEpoch = Math.floor(new Date().getTime() / 1000) + data['expires_in'];
							setTimeout(refreshAccessToken, (data['expires_in'] - 5) * 1000);
							console.log('Retrieved Spotify access token. It will expire in exactly ' + format.seconds(tokenExpirationEpoch - new Date().getTime() / 1000) + '.');

							var user = {
								username: settings.spotify.current_user,
								access_token: data['access_token'],
								refresh_token: data['refresh_token'],
								expiration_epoch: tokenExpirationEpoch
							}
							
							db.addSpotifyUser(user);
						},
						function(err) {
							console.error('Something went wrong when retrieving the Spotify access token!', err);
						}
					)
			} else {
				spotify.setAccessToken(currentUserData.access_token);
				spotify.setRefreshToken(currentUserData.refresh_token);
				refreshAccessToken();
			}
		});
	}
};