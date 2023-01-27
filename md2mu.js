const fs = require('fs');
const cfg = require('./cfg.json');
var   showdown = require('showdown');

function eh(err) { if(err) {return console.log(err);} }
function returnProperty(obj,propertyStr)
{
	if (propertyStr.includes('.'))
	{
		propertyStr.split('.').forEach( 
			(propStr)=>
			{
				obj = obj[propStr]
			}
		);
	}
	return obj;
}
function myreplace(htmlStr,tagId,propertyStr)
{
	//var re = `(<[\w\s\n]+? id=[\"\"\w\s]+>)[\s\n]+?${tagId}[\s\n]+?(</[\w\s\n]+>)`
	var re = new RegExp(String.raw`(\w+ id\=${tagId}>).*?(</[\w\s]+>)`,'ms');//new RegExp(re);

	console.log(tagId);
	console.log('matching...');
	console.log(htmlStr.match(re));

	return htmlStr.replace(re,'$1'+returnProperty(cfg,propertyStr)+'$2');
}

const   converter = new showdown.Converter();
var   res  = converter.makeHtml(fs.readFileSync('resume_full').toString());
var   css  = fs.readFileSync(cfg.style).toString();

var html = fs.readFileSync(cfg.template).toString();


var replaceList = 
{	
	name:"contact.name",
	phone:"contact.phone",
	address:"contact.address"

}

    for (key in replaceList)
	{
		html = myreplace(html,key,replaceList[key]);
	}
   
    html = html.replace('</ content>',res);
    html = html.replace('</ style>', '<style>\n'+css+'\n</style>');

fs.writeFile(cfg.saveas,html,eh);

