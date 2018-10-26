const path = require("path");
const fs = require("fs");
const pathName = path.join(__dirname, "./../Vrp-Set-X/X/X-n101-k25.vrp");

const loadNodeCoord = require("./loadNodeCoord");
const loadNodeDemand = require("./loadNodeDemand");
const distanceMatrix = require("./distanceMatrix");

const data = fs.readFileSync(pathName);
const dataString = data.toString();

const nodeCoord = loadNodeCoord.loadNodeCoord(dataString);
const nodeDemand = loadNodeDemand.loadNodeDemand(dataString);

let nodes = nodeCoord.map(((node, index)=>({...node, ...nodeDemand[index]})));
nodes = nodes.map((node)=>({...node, neighbors: distanceMatrix.neighbor(node, nodes)}));

console.log(nodes[0]);

