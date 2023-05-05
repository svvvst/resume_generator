import fs from 'fs';
import { join as pathJoin, dirname} from 'path';
import { pathToFileURL as u, fileURLToPath } from 'url';
import child_process from 'child_process';

export { join as pathJoin }         from 'path';

const __filename 	= fileURLToPath(import.meta.url);
const __dirname 	= dirname(__filename);

export const PROJECT_ROOT 	        = pathJoin(__dirname,'..');
export const DEFAULT_CONFIG_PATH    = 'config_default.json';
export const CLI_CONFIG_PATH        = 'bin/cli.json';
export const VERBOSE = true;


// Import JSON Configs
export const _CONFIG    = loadJson( pp(DEFAULT_CONFIG_PATH) );
export const CONFIG     = loadJson( pp(_CONFIG.config) );

export const CLI_CONFIG = loadJson( pp(CLI_CONFIG_PATH) );


// FUNCTIONS

// Project Path /relative path
export function pp(pth)
    {   return pathJoin(PROJECT_ROOT,pth);      }

export function loadJson (fpath)
    {   return JSON.parse(fs.readFileSync( fpath ));   }

export let print = VERBOSE? console.log : (_)=>{};

// dummy err handler
export function eh(err) 
    {   if(err) { console.log(err); }           }


// Open file in OS with default program
// https://stackoverflow.com/questions/71145053/open-file-with-oss-default-application
export function openFileInOs(path) {
	let command;
  	let args = [];

  switch (process.platform) {
    case 'darwin': // macOS
      command = 'open';
      args = [path];
      break;
    case 'win32': // Windows
      command = 'cmd.exe';
      args = ['/c', 'start', '""', path];
      break;
    case 'linux': // Linux
      command = 'xdg-open';
      args = [path];
      break;
    default:
      console.error('Unsupported platform:', process.platform);
      return;
  }

  const child = child_process.spawn(command, args, { stdio: 'ignore' });
  child.on('error', (error) => {
    console.error(`Failed to open file: ${error.message}`);
  });
}


// CLASSES

// Tree

// Entry class for tree nodes
class Entry
{
	name;		// Node name
	obj;		// Node object
	parent;		// Node parent
	entries;	// Node entries

	constructor(name=null,obj=null,parent=null)
	{
		return this.setme(name,obj,parent);
	}

	setme(name=null,obj=null,parent=null)
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
const NULL_ENTRY = new Entry();
class ObjectTraverser
{
	root;	// Root node

	parent; // Parent node
	child;	// Child node

	curr;	// Current node pointer
	prev;	// Previously processed node pointer
	next;	// Next node to be processed

	node_is_child = false;	// Flag to indicate if current node is a child of previous node

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
			this.prev = this.parent;
			this.parent = this.next;
			this.curr = this.parent;

			this.path.push(this.parent.name);
			//this.next = null;	// this.next represents next node to be processed, right now, that is unknown

			// Loop over each child node
			let curr_is_terminal = true;
			this.node_is_child = true;
			for (let child_name in this.parent.obj) 
			{ 
				if (this.parent.obj[child_name])
				{
					// Set child object
					this.child = new Entry(child_name,this.parent.obj[child_name],this.parent);

					// If child is an object, add it to array to be processed later.
					if (this.child.obj && this.child.obj.constructor.name === 'Object')	
						{
							this.#nodeStack.push(this.child);
							curr_is_terminal = false;
						}
					//else fn(this);
				}
			}
			this.node_is_child = false;
			this.child = NULL_ENTRY;
			

			// #DONE figure out why next_is_redundant is not working. this line is supposed to remove redundant nodes from the stack
			// next_is_redundant needed to be redefined with every loop. Otherwise, value would be cached outside and not updated to true/false.
			// Changed to function to fix this.
			
			// #todo move outside of loop
			let next_is_redundant = ()=> {return this.#nodeStack.at(-1) && this.#nodeStack.at(-1).obj[this.parent.name] && (this.#nodeStack.at(-1).obj[this.parent.name] === this.parent.obj)};
			
			let next_was_redundant = false;
			while (this.#nodeStack.at(-1) === this.parent || next_is_redundant())
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
export const for_tree_nodes  = (treeRoot,fn,unlessFn) => { return new ObjectTraverser(treeRoot,fn,unlessFn); };