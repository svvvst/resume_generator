#!/usr/bin/env node

import yargs from 'yargs';
import converter from '../src/md2mu.mjs';

const CONFIG = converter.CONFIG;
const argv = yargs();

// Take Command "Builder" obj and add defaults from config.
// command options must have same names as config.
function setDefaultsFromConfig(commandBuilder)
{
	for (let key in commandBuilder )
	{
		if (CONFIG[key])
			commandBuilder[key].default = (function ()
			{
				// If property is a path, format properly
				if (CONFIG['paths'][key])
					switch (CONFIG[key].constructor.name)
					{
						case 'Array':
							return CONFIG[key].map(converter.p);
							break;
						case 'String':
							return converter.p(CONFIG[key]);
						default:
							throw new Error(`${key} is in the config.path array, but its values are not of type String or Array.`);
					}
				else
					return CONFIG[key];
			})();
	}

	return commandBuilder;
}

// argv should be same structure as config file
function run_converter(argv)
{
	let resume = converter.toHtml(argv);	

	if (argv.type === 'pdf')
		resume = converter.toPdf(resume);

	return resume;
}

const generatorBuilderObj = setDefaultsFromConfig(
{	"type":
	{	describe: "Type of document to generate: 'html' or 'pdf'."
	,	type:'string'
	,	default: 'html'
	,	demandOption: false
	}
,	"v": 
	{ 	alias:"verbose"
	,	describe: "Set verbose."
	,	type: "boolean"
	,	default:false
	,	demandOption: false
}
,	"save-options":
	{
	}

,	"config": 
	{ 	alias:"c"
	,	describe: "Set config file."
	,	type: "string"
	,	demandOption: false
	}
,	"saveas": 
	{ 	alias:"s"
	,	describe: "Set html save location and filename."
	,	type: "string"
	,	demandOption: false
	}

,	"content": 
	{ 	alias:["f","resume","file"]
	,	describe: "Set resume markdown file."
	,	type: "string"
	,	demandOption: false
	}

,	"template": 
	{ 	alias:"t"
	,	describe: "Set resume template file."
	,	type: "string"
	,	demandOption: false
	}

,	"style": 
	{ 	
		alias:"y"
	, 	describe: "Set css style."
	, 	type: "array"
	,	demandOption: false
	}

	,	"substitutions": 
	{ 	
		alias:"b"
	, 	describe: "Substitution pairs."
	, 	type: "object"
	,	demandOption: false
	}

	,	"contact": 
	{ 	
		alias:"i"
	, 	describe: "Substitution pairs."
	, 	type: "object"
	,	demandOption: false
	}
});


const commandsObj = 
	{	command:	'gen [type] [file]'
	,	aliases:	['$0 [type]']
	,	describe:	'Generate html or pdf resume version.'
	,	builder:	generatorBuilderObj
		
	,	handler:	run_converter
	}

argv.command(commandsObj);
argv.parse();
