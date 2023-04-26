#!/usr/bin/env node

import yargs from 'yargs';
import {default as converter} from '../src/md2mu.mjs';

import { CLI_CONFIG, CONFIG, pp } from '../src/lib.mjs';

class Entry
{
	name;
	obj;
	entries;

	constructor(name,obj)
	{
		return this.set(name,obj);
	}

	set(name,obj)
	{
		this.name = name;
		this.obj = obj;
		//this.entries = obj? Object.entries(obj) : [];

		return this;
	}

	set obj(obj)
	{
		this.obj = obj;
		this.entries = null;

		return this;
	}

	set name(name)
	{
		this.name = name;
		this.obj = null;
		this.entries = null;

		return this;
	}

	get entries()
	{
		return this.entries? this.entries : Object.entries(this.obj);
	}

	forEachEntry(fn)
	{
		for (let key in this.obj)
			fn({name:key,obj:this.obj[key]});
	}

	child(name) 
		{
			return this.obj[name];
		}
}

class ObjectTraverser
{
	root;
	curr;
	#child;

	constructor(obj,fn, unlessFn)
	{
		this.root   = new Entry(null,obj);
		this.curr = new Entry(null,obj);
		this.#child	= new Entry(null,null);
		
		this.#for_tree_nodes(this.root,fn,unlessFn);

		return this;
	}

	#for_tree_nodes(root,fn,unlessFn)
	{
		let parentNodes = new Array();
		parentNodes.push(root);


		// For each this.parent node, get its children and add them to the array.
		while (parentNodes.length > 0)
		{
			if (unlessFn && unlessFn(this.curr)) continue; // If unlessFn returns true, skip this this.parent.
			this.curr = parentNodes.pop()

			for (this.#child.name in this.curr.obj) 
			{ 
				if (this.curr.obj[this.#child.name])
				{
					//console.log(this.#child.name)
					this.#child.obj = this.curr.obj[this.#child.name];

					if (this.#child.obj && this.#child.obj.constructor.name === 'Object')	// If this.child is an object, add it to array to be processed later.
						parentNodes.push(this.#child);
				}
				this.#child = new Entry(null,null);
			}
			fn(this.curr);	// Do something with this.parent, etc.
		}
	}
}

const for_tree_nodes  = (treeRoot,fn,unlessFn) => { return new ObjectTraverser(treeRoot,fn,unlessFn); };


// function getVarNameStr (...) 
// {
// 	return Object.keys({variable})[0];
// }

// Take Command "Builder" obj and add defaults from config.
// command options must have same names as config.
function setDefaultsFromConfig(commandBuilder,config)
{
	let root = for_tree_nodes(commandBuilder, (curr) =>
	{
		let key = curr.name;
		
		if (config[key])
			curr.obj.default = 
			( 
				function ()
				{
					// Paths need to be reformatted.
					// If path, reformats it.

					if (config['paths'][key])
						switch (config[key].constructor.name)
						{
							case 'Array':
								return config[key].map(pp);
							case 'String':
								return pp(config[key]);

							default:
								throw new Error(`${key} is in the config.path array, but its values are not of type String or Array.`);
						}
					else
						return config[key];
				}
			)();
	}).root.obj;

	return root;
}

// argv should be same structure as config file
function conversion_handler(argv)
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
	,	builder:	setDefaultsFromConfig(CLI_CONFIG.builders.converter,CONFIG) // #todo save defaults to config 
		
	,	handler:	conversion_handler
	}

yargs(process.argv.splice(2)).command(commandsObj).help().argv;
