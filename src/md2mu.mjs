export {default_export as default};

const verbose = true;

import fs from 'fs';
import { join as pathJoin, dirname} from 'path';
import showdown from 'showdown';
import puppeteer from 'puppeteer';
import { pathToFileURL as u, fileURLToPath } from 'url';

const __filename 	= fileURLToPath(import.meta.url);
const __dirname 	= dirname(__filename);
const PROJECT_ROOT 	= pathJoin(__dirname,'..');

const p = (pth)=>{ return pathJoin(PROJECT_ROOT,pth); }

// Import JSON Configs
const DEFAULT_CONFIG_PATH = 'cfg.json';
const {default:_CONFIG} = await import( u(p(DEFAULT_CONFIG_PATH)), 	{ assert: { type: 'json' }});
const {default: CONFIG} = await import( u(p(_CONFIG.config)), 		{ assert: { type: 'json' }});


// FUNCTIONS

let print = verbose? console.log : ()=>{};

// dummy err handler
function eh(err) { if(err) {console.log(err);} }

function injectHtml(htmlStr,id,insertion)
{
	let srhExp = new RegExp( String.raw`(<\s*(\w+)\s*([^<>]*?)\sid\s*=\s*["']?(${id})["']?([^<>]*?)>)([\w\W]*?)(</\2>)`,'mi');

	return htmlStr.replace( srhExp, `$1${insertion}$7` ); //`<${tag}>\n${insertion}\n</${tag}>`); //`<link rel="stylesheet" href="${CONFIG.style}" />`); //
}

function combine_styles(fpath_list)
{
	let style ="";
	for (let fpath of fpath_list)
	{
		try 
		{
			style += fs.readFileSync( fpath ).toString();
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
	for (let key in substitutionObj)
		mdStr = mdStr.replace(`{{${key}}`,substitutionObj[key]);
	return mdStr;
}

// Header Formatting
// for each property in obj, create new li tag
function add_header(htmlStr,cdata)
{

	let srhExp = new RegExp(String.raw`(<ul id=contact>.*?)(</ul>)`,'ms');
	let insStr;
	for (let key in cdata) 
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

function buildResume(mdStr,htmlStr,cssStr,config)
{
	const   converter 	= new showdown.Converter();

	print('Converting markdown...');
	mdStr = converter.makeHtml(mdStr); // use showdown to convert md to html

	print('Formatting htmlStr...');

	// Header Formatting
	// for each property in obj, create new li tag
	htmlStr = add_header(htmlStr,config.contact);

	// Insert converted resume content
	htmlStr = injectHtml(htmlStr,'content',mdStr);

	// Insert style
	htmlStr = injectHtml(htmlStr,'style',cssStr);

	return htmlStr;
}

function generateHtmlResume(config)
{
	const	cdata 		= config.contact;
	const   cssStr  	= combine_styles(config.style);

	print('Importing markdown...');
	let 	mdStr		= fs.readFileSync(config.content).toString(); // get htmlStr template
	let 	htmlStr 	= fs.readFileSync(config.template).toString(); // get htmlStr template

	// Replace Substitution words per Config File
	mdStr = replace_substitutions(mdStr,config.substitutions);

	htmlStr = buildResume(mdStr,htmlStr,cssStr,config);

	print('Writing file...');
	fs.writeFile(config.saveas,htmlStr,eh);
	print('htmlStr document saved to: ' + config.saveas);
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

  print('Document saved to: ' + CONFIG.pdf.saveas);
  await browser.close();
}

const default_export =
{		_CONFIG:	_CONFIG
	,	CONFIG: 	CONFIG
	,	build:	buildResume
	,	toHtml:	generateHtmlResume
	,	toPdf:	generatePDF
	,	p
};
