/* enviroment */
var port = process.env.PORT || 4242

/* requires */
var express = require("express");
var app = express.createServer();
var routes = require("./routes/routes.js");

/* configs */
app.configure(function(){
	app.use(express.static(__dirname+"/public"));
});
app.set('view engine', 'ejs');

/* CRUD */
app.get('/:videoId', routes.videoView);
app.get('/store', routes.store);

/* start 'er up */
app.listen(port);
console.log("server has started on port "+port);
