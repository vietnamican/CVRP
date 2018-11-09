let Data = require("./load_data/index");
// let data = new Data("./../Vrp-Set-X/X/X-n101-k25.vrp");
// let data = new Data("./../Vrp-Set-X/X/X-n200-k36.vrp");
let data = new Data("./../Vrp-Set-X/X/X-n101-k25.vrp");
// console.log(data.graphData[1]);
const { clone } = require("./utils");

function getVerticeData(index) {
    return data.graphData[index - 1];
}

//----------------------------------------------------------------------------------

function calculateRouteCoust(route) {
    const tempRoute = JSON.parse(JSON.stringify(route));
    if (tempRoute.length === 0) {
        return 0;
    }
    tempRoute.unshift("1");
    tempRoute.push("1");
    // console.log(tempRoute);
    return tempRoute.reduce((cost, currentValue, currentIndex) => {
        const currentVertice = getVerticeData(currentValue);
        if (getVerticeData(tempRoute[currentIndex + 1])) {
            const nextStepVerticeIndex = getVerticeData(
                tempRoute[currentIndex + 1]
            ).index;
            const nextStepVertice = currentVertice.neighbors.find(
                node => node.index == nextStepVerticeIndex
            );
            return cost + nextStepVertice.distance;
        } else {
            return cost;
        }
    }, 0);
}

function calculateSolveCost(solve) {
    return solve.reduce((routeCost, currentValue, currentIndex) => {
        return routeCost + calculateRouteCoust(currentValue);
    }, 0);
}

function recalculateCostWhenRemoveVertice(
    solve,
    cost,
    routeIndex,
    verticeIndex
) {
    let newRoute = clone(solve[routeIndex]);
    newRoute.unshift("1");
    newRoute.push("1");
    verticeIndex++;
    const currentVertice = newRoute[verticeIndex];
    const prevVertice = newRoute[verticeIndex - 1];
    const nextVertice = newRoute[verticeIndex + 1];
    const loss =
        getVerticeData(prevVertice).neighbors.find(
            node => node.index === currentVertice
        ).distance +
        getVerticeData(currentVertice).neighbors.find(
            node => node.index === nextVertice
        ).distance;
    const gain = getVerticeData(prevVertice).neighbors.find(
        node => node.index === nextVertice
    ).distance;
    const newConst = cost - loss + gain;
    return newConst;
}
function recalculateCostWhenAddVertice(
    solve,
    cost,
    routeIndex,
    verticeIndex,
    newVertice
) {
    let newRoute = clone(solve[routeIndex]);
    newRoute.splice(verticeIndex, 0, newVertice);
    newRoute.unshift("1");
    newRoute.push("1");
    verticeIndex++;
    const currentVertice = newRoute[verticeIndex];
    const prevVertice = newRoute[verticeIndex - 1];
    const nextVertice = newRoute[verticeIndex + 1];
    const gain =
        getVerticeData(prevVertice).neighbors.find(
            node => node.index === currentVertice
        ).distance +
        getVerticeData(currentVertice).neighbors.find(
            node => node.index === nextVertice
        ).distance;
    const loss = getVerticeData(prevVertice).neighbors.find(
        node => node.index === nextVertice
    ).distance;
    const newConst = cost - loss + gain;
    return newConst;
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
function findNextStep({ currentVertice, currentCapacity }) {
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
        if (
            tempCurrentVertice === currentVertice &&
            tempCurrentCapacity === currentCapacity
        ) {
            // route.push("1");
            break;
        } else {
            currentVertice = tempCurrentVertice;
            currentCapacity = tempCurrentCapacity;
            // console.log(currentVertice, currentCapacity);
            if (currentVertice !== "1") {
                route.push(currentVertice);
            }
        }
    }
    return route;
}

//----------------------------------------------------------------------------------
let covered = new Array(data.graphData.length).fill(false);
let solve = [];
//----------------------------------------------------------------------------------
function initialSolution(solve, currentVertice, currentCapacity) {
    while (!isAllVerticesCovered(covered)) {
        solve.push(takeAroute(currentVertice, currentCapacity));
        // currentVertice = "1";
        // addVertice(currentVertice);
    }
    return solve;
}

//----------------------------------------------------------------------------------

function isOverCapacity(route) {
    const capacity = parseInt(data.capacity);
    // console.log(route);
    const totalCapacity = route.reduce(
        (totalCapacity, currentValue, currentIndex) => {
            return (
                totalCapacity + parseInt(getVerticeData(currentValue).demand)
            );
        },
        0
    );
    // console.log(totalCapacity);
    return capacity < totalCapacity;
}

function relocate(solve, cost, relocateRouteIndex, relocateVerticeIndex) {
    let tempSolve = JSON.parse(JSON.stringify(solve));
    // console.log(tempSolve);
    let minCost = cost;
    // console.log("use function", minCost);
    let optimizeSolve = solve;
    let relocateVertice = tempSolve[relocateRouteIndex][relocateVerticeIndex];
    tempSolve[relocateRouteIndex].splice(relocateVerticeIndex, 1);
    const tempSolveCost = recalculateCostWhenRemoveVertice(
        solve,
        cost,
        relocateRouteIndex,
        relocateVertice
    );
    for (let i = 0; i < tempSolve.length; i++) {
        for (let j = 0; j <= tempSolve[i].length; j++) {
            let relocateSolve = JSON.parse(JSON.stringify(tempSolve));
            relocateSolve[i].splice(j, 0, relocateVertice);
            let relocateCost = recalculateCostWhenAddVertice(
                relocateSolve,
                tempSolveCost,
                i,
                j
            );
            if (relocateCost < minCost && isOverCapacity(relocateSolve[i])) {
                minCost = relocateCost;
                optimizeSolve = relocateSolve;
            }
        }
    }
    return [optimizeSolve, minCost];
}

function localSearch(solve) {
    const cost = calculateSolveCost(solve);
    let minCost = cost;
    let optimizeSolve = JSON.parse(JSON.stringify(solve));
    solve.forEach((route, routeIndex) => {
        route.forEach((vertice, verticeIndex) => {
            let [localSearchSolve, localSearchCost] = relocate(
                solve,
                cost,
                routeIndex,
                verticeIndex
            );
            // console.log(localSearchCost, routeIndex, verticeIndex);
            if (localSearchCost < minCost) {
                optimizeSolve = localSearchSolve;
                minCost = localSearchCost;
            }
        });
    });
    return optimizeSolve;
}

function main() {
    const capacity = parseInt(data.capacity);
    let currentCapacity = capacity;
    let currentVertice = "1";
    addVertice(currentVertice);
    solve = initialSolution(solve, currentVertice, currentCapacity);
    console.log(solve);
    console.log(calculateSolveCost(solve));
    let count = 0;
    // do {
    //     const improveSolve = localSearch(solve);
    //     if (calculateSolveCost(improveSolve) < calculateSolveCost(solve)) {
    //         solve = improveSolve;
    //     } else {
    //         break;
    //     }
    //     count++;
    // } while (count < 10);
    // console.log(solve);
    // console.log(calculateSolveCost(solve));
}
main();
