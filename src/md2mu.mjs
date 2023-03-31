export {default_export as default};

const verbose = true;

import fs from 'fs';
import showdown from 'showdown';
import path from 'path';
import puppeteer from 'puppeteer';


import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectroot = path.join(__dirname,'..');

const p = (pth)=>{ return 'file:\\\\'+path.join(projectroot,pth); }

const _cfg = import( p('cfg.json'), { assert: { type: 'json' } }).then( _=>
	{
		return _;
	});

const cfg = async ()=>{ 
	return import( async ()=>{p((await _cfg).config);}, { assert: { type: 'json' } } ).then(  _=>
	{
		return _;
	}); 
};

// FUNCTIONS

let print = verbose? console.log : ()=>{};

// dummy err handler
function eh(err) { if(err) {return print(err);} }


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
			style += fs.readFileSync( p(fpath) ).toString();
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
	const   cssStr  	= combine_styles(cfg.style);

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

// PDFGEN

async function generatePDF(html,pdfProperties) 
{
  const browser = await puppeteer.launch({
	  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf(pdfProperties);

  print('Document saved to: ' + cfg.pdf.saveas);
  await browser.close();
}



// generatePDF( html, { path: cfg.pdf.saveas, format: 'Letter', printBackground: true });


// MAIN
// generateHtmlResume(cfg);

// Default Export Object

const default_export =
{		_cfg:	_cfg
	,	cfg: 	cfg
	,	build:	buildResume
	,	toHtml:	generateHtmlResume
	,	toPdf:	generatePDF
	,	p
};
