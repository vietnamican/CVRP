module.exports = {
    calculateEuclid,
    calculateDistanceMatrix,
    neighbor
}

function calculateEuclid(node, otherNode) {
    const verticalDistance = node.x - otherNode.x;
    const horizontalDistance = node.y - otherNode.y;
    return Math.floor(Math.sqrt(verticalDistance * verticalDistance + horizontalDistance * horizontalDistance));
}

function calculateDistanceMatrix(nodeSet) {
    const res = nodeSet.reduce((matrix, currentValue, currentIndex) => {
        const currentRow = nodeSet.map((node, index) => {
            return calculateEuclid(currentValue, node);
        })
        // console.log(currentRow);
        return [...matrix, currentRow]
    }, Array.apply([]));
    return res;
}

/**
 * calculate the distance of a node broadcast, and sort them in ascendant 
 */
function neighbor(currentNode, nodeSet) {

    // remove itself to set of node
    // let neighbor = nodeSet.filter(node => node.index !== currentNode.index);
    let neighbor = nodeSet;
    neighbor = neighbor.map(node => ({ ...node,
        distance: calculateEuclid(currentNode, node)
    }))
    neighbor.sort((a, b) => {
        const distanceA = calculateEuclid(currentNode, a);
        const distanceB = calculateEuclid(currentNode, b);
        const different = distanceA - distanceB;
        if (different === 0) {
            // return a.demand - b.demand;
            const differentDemand = b.demand - a.demand;
            if (differentDemand === 0) {
                return b.x - a.x;
            }
            return differentDemand

        }
        return different;
    })
    return neighbor;
}