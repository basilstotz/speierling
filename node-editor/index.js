
let ok=0;
let warn=1;
let error=2;

let allOk=true;

let url;
let sandbox=false;
let dryrun=false;

/*
const urlParams = new URLSearchParams(window.location.search);

if(urlParams.has("url"))url=urlParams("url");
if(urlParams.has("nosandbox"))sandbox=false;
if(urlParams.has("nodryrun"))dryrun=false;
*/

// some utils /////////////////////////////////////

function show(value){
     const node = document.createElement("p");
     node.innerHTML="<pre>"+JSON.stringify(value,null,2)+"</pre>";
     document.getElementById("body").appendChild(node);

}

function titel(){
    const node = document.createElement("h2");
    node.innerHTML="GeoJSON-Node-Editor (v0.1)";
    document.getElementById("body").appendChild(node);
}

function log(type, message){
    const node = document.createElement("p");
    let prefix;
    let postfix="";
    switch(type){
    case 0:
	node.setAttribute("style","color:green");
	prefix="&nbsp;&nbsp;&nbsp;Info: ";
	break;
    case 1:
	node.setAttribute("style","color:orange");
	prefix="Warning: ";
	break;
    case 2:
	node.setAttribute("style","color:red");
	prefix="&nbsp;&nbsp;Error: ";
	postfix=" Programm aborted"
	allOk=false;
	break;
    default:
	node.setAttribute("style","color:black");
	prefix="????";
	break;
    }
    node.innerHTML=prefix+message+postfix;
    document.getElementById("body").appendChild(node);     
}

//// start ///////////////////////77

//let sandbox=false;

let options;
if(sandbox){
  options = {
      mode: "popup",
      clientId: "it5NQIbKDxxULPOfYLrWt_rZWZj5BRgc2f7lOAc-pDk",
      redirectUrl: "https://speierling.arglos.ch/gis/node-editor/land.html",
      apiUrl: "https://master.apis.dev.openstreetmap.org",
      scopes: [ "write_api" ]  
  }
}else{
  options = {
      mode: "popup",
      clientId: "IaSKJRud9dgAQorBxqWWfqXemCm7fF_WuW6qICqyAOU",
      redirectUrl: "https://speierling.arglos.ch/gis/node-editor/land.html",
      scopes: [ "write_api" ]  
  }
}

if(!OSM.isLoggedIn()){
OSM.login(options)
  .then((arg) => {
      log(0,"Login is ok");
  })
  .catch((arg) => {
      log(2,"Login to OSM did not work: "+arg);
  });
}




async function uploadChangeset(features){

    let ans;
    let ok=true

    try {
        await OSM.authReady;
	ans = await OSM.uploadChangeset(	    
	    { created_by: "Geojson-Node-Editor", comment: "fix some tags" },
	    { create: [], modify: features, delete: [] }
	)} catch (error) {
	    ok=false;
	    log(2,"Error: "+error);
	}
    if(allOk){
        if(ok){
	    log(0,"Successfully uploaded "+features.length+" features. Programm is terminated");
	}else{
	    log(2,"An error occured during uplaod. Programm aborted");
	}
    }else{
	log(2,"An prior error occured, did not upload features");
    }
}


async function getFeatures(geo){

    let conflict=false;
    let ok=true;
    
    let features
    let nodeList=[];
    let indexed={};
    geo.features.forEach( (feature) => {
	let id=feature.properties.id
	nodeList.push(id);
	indexed[id]=feature;
    });
    
    try {
	features = await OSM.getFeatures("node",nodeList);
    } catch (error) {
	ok=false;
	log(2,error);
	allOk=false;
    }
    //show(features);
    if(ok){
	if(nodeList.length!=features.length){
	    log(2,'Not all Node are found');
	    allOk=false;
	}

	// check for conflicts

	for(let i=0;i<features.length;i++){
	    let feature=features[i];
	    let newFeature=indexed[feature.id];
	    let newVersion;
	    if(newFeature.properties&&newFeature.properties.meta&&newFeature.properties.meta.version){
		newVersion=newFeature.properties.meta.version;
	    }else{
		newVersion=newFeature.properties.version;
	    }
	    if(feature.version!=newVersion)conflict=true;
	}
	
	if(conflict){
	    log(2,"Conflicts found. Programm aborted");
	    allOk=false;
	}else{
	    log(0,"No conflicts")

	    // check for identical
	    let changedFeatures=[];
	    let identical=false;
	    let num=0;

	    for(let i=0;i<features.length;i++){
		let feature=features[i];

		let tags=feature.tags;
		let newTags=indexed[feature.id].properties.tags;

		let different=false;

		for (const [key, value] of Object.entries(newTags)) {
		    if(tags[key]){
			if(tags[key]!=value){
			    different=true;
			    tags[key]=value;
			}
		    }else{
			different=true;
			tags[key]=value;
		    }
		}
		if(different){
		    changedFeatures.push(feature);
		}else{
		    num++;
		}
		identical=!different;
	    }
	    if(identical){
		log(1,num+" identical features removed. There are now "+changedFeatures.length+" left")
	    }else{
		log(0,"No identical features")
	    }

	    if(changedFeatures.length==0){
		log(0,"Nothing to do. Programm ist terminated");
	    }else{
	       log(0,"Will change "+changedFeatures.length+" features");
	       show(changedFeatures);
	       //uploadChangeset(changedFeatures);
	    }
	}// if no conflict
    }else{
	log(2,"Could not download features. Programm aborted");
    }//if ok
    
}



async function getGeoJSON(url) {
    let maxlen=20;
      try {
	  const response = await fetch(url);
	  if (!response.ok) {
	      log(2,response.status)
	      throw new Error(`Response status: ${response.status}`);	
	  }
	  const json = await response.json();
	  //console.log(json);
	  if(json.type=='FeatureCollection'&&json.features){
	      log(0,'GeoJSON is ok');
	      let len=json.features.length;
	      if(len>0){
		  log(0, "GeoJSON has "+len+" features");
		  if(len>maxlen){
		      log(1,'GeoJSON is too big. It will be truncated to the first '+maxlen+' features');
		      len=maxlen;
		  }
		  let geoOut = { type: "FeatureCollection", features: [] }
		  for(let j=0;j<len;j++){
		      geoOut.features.push(json.features[j]);
		  }    
		  getFeatures(geoOut);
	      }else{
		  log(0,"The geoJSON has no features. Nothing to do. Programm terminated.");
	      }
	  }else{
	      log(2,"File is not geoJSON. Programm aborted");
	  }
      } catch (error) {
	  log(2, error.message);   
      }	
  }


titel();

/*
if(url){
    getGeoJSON("https://"+url)
}else{
    log(0,"use https://speierling.arglos.ch/gis/node-editor?url=your.domain.tld/../name.geojson")
}
*/

getGeoJSON('https://speierling.arglos.ch/gis/site/sorbusdomestica-diff.geojson');

  
