/* enviroment */
var port = process.env.PORT || 4242

/* requires */
var express = require("express");
var app = express.createServer();
var routes = require("./routes/routes.js");

/* configs */
app.configure(function(){
	app.use(express.static(__dirname+"/public"));
	app.set('views', __dirname+'/views');
	app.set('view engine', 'ejs');
	app.set('view options', {
		layout : false
	});
});

/* CRUD */
app.get('/favicon.ico', function(req, res){
	return null;
});

app.get('/parseUrl', routes.parseUrl);

app.get('/getCaptions', routes.getCaptions);

app.get('/:videoPath', routes.videoView);

app.get('/', routes.indexView);


/* start 'er up */
app.listen(port);
console.log("server has started on port "+port);
