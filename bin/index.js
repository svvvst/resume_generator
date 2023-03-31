#!/usr/bin/env node

import yargs from 'yargs';
import main from '../src/md2mu.mjs';

const cfg = main.cfg;


function makeOptions(optionsObj)
{
	for (entry of obj.entries())
	{
		options.option(entry[0],entry[0]);	
	}
}

// Take Command "Builder" obj and add defaults from config.
// command options must have same names as config.
function setDefaultsFromConfig(commandBuilder)
{
	for (let entry of Object.entries(commandBuilder) )
	{
		if (cfg[entry[0]])
			commandBuilder[entry[0]].default = cfg[entry[0]];
	}

	return commandBuilder;
}

// argv should be same structure as config file
function run_converter(argv)
{
	let resume = main.generateHtmlResume(argv);	

	if (argv.type === 'pdf')
		resume = main.generatePdfResume(resume);

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
		alias:"s"
	, 	describe: "Set css style."
	, 	type: "string"
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