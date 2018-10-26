module.exports.loadNodeCoord = (dataString) => {
    const nodeCoordSection = dataString.match(/(?<=NODE_COORD_SECTION)[\w\W]+(?=DEMAND_SECTION)/g)[0];
    // console.log(nodeCoordSection);
    const nodeSplit = nodeCoordSection.split(/[\n]+/g);
    // console.log(nodeSplit);
    const cleanNode = nodeSplit.map(node => node.replace(/[\t\r]+/g, " "));
    // console.log(cleanNode);
    const nodeList = cleanNode
        .filter((node, index) => 0 < index && index < cleanNode.length - 1)
        .map(node => {
            const data = node.split(" ");
            return node !== " " ? ({
                index: data[0],
                x: data[1],
                y: data[2]
            }) : null;
        })

    return nodeList;
}