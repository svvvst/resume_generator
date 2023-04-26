import fs from 'fs';
import { join as pathJoin, dirname} from 'path';
import { pathToFileURL as u, fileURLToPath } from 'url';

export { join as pathJoin }         from 'path';

const __filename 	= fileURLToPath(import.meta.url);
const __dirname 	= dirname(__filename);

export const PROJECT_ROOT 	        = pathJoin(__dirname,'..');
export const DEFAULT_CONFIG_PATH    = 'cfg.json';
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