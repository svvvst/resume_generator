#!/usr/bin/env node

import yargs from 'yargs';
import {default as converter} from '../src/converter.mjs';
import { CLI_CONFIG, CONFIG, pp, for_tree_nodes, openFileInOs } from '../src/lib.mjs';

function formatPaths(strObj,eh)
{
	switch (strObj.constructor.name) {
		case 'Array':
			return strObj.map(pp);
		case 'String':
			return pp(strObj);

		default:
			eh();
	}
}

function getPropertyFromPath(obj,pathArr)
{
	for (let key of pathArr)
		if (key)	// skip null
			obj = obj[key];
	
	return obj;
}

// Set defaults for options from config
function setDefaultsFromConfig(optionsConfig, config) {
	// Traverse the tree nodes
	let root = for_tree_nodes(optionsConfig, (traverser) => {
	  let key = traverser.curr.name;  
	  
	  // Check if key is defined in the config and has a default value
	  if (getPropertyFromPath(config,traverser.path)) //(config[key])
		traverser.curr.obj.default = (() => 
		{
			// Check if the key is in the paths array in the config
			if (config['paths'][key])
			{
				let _eh = function (){throw new Error(`${key} is in the config.path array, but its values are not of type String or Array.`);}
				// If so, format the path
				return formatPaths(config[key],_eh);
			}
			else
				// Otherwise, return the value as is
				return config[key];
		})();
  
	}).root.obj;
  
	return root;
  }

  
  // YARGS Commands  

/// argv should be same structure as config file
async function conversion_handler(argv) {
	let resume = converter.toHtml(argv);
  
	// If the type is pdf, generate a PDF version
	if (argv.type === 'pdf')
	{
	  	resume = await converter.toPdf(resume, argv); // TODO: revise these for CLI access
	}
  
	openFileInOs(resume);
  }  

const commandsObj = 
{
	command: 'gen [type] [file]',
	aliases: ['$0 [type]'],
	describe: 'Generate html or pdf resume version.',
	builder: setDefaultsFromConfig(
		CLI_CONFIG.builders.converter,
		CONFIG
	),
	handler: conversion_handler
};

yargs(process.argv.splice(2)).command(commandsObj).help().wrap(160).argv;
