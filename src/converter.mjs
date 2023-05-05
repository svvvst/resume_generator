import fs from 'fs';
import showdown from 'showdown';
import puppeteer from 'puppeteer';
import 
{
	CONFIG,
	VERBOSE,
	pp,
	loadJson,
	print,
	eh,
	PROJECT_ROOT,
	DEFAULT_CONFIG_PATH
} 
from './lib.mjs';

// FUNCTIONS

// This function replaces the content of an HTML element with a given id with the provided content
function injectHtml(htmlStr, id, insertion) {
	let srhExp = new RegExp( String.raw`(<\s*(\w+)\s*([^<>]*?)\sid\s*=\s*["']?(${id})["']?([^<>]*?)>)([\w\W]*?)(</\2>)`,'mi');

	return htmlStr.replace( srhExp, `$1${insertion}$7` );
}

// This function combines the contents of all provided file paths into a single string
function combine_styles(fpath_list) {
	let style ="";
	for (let fpath of fpath_list) {
		try {
			style += fs.readFileSync( fpath ).toString();
		} catch {
			print(`! Style '${fpath}' not found.`);
		}
	}
	return style;
}

// This function replaces all occurrences of a key in a string with the corresponding value from the provided substitution object
function replace_substitutions(mdStr, substitutionObj) {
	for (let key in substitutionObj)
		mdStr = mdStr.replace(`{{${key}}}`, substitutionObj[key]);
	return mdStr;
}

// This function formats the header of the resume by inserting the contact information as list items
function add_header(htmlStr, cdata) {
	let srhExp = new RegExp(String.raw`(<ul id=contact>.*?)(</ul>)`,'ms');
	let insStr;
	for (let key in cdata) {
		if (key == 'name') {
			// Add Name Header
			htmlStr = htmlStr.replace( /(id=name>.*?)(<\/)/ms,`$1${cdata.name}$2`);
			continue;  // name is not formatted as list item, ignored and used as heading
		}

		insStr = `<li>${cdata[key]}</li>`;
		htmlStr =  htmlStr.replace(srhExp,`$1${insStr}$2`);

	}
	return htmlStr;
}

// This function builds the resume by converting the markdown content to HTML and inserting it into the provided HTML string
// #todo: work with buffer instead of string
function buildResume(mdStr, htmlStr, cssStr, config) {
	const converter 	= new showdown.Converter();

	// Replace Substitution words per Config File
	mdStr = replace_substitutions(mdStr, config.substitutions);

	print('Converting markdown...');
	mdStr = converter.makeHtml(mdStr); // use showdown to convert md to html

	print('Formatting htmlStr...');

	// Header Formatting
	htmlStr = add_header(htmlStr, config.contact);

	// Insert converted resume content
	htmlStr = injectHtml(htmlStr, 'content', mdStr);

	// Insert style
	htmlStr = injectHtml(htmlStr, 'style', cssStr);

	return htmlStr;
}

// This function generates an HTML resume by reading the provided markdown content and template files
function generateHtmlResume(config) {
	const cssStr = combine_styles(config.style);

	print('Importing markdown...');
	let mdStr = fs.readFileSync(config.content).toString(); // Read markdown content from file
	let htmlStr = fs.readFileSync(config.template).toString(); // Read HTML template from file

	// Build the resume by inserting the markdown content and styles into the HTML template
	htmlStr = buildResume(mdStr, htmlStr, cssStr, config);

	print('Writing file...');
	fs.writeFile(config.saveas, htmlStr, eh); // Save the generated HTML resume to a file
	print(`HTML document saved to: "${config.saveas}"`);

	return htmlStr;
}

// PDFGEN

// This async function generates a PDF from the provided HTML and saves it with the specified properties
async function generatePDF(html, config) {
	// Launch a new Puppeteer browser instance with specified options
	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	const page = await browser.newPage(); // Create a new page in the browser instance
	await page.setContent(html); // Set the content of the page to the provided HTML

	// #todo make pdf settings configureable
	const pdfProperties = 
	{
		path: pp(config.pdf.saveas),
		format: 'Letter',
		printBackground: true
	}

	const pdf = await page.pdf(pdfProperties); // Generate a PDF from the page with the specified properties

	print('Document saved to: ' + CONFIG.pdf.saveas);
	await browser.close(); // Close the browser instance

	return config.pdf.saveas;
}

// Export the functions as an object
const default_export = {
	build: buildResume,
	toHtml: generateHtmlResume,
	toPdf: generatePDF,
};

// Export the default_export object as the default export
export { default_export as default };