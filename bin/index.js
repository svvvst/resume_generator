#!/usr/bin/env node

// Import required modules
import yargs from 'yargs';
import {default as converter} from '../src/md2mu.mjs';
import { CLI_CONFIG, CONFIG, pp } from '../src/lib.mjs';

// Entry class for tree nodes
class Entry
{
	name;		// Node name
	obj;		// Node object
	parent;		// Node parent
	entries;	// Node entries

	constructor(name,obj,parent)
	{
		return this.set(name,obj,parent);
	}

	set(name,obj,parent)
	{
		this.name = name;
		this.obj = obj;
		this.parent = parent;

		// Clear entries
		this.entries = null;

		return this;
	}

	// Setter for obj property
	set obj(obj)
	{
		this.obj = obj;
		this.parent = null;

		// Clear entries
		this.entries = null;

		return this;
	}

	// Setter for name property
	set name(name)
	{
		this.name = name;

		// Clear obj and entries
		this.obj = null;
		this.entries = null;

		return this;
	}

	// Getter for entries property
	get entries()
	{
		// If entries are already defined, return them. Otherwise, create them.
		return this.entries? this.entries : Object.entries(this.obj);
	}

	// Loop over each entry in the object
	forEachEntry(fn)
	{
		for (let key in this.obj)
			fn({name:key,obj:this.obj[key]});
	}

	// Get child node by name
	child(name) 
	{
		return this.obj[name];
	}
}

// Object traverser class
class ObjectTraverser
{
	root;	// Root node

	curr;	// Current node
	#child;	// Child node of current node

	prev;	// Previous node
	next;	// Next node to be processed

	#nodeStack;

	constructor(obj,fn, unlessFn)
	{
		// Create new entry for root
		this.root   = new Entry(null,obj,null);
		this.next = this.root;

		this.#nodeStack = new Array();
		this.path = new Array();
		
		// Traverse the tree
		this.#for_tree_nodes(fn);

		return this;
	}

	// Traverse the object/property tree
	#for_tree_nodes(fn)
	{
		this.#nodeStack.push(this.root);

		// Loop over each parent node
		while (this.#nodeStack.length > 0)
		{
			// // If unlessFn returns true, skip this parent
			// if (unlessFn && unlessFn(this.curr)) continue; 
			this.prev = this.curr;
			this.curr = this.next;

			this.path.push(this.curr.name);
			//this.next = null;	// this.next represents next node to be processed, right now, that is unknown

			// Loop over each child node
			let curr_is_terminal = true;

			for (let child_name in this.curr.obj) 
			{ 
				if (this.curr.obj[child_name])
				{
					// Set child object
					this.#child = new Entry(child_name,this.curr.obj[child_name],this.curr);

					// If child is an object, add it to array to be processed later.
					if (this.#child.obj && this.#child.obj.constructor.name === 'Object')	
						{
							this.#nodeStack.push(this.#child);
							curr_is_terminal = false;
						}
				}
			}

			// #DONE figure out why next_is_redundant is not working. this line is supposed to remove redundant nodes from the stack
			// next_is_redundant needed to be redefined with every loop. Otherwise, value would be cached outside and not updated to true/false.
			// Changed to function to fix this.
			
			// #todo move outside of loop
			let next_is_redundant = ()=> {return this.#nodeStack.at(-1) && this.#nodeStack.at(-1).obj[this.curr.name] && (this.#nodeStack.at(-1).obj[this.curr.name] === this.curr.obj)};
			
			let next_was_redundant = false;
			while (this.#nodeStack.at(-1) === this.curr || next_is_redundant())
			{
				next_was_redundant = next_is_redundant() || next_was_redundant
				this.#nodeStack.pop();
				
				//curr_is_terminal = true; // This is redundant?
			}
			this.next = this.#nodeStack.at(-1);

			fn(this);

			if (curr_is_terminal)
				this.path.pop();

			if (next_was_redundant)
				this.path.pop();
		}
	}
}

// Traverse the tree nodes
const for_tree_nodes  = (treeRoot,fn,unlessFn) => { return new ObjectTraverser(treeRoot,fn,unlessFn); };

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

// Set defaults for options from config
// #wip use path property to deep copy values from config
function setDefaultsFromConfig(optionsConfig, config) {
	// Traverse the tree nodes
	let root = for_tree_nodes(optionsConfig, (traverser) => {
	  let key = traverser.curr.name;  
  
	  // Check if key is defined in the config and has a default value
	  if (config[key])
		traverser.curr.obj.default = (() => {
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
  

/// argv should be same structure as config file
function conversion_handler(argv) {
	let resume = converter.toHtml(argv);
  
	// If the type is pdf, generate a PDF version
	if (argv.type === 'pdf')
	  resume = converter.toPdf(resume, {
		path: pp(CONFIG.pdf.saveas),
		format: 'Letter',
		printBackground: true
	  }); // TODO: revise these for CLI access
  
	return resume;
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

yargs(process.argv.splice(2)).command(commandsObj).help().argv;
