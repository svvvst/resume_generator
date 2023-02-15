// Scrap Code Below
// get property from str 
function returnProperty(obj,propertyStr)
{
	if (propertyStr.includes('.'))
	{
		propertyStr.split('.').forEach( 
			(propStr)=>
			{
				obj = obj[propStr];
			}
		);
	}
	return obj;
}

// tag replacer
function myreplace(htmlStr,tagId,propertyStr)
{
	//var re = `(<[\w\s\n]+? id=[\"\"\w\s]+>)[\s\n]+?${tagId}[\s\n]+?(</[\w\s\n]+>)`
	var re = new RegExp(String.raw`(\w+ id\=${tagId}>).*?(</[\w\s]+>)`,'ms');//new RegExp(re);

	//console.log(tagId);
	//console.log('matching...');
	//console.log(htmlStr.match(re));

	//return htmlStr.replace(re,'$1'+returnProperty(cfg,propertyStr)+'$2');
	return htmlStr.replace(re,'$1'+propertyStr+'$2');
}
