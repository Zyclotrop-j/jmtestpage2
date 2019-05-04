var path = require('path'), fs=require('fs');

function processNode(filename, schema) {
  schema.title = filename.toLowerCase();
  if(schema.properties) {
    Object.keys(schema.properties).forEach(key => {
      const u = schema.properties[key]["$ref"];
      if(!u) return;
      if(u === "#") return schema.properties[key] = filename.toLowerCase();
      if(u[0] === "#") return schema.properties[key] = schema.definitions[u.split("/").pop()];
      if(u.endsWith("possibleRefArray")) return schema.properties[key] = { "type": "string", "items": { "type": "string", "x-$ref": u.split(".").shift().toLowerCase() } };
      if(u.endsWith("possibleRef")) return schema.properties[key] = { "type": "string", "x-$ref": u.split(".").shift().toLowerCase() };
      throw new Error("Error on key "+key);
    });
    Object.keys(schema.properties).forEach(key => {
      if(!schema.properties[key].items) return;
      const u = schema.properties[key].items["$ref"];
      if(!u) return;
      if(u === "#") return schema.properties[key].items = filename.toLowerCase();
      if(u[0] === "#") return schema.properties[key].items = schema.definitions[u.split("/").pop()];
      if(u.endsWith("possibleRefArray")) return schema.properties[key] = { "type": "string", "items": { "type": "string", "x-$ref": u.split(".").shift().toLowerCase() } };
      if(u.endsWith("possibleRef")) return schema.properties[key].items = { "type": "string", "x-$ref": u.split(".").shift().toLowerCase() };
      throw new Error("Error on key "+key);
    });
  }
  if(schema.definitions){
    Object.keys(schema.definitions).forEach(key => {
      const u = schema.definitions[key];
      if(u.anyOf) { u.anyOf.forEach((i, idx) => {
  		if(!i["$ref"]) return;
      if(i["$ref"] === "#") return u.anyOf[idx] = { "type": "string", "x-$ref": filename.toLowerCase() };
  		if(i["$ref"].endsWith("possibleRefArray")) return u.anyOf[idx] = { "type": "string", "items": { "type": "string", "x-$ref": i["$ref"].split(".").shift().toLowerCase() } };
      if(i["$ref"].endsWith("possibleRef")) return u.anyOf[idx] = { "type": "string", "x-$ref": i["$ref"].split(".").shift().toLowerCase() };
      }  ); }
    });
  }
  schema.definitions = undefined;
  return schema;
}

function putAllOf(schema, writeto) {
  writeto.definitions = undefined;
  if(!schema.allOf) return;
  schema.allOf.forEach(i => {
    const schemaname = i["$ref"];
    console.log("Reading "+schemaname);
    const schemadata = JSON.parse(fs.readFileSync(schemaname, 'utf8'));
    putAllOf(schemadata, writeto);
    writeto.properties = {
      ...schemadata.properties,
      ...writeto.properties
    };
  });
  writeto.allOf = [];
}

var files=fs.readdirSync(".");
const t = files.filter(i => i.indexOf(".json") > -1).map(schemaname => {
  console.log(schemaname);
  return JSON.parse(fs.readFileSync(schemaname, 'utf8'));
});
fs.writeFile("allSchemas.txt", JSON.stringify(t, null, "  "), function(err) {
    if (err) return console.log(err);
});
console.log("Done");
return;

const allfiles = [];
function fromDir(startPath,filter){
    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (filename.indexOf(filter)>=0) {
            console.log('-- found: ',filename);
            allfiles.push(filename);
        };
    };
};
fromDir('.','.json');
const wait = allfiles.map(filename => {
  return new Promise((resolve, rej) => {
    fs.readFile(filename, 'utf8', function (err, data) {
      console.log("Opened "+filename);
      if (err) return rej(err);
      const type = filename.split(".").shift();
      const json = JSON.parse(data);
      json.definitions = undefined;
      json.allOf = undefined;
      // putAllOf(json, json);
      // processNode(type, json);
      console.log("Read " + filename);
      console.log("Would write "+filename+" "+JSON.stringify(json, null, "  "))
      resolve(() => new Promise((res, rejj) => fs.writeFile(filename, JSON.stringify(json, null, "  "), function(err) {
          if (err) return rejj(err);
          res('complete ' + filename);
      })));
    });
  })
});
return Promise.all(wait).then(i => {
  return Promise.all(i.map(j => {
    const ret = j();
    ret.then(i => { console.log(i); });
    return ret;
  }).then(i => {
    console.log("Success!")
  }));
});
