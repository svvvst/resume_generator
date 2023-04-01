#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import converter from '../src/md2mu.mjs';

import 
{
	CONFIG
,	CLI_CONFIG
,	pp
} 
from '../src/lib.mjs';



// Take Command "Builder" obj and add defaults from config.
// command options must have same names as config.
function setDefaultsFromConfig(commandBuilder,config)
{
	for (let key in commandBuilder )
	{
		if (config[key])
			commandBuilder[key].default = (function ()
			{
				// If property is a path, format properly
				if (config['paths'][key])
					switch (config[key].constructor.name)
					{
						case 'Array':
							return config[key].map(pp);
							break;
						case 'String':
							return pp(config[key]);
						default:
							throw new Error(`${key} is in the config.path array, but its values are not of type String or Array.`);
					}
				else
					return config[key];
			})();
	}

	return commandBuilder;
}

// argv should be same structure as config file
function run_converter(argv)
{
	let resume = converter.toHtml(argv);	

	if (argv.type === 'pdf')
		resume = converter.toPdf( resume, { path: pp(CONFIG.pdf.saveas), format: 'Letter', printBackground: true }); // TODO: revise these for CLI access

	return resume;
}

const commandsObj = 
	{	command:	'gen [type] [file]'
	,	aliases:	['$0 [type]']
	,	describe:	'Generate html or pdf resume version.'
	,	builder:	setDefaultsFromConfig(CLI_CONFIG.builders.converter,CONFIG)
		
	,	handler:	run_converter
	}

const argv = yargs(process.argv.splice(2)).command(commandsObj).help().argv;
