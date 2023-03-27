const fs = require('fs');
const showdown = require('showdown');
const cfg = require('./cfg.json');

// FUNCTIONS

// dummy err handler
function eh(err) { if(err) {return console.log(err);} }

// function getElementById(html,id)
// {
// 
// 
// 	let regexList = new RegExp( String.raw( `(?<tag1><\s*(?<eltype>\w+)\s*([^<>]*?)\sid\s*=\s*["']?(${id})["']?([^<>]*?)>)(?<innerHtml>[\w\W]*?)(</\2>)` ),'mi').exec(html);
// 
// 	regexList.substitute = function (subStr)
// 	{
// 		this.f
// 
// 	}.bind(regexList);
// 
// 	return regexList;
// }

function injectHtml(html,id,insertion)
{
	let srhExp = new RegExp( String.raw`(<\s*(\w+)\s*([^<>]*?)\sid\s*=\s*["']?(${id})["']?([^<>]*?)>)([\w\W]*?)(</\2>)`,'mi');

	return html.replace( srhExp, `$1${insertion}$7` ); //`<${tag}>\n${insertion}\n</${tag}>`); //`<link rel="stylesheet" href="${cfg.style}" />`); //
}

function combine_styles(path_list)
{
	let style ="";
	for (let path of path_list)
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
}

function replace_substitutions(res,substitutionObj)
{
	for (entry of Object.entries(substitutionObj) )
		res = res.replace(`{{${entry[0]}}}`,entry[1]);
	return res;
}

// Header Formatting
// for each property in obj, create new li tag
function add_header(html,cdata)
{

	let srhExp = new RegExp(String.raw`(<ul id=contact>.*?)(</ul>)`,'ms');
	let insStr;
	for (key in cdata) 
	{
		if (key == 'name') 
		{
			// Add Name Header
			html = html.replace( /(id=name>.*?)(<\/)/ms,`$1${cdata.name}$2`);
			continue;  // name is not formatted as list item, ignored and used as heading
		}

		insStr = `<li>${cdata[key]}</li>`;
		html =  html.replace(srhExp,`$1${insStr}$2`);

	}
	return html;
}


// MAIN

const	cdata 		= cfg.contact;
const   converter 	= new showdown.Converter();
const   css  		= combine_styles(cfg.style);

console.log('Importing markdown...');

let   	res  		= converter.makeHtml(fs.readFileSync(cfg.content).toString()); // use showdown to convert md to html
let 	html 		= fs.readFileSync(cfg.template).toString(); // get html template


// Replace Substitution words per Config File
res = replace_substitutions(res,cfg.substitutions);

console.log('Formatting html...');

// Header Formatting
// for each property in obj, create new li tag
html = add_header(html,cdata);

// Insert converted resume content
html = injectHtml(html,'content',res);

// Insert style
html = injectHtml(html,'style',css);

console.log("Saving html...");
fs.writeFile(cfg.saveas,html,eh);
console.log('html document saved to: ' + cfg.saveas);

