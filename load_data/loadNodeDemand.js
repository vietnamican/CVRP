module.exports.loadNodeDemand = (dataString) => {
    const nodeCoordSection = dataString.match(/(?<=DEMAND_SECTION)[\w\W]+(?=DEPOT_SECTION)/g)[0];
    // console.log(nodeCoordSection);
    const nodeSplit = nodeCoordSection.split(/[\n]+/g);
    // console.log(nodeSplit);
    const cleanNode = nodeSplit.map(node => node.replace(/[\t\r]+/g, " "));
    // console.log(cleanNode);
    let nodeList = cleanNode
        .filter((node, index) => 0 < index && index < cleanNode.length - 1)
        .map(node => {
            const data = node.split(" ");
            return node !== " " ? ({
                index: data[0],
                demand: data[1]
            }) : null;
        })
    // nodeList.unshift({index: "0", demand: "0"})
    return nodeList;
}