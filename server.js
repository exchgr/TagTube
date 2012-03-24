var port = process.env.PORT || 4242

var express = require("express");
var app = express.createServer();
var routes = require("./routes/routes.js");

app.configure(function(){
	app.use(express.static(__dirname+"/public"));
});

app.listen(port);
console.log("server has started on port "+port);
