module.exports = {

	videoView : 
		function(req, res) {
			var options = {
				videoPath : req.params.videoPath
			};
			res.render(video.ejs, options);
		}
};
