var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.json());  
var mjAPI = require("mathjax-node-svg2png");
mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  }
});
mjAPI.start();
 
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/', function (req, res) {
	var promises = [];console.log(req.body);
	for(var item in req.body.list){
		console.log('adding '+req.body.list[item].math+ ' '+item);
		promises.push(mjAPI.typeset({png:true, math:req.body.list[item].math}));
	}
	Promise.all(promises).then(function(values){
		var ress = {pngs:[]};
		
		for(var i in values){
			
			if(values[i].png){
				ress.pngs.push({png:values[i].png, id:req.body.list[i].id});
			}else{
				ress.pngs.push({error:'error', id:req.body.list[i].id});
			}
			
		}
		res.setHeader('Access-Control-Allow-Origin', '*');
	    res.setHeader('Content-Type', 'application/json');
  		
  		res.send(JSON.stringify(ress));
	});
	
	
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

 