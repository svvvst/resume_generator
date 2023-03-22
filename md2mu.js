const fs = require('fs');
const showdown = require('showdown');
const cfg = require('./cfg.json');

// dummy err handler
function eh(err) { if(err) {return console.log(err);} }

const	cdata 		= cfg.contact;
const   converter 	= new showdown.Converter();

console.log('Importing markdown...');
let   res  		= converter.makeHtml(fs.readFileSync(cfg.content).toString());
const   css  		= ((paths)=>
{
	let style ="";
	for (let path of paths)
	{
		try 
		{
			style += fs.readFileSync(path).toString();
		}
		catch 
		{
			console.log(`! Style '${path}' not found.`);
		}
	}
	return style;
})(cfg.style)

var html = fs.readFileSync(cfg.template).toString();

// Replace Substitutions per Config File

for (entry of Object.entries(cfg.substitutions) )
	res = res.replace(`{{${entry[0]}}}`,entry[1]);

console.log('Formatting html...');

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
html = html.replace('</ style>', '<style>\n'+css+'\n</style>'); //`<link rel="stylesheet" href="${cfg.style}" />`); //

console.log("Saving html...");
fs.writeFile(cfg.saveas,html,eh);
console.log('html document saved to: ' + cfg.saveas);

