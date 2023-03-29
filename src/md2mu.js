const verbose = true;

const fs = require('fs');
const showdown = require('showdown');
const path = require('path');

const cfg = require('../cfg.json');
const root = path.join(__dirname,'..');

// FUNCTIONS

let print = verbose? console.log : ()=>{};

// dummy err handler
function eh(err) { if(err) {return print(err);} }

function p(fpath) 
{ 
	return path.join(root,fpath);
}

function injectHtml(htmlStr,id,insertion)
{
	let srhExp = new RegExp( String.raw`(<\s*(\w+)\s*([^<>]*?)\sid\s*=\s*["']?(${id})["']?([^<>]*?)>)([\w\W]*?)(</\2>)`,'mi');

	return htmlStr.replace( srhExp, `$1${insertion}$7` ); //`<${tag}>\n${insertion}\n</${tag}>`); //`<link rel="stylesheet" href="${cfg.style}" />`); //
}

function combine_styles(fpath_list)
{
	let style ="";
	for (let fpath of fpath_list)
	{
		try 
		{
			style += fs.readFileSync(p( p(fpath)) ).toString();
		}
		catch 
		{
			print(`! Style '${fpath}' not found.`);
		}
	}
	return style;
}

function replace_substitutions(mdStr,substitutionObj)
{
	for (entry of Object.entries(substitutionObj) )
		mdStr = mdStr.replace(`{{${entry[0]}}}`,entry[1]);
	return mdStr;
}

// Header Formatting
// for each property in obj, create new li tag
function add_header(htmlStr,cdata)
{

	let srhExp = new RegExp(String.raw`(<ul id=contact>.*?)(</ul>)`,'ms');
	let insStr;
	for (key in cdata) 
	{
		if (key == 'name') 
		{
			// Add Name Header
			htmlStr = htmlStr.replace( /(id=name>.*?)(<\/)/ms,`$1${cdata.name}$2`);
			continue;  // name is not formatted as list item, ignored and used as heading
		}

		insStr = `<li>${cdata[key]}</li>`;
		htmlStr =  htmlStr.replace(srhExp,`$1${insStr}$2`);

	}
	return htmlStr;
}

function buildResume(mdStr,htmlStr,cssStr,cfg)
{
	const   converter 	= new showdown.Converter();

	print('Converting markdown...');
	mdStr = converter.makeHtml(mdStr); // use showdown to convert md to html

	print('Formatting htmlStr...');

	// Header Formatting
	// for each property in obj, create new li tag
	htmlStr = add_header(htmlStr,cfg.contact);

	// Insert converted resume content
	htmlStr = injectHtml(htmlStr,'content',mdStr);

	// Insert style
	htmlStr = injectHtml(htmlStr,'style',cssStr);

	return htmlStr;
}

function generateHtmlResume(cfg)
{
	const	cdata 		= cfg.contact;
	const   cssStr  		= combine_styles(cfg.style);

	print('Importing markdown...');
	let 	mdStr		= fs.readFileSync(p(cfg.content)).toString(); // get htmlStr template
	let 	htmlStr 		= fs.readFileSync(p(cfg.template)).toString(); // get htmlStr template

	// Replace Substitution words per Config File
	mdStr = replace_substitutions(mdStr,cfg.substitutions);

	htmlStr = buildResume(mdStr,htmlStr,cssStr,cfg);

	print('Writing file...');
	fs.writeFile(cfg.saveas,htmlStr,eh);
	print('htmlStr document saved to: ' + cfg.saveas);
}

// MAIN
generateHtmlResume(cfg);
