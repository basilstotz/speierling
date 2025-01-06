#!/usr/bin/env node

const fs = require('fs');
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}

/*
const { execSync } = require('child_process');
function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
*/

function addMeta(geodata){

    var geo=JSON.parse(geodata);
    
    var bilder;
    var path=process.argv[2];
    
    if (fs.existsSync(path)) {
	bilder=JSON.parse(fs.readFileSync(path));
    } else {
	console.log("file not found");
    }


    for (let i=0;i<geo.features.length;i++){
	
	let item=geo.features[i];
	
        let id=item.properties.id;
	if(bilder[id]){
	    geo.features[i].properties['pictures_url_prefix']='https://speierling.arglos.ch/node/'+id+'/';
	    geo.features[i].properties['pictures']=bilder[id];
	}
    }
    process.stdout.write(JSON.stringify(geo,null,2)+'\n');
	    
}


var chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    addMeta(chunks)
});


