const fs = require('fs');
const cfg = require('./cfg.json');
var   showdown = require('showdown');

// dummy err handler
function eh(err) { if(err) {return console.log(err);} }

const   converter = new showdown.Converter();
var   res  = converter.makeHtml(fs.readFileSync(cfg.content).toString());
var   css  = fs.readFileSync(cfg.style).toString();
var html = fs.readFileSync(cfg.template).toString();
var cdata = cfg.contact;

// for each property in obj, create new li tag
var insStr;
var srhExp = new RegExp(String.raw`(<ul id=contact>.*?)(</ul>)`,'ms');

for (key in cdata) 
{
	if (key == 'name') continue;
	insStr = `<li>${cdata[key]}</li>`;
	html =  html.replace(srhExp,`$1${insStr}$2`);
}

srhExp = /(id=name>.*?)(<\/)/ms;
html = html.replace(srhExp,`$1${cdata.name}$2`);

html = html.replace('</ content>',res);

// Insert style in HTML
//html = html.replace('</ style>', '<style>\n'+css+'\n</style>');
	
fs.writeFile(cfg.saveas,html,eh);

