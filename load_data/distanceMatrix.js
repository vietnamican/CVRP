function calculateEuclid(node, otherNode) {
    const verticalDistance = node.x - otherNode.x;
    const horizontalDistance = node.y - otherNode.y;
    return verticalDistance * verticalDistance + horizontalDistance * horizontalDistance;
}

module.exports.calculateDistanceMatrix = function (nodeSet) {
    const res = nodeSet.reduce((matrix, currentValue, currentIndex) => {
        const currentRow = nodeSet.map((node, index) => {
            return calculateEuclid(currentValue, node);
        })
        // console.log(currentRow);
        return [...matrix, currentRow]
    }, Array.apply([]));
    return res;
}

module.exports.neighbor = function (currentNode, nodeSet) {
    // console.log(nodeSet);
    let neighbor = nodeSet.filter(node => node.index !== currentNode.index);
    // console.log(neighbor);
    neighbor.sort((a, b) => {
        const distanceA = calculateEuclid(currentNode, a);
        const distanceB = calculateEuclid(currentNode, b);
        const different = distanceA - distanceB;
        return different;
    })
    // console.log(neighbor);
    return neighbor;
}