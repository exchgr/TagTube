/* requires */
Url = require('url');
app = require('express');

/* export request handlers */
module.exports = {

	/* given youTube url query, renders video view */
	parseUrl :
		function(req, res) {
			var videoPath = Url.parse(req.query.url, true).query.v
			res.redirect('/'+videoPath);
		},

	/* given youTube v query variable, renders video view */
	videoView : 
		function(req, res) {
			var options = {
				videoPath : req.params.videoPath
			};
			res.render('video.ejs', options);
		}
};
