let Data = require("./load_data/index");
let data = new Data("./../Vrp-Set-X/X/X-n101-k25.vrp");

function getVerticeData(index) {
    return data.graphData[index - 1];
}

//----------------------------------------------------------------------------------

function calculateCost(solve) {
    return solve.reduce((cost, currentValue, currentIndex) => {
        const currentVertice = getVerticeData(currentValue);
        if (getVerticeData(solve[currentIndex + 1])) {
            const nextStepVerticeIndex = getVerticeData(solve[currentIndex + 1]).index;
            const nextStepVertice = currentVertice.neighbors.find(node => node.index == nextStepVerticeIndex);
            return cost + nextStepVertice.distance;
        } else {
            return cost;
        }
    }, 0)
}

//----------------------------------------------------------------------------------
function addVertice(index) {
    covered[index - 1] = true;
    solve.push(index);
}

function isCovered(index) {
    return covered[index - 1];
}

function isAllVerticesCovered(covered) {
    return covered.every(vertice => vertice);
}

/**
 * find the next vertice according to current vertice
 * find the closest vertice with current vertice
 */
function findNextStep({
    currentVertice,
    currentCapacity
}) {
    const neighbors = getVerticeData(currentVertice).neighbors;
    for (let element of neighbors) {
        if (!isCovered(element.index)) {
            addVertice(element.index);
            currentVertice = element.index;
            break;
        }
    }
    return [currentVertice, currentCapacity];
}

//----------------------------------------------------------------------------------
let covered = new Array(data.graphData.length).fill(false);
let solve = [];

function main() {
    const capacity = parseInt(data.capacity);
    let currentCapacity = capacity;
    let currentVertice = "1";
    addVertice(currentVertice);
    while (!isAllVerticesCovered(covered)) {
        [currentVertice, currentCapacity] = findNextStep({
            currentVertice,
            currentCapacity
        });
    }
    console.log(JSON.stringify(solve));
    console.log(calculateCost(solve));
}
main();