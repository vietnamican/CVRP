const path = require("path");
const fs = require("fs");

const loadNodeCoord = require("./loadNodeCoord");
const loadNodeDemand = require("./loadNodeDemand");
const distanceMatrix = require("./distance");
const capacity = require("./capacity");

module.exports = readFile;

function readFile(pathString) {
    const pathName = path.join(__dirname, pathString);
    const data = fs.readFileSync(pathName);
    const dataString = data.toString();

    // return 
    this.capacity =  loadCapacity(dataString);
    this.graphData = loadGraphData(dataString);
}

const loadCapacity = function (dataString) {
    return capacity.loadCapacity(dataString);
}

const loadGraphData = function (dataString) {
    const nodeCoord = loadNodeCoord.loadNodeCoord(dataString);
    const nodeDemand = loadNodeDemand.loadNodeDemand(dataString);

    let nodes = nodeCoord.map(((node, index) => ({ ...node,
        ...nodeDemand[index]
    })));
    nodes = nodes.map((node) => ({ ...node,
        neighbors: distanceMatrix.neighbor(node, nodes)
    }));
    return nodes;
}