let Data = require("./load_data/index");
let data = new Data("./../Vrp-Set-X/X/X-n101-k25.vrp");

function getVerticeData(index) {
    return data.graphData[index - 1];
}

//----------------------------------------------------------------------------------

function calculateRouteCoust(route) {
    return route.reduce((cost, currentValue, currentIndex) => {
        const currentVertice = getVerticeData(currentValue);
        if (getVerticeData(route[currentIndex + 1])) {
            const nextStepVerticeIndex = getVerticeData(route[currentIndex + 1]).index;
            const nextStepVertice = currentVertice.neighbors.find(node => node.index == nextStepVerticeIndex);
            return cost + nextStepVertice.distance;
        } else {
            return cost;
        }
    }, 0)
}

function calculateSolveCost(solve){
    return solve.reduce((routeCost, currentValue, currentIndex)=>{
        return routeCost + calculateRouteCoust(currentValue);
    }, 0);
}
//----------------------------------------------------------------------------------
function addVertice(index) {
    covered[index - 1] = true;
    // solve.push(index);
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
    console.log(currentVertice);
    const neighbors = getVerticeData(currentVertice).neighbors;
    for (let element of neighbors) {
        if (!isCovered(element.index)) {
            if (currentCapacity - element.demand > 0) {
                addVertice(element.index);
                currentVertice = element.index;
                currentCapacity -= element.demand;
                break;
            }
        }
    }
    return [currentVertice, currentCapacity];
}


/**
 * 
 */
function takeAroute(currentVertice, currentCapacity, covered) {
    let route = [];
    while (currentCapacity > 0 || !isAllVerticesCovered(covered)) {
        let tempCurrentVertice = currentVertice;
        let tempCurrentCapacity = currentCapacity;
        [tempCurrentVertice, tempCurrentCapacity] = findNextStep({
            currentVertice,
            currentCapacity
        });
        if (tempCurrentVertice === currentVertice && tempCurrentCapacity === currentCapacity) {
            route.push("1");
            break;
        } else {
            route.push(currentVertice);
            currentVertice = tempCurrentVertice;
            currentCapacity = tempCurrentCapacity;
        }
    }
    return route;
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
        solve.push(takeAroute(currentVertice, currentCapacity));
        currentVertice = "1";
        addVertice(currentVertice);
    }
    console.log(JSON.stringify(solve));
    console.log(calculateSolveCost(solve));
}
main();