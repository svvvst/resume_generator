const fs = require('fs');
const cfg = require('./cfg.json');
var   showdown = require('showdown');

// dummy err handler
function eh(err) { if(err) {return console.log(err);} }

const	cdata 		= cfg.contact;
const   converter 	= new showdown.Converter();
const   res  		= converter.makeHtml(fs.readFileSync(cfg.content).toString());
const   css  		= fs.readFileSync(cfg.style).toString();

var html = fs.readFileSync(cfg.template).toString();


// Header Formatting
// for each property in obj, create new li tag
var insStr;
var srhExp = new RegExp(String.raw`(<ul id=contact>.*?)(</ul>)`,'ms');

for (key in cdata) 
{
	if (key == 'name') continue;  // name is not formatted as list item, ignored and used as heading
	insStr = `<li>${cdata[key]}</li>`;
	html =  html.replace(srhExp,`$1${insStr}$2`);
}

// Add Name Header
srhExp = /(id=name>.*?)(<\/)/ms;
html = html.replace(srhExp,`$1${cdata.name}$2`);

// Insert converted resume content
html = html.replace('</ content>',res);

// Insert style
html = html.replace('</ style>', `<link rel="stylesheet" href="${cfg.style}" />`); //'<style>\n'+css+'\n</style>');
	
fs.writeFile(cfg.saveas,html,eh);


