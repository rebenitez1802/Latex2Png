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

app.post('/', function (req, res) {
	
	var promises = [];console.log(req.body);
	for(var item in req.body.list){
		var scale = 1;
		var stylesObject=null;
		if(req.body.list[item].cssText!='' || req.body.list[item].cssText!=undefined){
			var style = req.body.list[item].cssText;
			var font_weight = new RegExp(/font-weight: (\w+);/);
			var font_size = new RegExp(/font-size: ([\w\.]+);/);
			var color = new RegExp(/color: (\w+);/);
			stylesObject= {};
			stylesObject[".MathJax .merror"]={};
			if(font_weight.exec(style))
				stylesObject[".MathJax .merror"]["font-weight"]= font_weight.exec(style)[1];
			if(font_size.exec(style)){
				var cssFontSizeString = font_size.exec(style)[1];
				var patt2 = new RegExp(/(\d+\.\d+)px;/);
				var actualSize = parseFloat(patt2.exec(style)[1]);
				stylesObject[".MathJax .merror"]["font-size"]= font_size.exec(style)[1];
				scale=actualSize/17;
			}
			if(color.exec(style))
				stylesObject[".MathJax .merror"]["color"]= color.exec(style)[1];
			if(req.body.list[item].scale!= '' && req.body.list[item].scale!=undefined)
				scale=req.body.list[item].scale

		}
		console.log(stylesObject);
		mjAPI.config({
			MathJax:{
				style:stylesObject
			}
		})
		promises.push(mjAPI.typeset({scale:scale ,png:true, math:req.body.list[item].math}));
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
		res.setHeader('Access-Control-Allow-Methods', '*');
		res.setHeader('Access-Control-Allow-Headers', '*');
	    res.setHeader('Content-Type', 'application/json');
  		
  		res.send(JSON.stringify(ress));
	});
	
	
});
app.get('/', function (req, res) {
	res.send(JSON.stringify({test:'OK'}))
	
	
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

 