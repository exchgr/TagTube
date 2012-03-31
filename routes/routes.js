/* requires */
var Url = require('url');
var http = require('http');
var xml2js = require('xml2js');
var ent = require('ent');
var querystring = require('querystring');

/* parser */
var parser = new xml2js.Parser();


/* export request handlers */
module.exports = {

	/* takes url returns video path */
	parseVideoPath :
		function(req, res){
			var videoPath = Url.parse(req.query.url, true).query.v
			res.send({videoPath : videoPath});
		},

	/* given youTube url query, redirects video view */
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
		},
	
	indexView :
		function(req, res) {
			res.render('index.ejs', {});
		},

	/* get captions chugged through parsely */
	/* this runs really fast when parsely doesn't hate me, otherwise its slow */
	getCaptions : 
		function(req, res) {
			var videoPath = req.query.videoPath;
			
			/* make request for captions */	
			var capsXmlReq = {
				host : 'video.google.com',
				port : 80,
				path : '/timedtext?lang=en&v='+videoPath,
				method : 'GET'
			};
			http.request(capsXmlReq, function(capsXmlRes){
				capsXmlRes.setEncoding('utf8');
				var data = '';
				capsXmlRes.on('data', function(d) {
					data += d;
				});
				capsXmlRes.on('end', function() {
					/* convert xml captions to json */
					/* TODO handle if theres no caption */
					parser.parseString(data, function(err, captions){
						var numOfCalls = 0;
						var line, parseWaitHttpRequest, parseWaitReq, parseWaitPostData;
						for (var index in captions.text) {
							captions.text[index]["#"] = ent.decode(captions.text[index]["#"]);
							line = captions.text[index]["#"];
							parseWaitPostData = querystring.stringify({
								"wiki_filter" : false,
								"text" : line
							});
							
							
							if(index < 100){ //parsely gets mad at us otherwise
								parseWaitReq = {
									host : 'hack.parsely.com',
									port : 80,
									path : '/parse',
									method : 'POST',
									headers : {
										'Content-Type' : 'application/x-www-form-urlencoded',
										'Content-Length' : parseWaitPostData.length,
									}
								};
								/* doing some really dirty javascript after this point, but its 5am and I give 0 fucks */
								parseWaitHttpRequest = http.request(parseWaitReq, function(parseWaitRes) {
									parseWaitRes.setEncoding('utf8');
									var lineIndex = this.requestIndex;
									/* get the waiting url to poll for the parsed text for this line" */
									var waitUrl = '';
									parseWaitRes.on('data', function(d) {
										waitUrl += d;
									});
									parseWaitRes.on('end', function() {
										console.log(waitUrl);
										waitUrl = eval('('+waitUrl+')');
										
										var pollReq = {
											host : 'hack.parsely.com',
											port : 80,
											path : waitUrl["url"],
											method : 'GET'
										};
										var returned = true;
										var pollingInterval = setInterval(function(){
											if(returned){
												returned = false;
												//console.log("making an http request for "+lineIndex);
												http.request(pollReq, function(pollRes){
													pollRes.setEncoding('utf8');
													var pollStatus = '';
													pollRes.on('data', function(d){
														pollStatus += d;
													});
													pollRes.on('end', function(){
														pollStatus = eval('('+pollStatus+')');
														returned = true;
														
														if(pollStatus['status'] === 'DONE'){
															captions.text[lineIndex]["#"] = pollStatus['data'];
															clearInterval(pollingInterval);
															numOfCalls++;
															console.log("i have completed "+numOfCalls);
															if(numOfCalls == index || numOfCalls > 99){
																/* get them the hell out */
																res.send(captions);	
																
															}
														}
													});
												}).end();
											}
										}, 10000+(Math.random()*3000)); // this is because parsely hates us

									});
								});
								parseWaitHttpRequest.write(parseWaitPostData);
								parseWaitHttpRequest.requestIndex = index; // <- dirty javascript
								parseWaitHttpRequest.end();
							}
						}
					});	
				});
			}).end();
		}
};
