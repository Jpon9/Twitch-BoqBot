var db = require('./modules/database');

module.exports = {
	getRank: function(viewer) {
		var v = db.getViewerData(viewer);
	}
}