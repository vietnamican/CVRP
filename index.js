const MAX_LOCALSEARCH = 200;
const MAX_LOCALSEARCH_UNIMPROVE = 50;
let Distance = require("./load_data/distance");
let Data = require("./load_data/index");
// let data = new Data("./../Vrp-Set-X/X/X-n101-k25.vrp");
let data = new Data("./../Vrp-Set-X/X/X-n200-k36.vrp");
// let data = new Data("./../Vrp-Set-X/X/X-n1001-k43.vrp");
// let data = new Data("./../Vrp-Set-X/X/X-n204-k19.vrp");
const {
    clone
} = require("./utils");

function getVerticeData(index) {
    return data.graphData[index - 1];
}

function calculateEuclid(verticeA, verticeB) {
    if (!verticeA) {
        verticeA = "1";
    }
    if (!verticeB) {
        verticeB = "1";
    }
    return Distance.calculateEuclid(
        getVerticeData(verticeA),
        getVerticeData(verticeB)
    );
}
//----------------------------------------------------------------------------------

function calculateRouteCoust(route) {
    const tempRoute = JSON.parse(JSON.stringify(route));
    if (tempRoute.length === 0) {
        return 0;
    }
    tempRoute.unshift("1");
    tempRoute.push("1");
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

//----------------------------------------------------------------------------------

function isOverCapacity(capacities, routeIndex) {
    return capacities[routeIndex] > data.capacity;
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
function takeAroute(currentVertice, capacity) {
    let currentCapacity = capacity;
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
    return [route, capacity - currentCapacity];
}

//----------------------------------------------------------------------------------
let covered = new Array(data.graphData.length).fill(false);
let solve = [];
let capacities = [];
//----------------------------------------------------------------------------------
function initialSolution(solve, currentVertice, capacity) {
    while (!isAllVerticesCovered(covered)) {
        const [route, routeCapacity] = takeAroute(currentVertice, capacity);
        solve.push(route);
        capacities.push(routeCapacity);
    }
    return solve;
}

function removeAVertice(
    solve,
    cost,
    routeIndex,
    verticeIndex,
    capacities,
    relocateVertice
) {
    const loss =
        calculateEuclid(solve[routeIndex][verticeIndex - 1], relocateVertice) +
        calculateEuclid(relocateVertice, solve[routeIndex][verticeIndex + 1]) -
        calculateEuclid(
            solve[routeIndex][verticeIndex - 1],
            solve[routeIndex][verticeIndex + 1]
        );
    return loss;
}

function addAVertice(
    solve,
    cost,
    routeIndex,
    verticeIndex,
    capacities,
    relocateVertice
) {
    const gain =
        calculateEuclid(solve[routeIndex][verticeIndex - 1], relocateVertice) +
        calculateEuclid(relocateVertice, solve[routeIndex][verticeIndex]) -
        calculateEuclid(
            solve[routeIndex][verticeIndex - 1],
            solve[routeIndex][verticeIndex]
        );
    return gain;
}

function commitRemove(
    solve,
    cost,
    routeIndex,
    verticeIndex,
    capacities,
    relocateVertice
) {
    solve[routeIndex].splice(verticeIndex, 1);
    capacities -= parseInt(getVerticeData(relocateVertice).demand);
}

function commitAdd(
    solve,
    cost,
    routeIndex,
    verticeIndex,
    capacities,
    relocateVertice
) {
    solve[routeIndex].splice(verticeIndex, 0, relocateVertice);
    capacities[routeIndex] += parseInt(getVerticeData(relocateVertice).demand);
}
//----------------------------------------------------------------------------------
function relocate(
    solve,
    cost,
    relocateRouteIndex,
    relocateVerticeIndex,
    capacities
) {
    let isImprove = false;
    //it is an snapshot after remove vertice
    let removeSolve = clone(solve);
    let removeCapacities = clone(capacities);
    const relocateVertice = solve[relocateRouteIndex][relocateVerticeIndex];

    // remove a vetice
    const loss = removeAVertice(
        removeSolve,
        cost,
        relocateRouteIndex,
        relocateVerticeIndex,
        removeCapacities,
        relocateVertice
    );
    commitRemove(
        removeSolve,
        cost,
        relocateRouteIndex,
        relocateVerticeIndex,
        removeCapacities,
        relocateVertice
    );

    // iterator for relocate algorithm
    let tempSolve = clone(removeSolve);
    let tempCapacities = clone(capacities);
    let minGain = 100000;
    let minRoute = -1;
    let minVertice = -1;

    for (let i = 0; i < tempSolve.length; i++) {
        for (let j = 0; j <= tempSolve[i].length; j++) {
            const currentDemand = parseInt(
                getVerticeData(relocateVertice).demand
            );
            if (tempCapacities[i] + currentDemand < data.capacity) {
                let gain = addAVertice(
                    tempSolve,
                    cost,
                    i,
                    j,
                    tempCapacities,
                    relocateVertice
                );
                if (gain < minGain) {
                    minGain = gain;
                    minRoute = i;
                    minVertice = j;
                    isImprove = true;
                }
            }
        }
    }
    if (isImprove && cost - loss + minGain < cost) {
        // when finded the best location for vertice, we must commit the change
        commitAdd(
            removeSolve,
            cost,
            minRoute,
            minVertice,
            removeCapacities,
            relocateVertice
        );
        // and then we return the best answer
        return [removeSolve, (cost = cost - loss + minGain), removeCapacities];
    } else {
        // if cant find the better solution, return default
        return [solve, cost, capacities];
    }
}

function oneStepLocalSearch(solve, cost, capacities) {
    let minCost = cost;
    let optimizeSolve = JSON.parse(JSON.stringify(solve));
    let minCapacities = clone(capacities);
    solve.forEach((route, routeIndex) => {
        route.forEach((vertice, verticeIndex) => {
            let [localSearchSolve, localSearchCost, localCapacities] = relocate(
                solve,
                cost,
                routeIndex,
                verticeIndex,
                capacities
            );
            if (localSearchCost < minCost) {
                optimizeSolve = localSearchSolve;
                minCost = localSearchCost;
                minCapacities = localCapacities;
            }
        });
    });
    return [optimizeSolve, minCost, minCapacities];
}

function localSearch(solve, cost, capacities) {
    let countSearch = 0;
    let countSearchNotImprove = 0;
    solve = clone(solve);
    capacities = clone(capacities);
    do {
        const [
            improveSolve,
            improveSolveCost,
            improveCapacities
        ] = oneStepLocalSearch(solve, cost, capacities);
        currentSolve = improveSolve;
        currentCapacities = improveCapacities;
        if (improveSolveCost < cost) {
            solve = improveSolve;
            cost = improveSolveCost;
            capacities = improveCapacities;
            countSearchNotImprove = 0;
        } else {
            countSearchNotImprove++;
        }
        // console.log(countSearch, countSearchNotImprove);
        countSearch++;
    } while (
        countSearch < MAX_LOCALSEARCH &&
        countSearchNotImprove < MAX_LOCALSEARCH_UNIMPROVE
    );
    return [solve, cost, capacities];
}

function flatSolve(solve) {
    const flattenSolve = solve.reduce(
        (flattenSolve, currentValue, currentIndex) => {
            return [...flattenSolve, ...currentValue];
        },
        Array.apply([])
    );
    return flattenSolve;
}

function swapSomePair(solve) {
    let numberOfPair = Math.floor(Math.sqrt(data.dimension) + Math.random() * Math.sqrt(data.dimension) - Math.random() * Math.sqrt(data.dimension))
    // console.log(data.dimension);
    console.log("swap", numberOfPair);
    for (let count = 0; count < numberOfPair; count++) {
        let i = Math.floor(Math.random() * solve.length);
        let j = Math.floor(Math.random() * solve.length);
        let nodeI = solve[i];
        let nodeJ = solve[j];
        solve[i] = nodeJ;
        solve[j] = nodeI;
    }
}

function splitSolve(flattenSolve) {
    let solve = [];
    const capacity = data.capacity;
    let currentCapacity = capacity;
    let currentRoute = [];
    for (let i = 0; i < flattenSolve.length; i++) {
        let currentVertice = getVerticeData(flattenSolve[i]);
        if (currentCapacity >= parseInt(currentVertice.demand)) {
            currentRoute.push(flattenSolve[i]);
            currentCapacity -= parseInt(currentVertice.demand);
        } else {
            solve.push(currentRoute);
            currentRoute = [];
            currentCapacity = capacity;
            currentRoute.push(flattenSolve[i]);
            currentCapacity -= parseInt(currentVertice.demand);
        }
    }
    solve.push(currentRoute);
    return solve;
}

function calcuateCapacities(solve) {
    const capacities = solve.map(route =>
        route.reduce(
            (capacity, currentVertice) =>
            capacity + parseInt(getVerticeData(currentVertice).demand), 0)
    );
    return capacities;
}

function pertubation(solve, cost, capacities) {
    let flattenSolve = flatSolve(solve);
    swapSomePair(flattenSolve);
    let newSolve = splitSolve(flattenSolve);
    capacities = calcuateCapacities(newSolve);
    cost = calculateSolveCost(newSolve);
    // console.log(JSON.stringify(newSolve));
    console.log(calculateSolveCost(newSolve));
    return [newSolve, cost, capacities];
}

function main() {
    const capacity = parseInt(data.capacity);
    let currentCapacity = capacity;
    let currentVertice = "1";
    addVertice(currentVertice);
    solve = initialSolution(solve, currentVertice, currentCapacity);
    let cost = calculateSolveCost(solve);
    let countSearch = 0;
    let countSearchNotImprove = 0;
    // console.log(solve);
    // console.log(cost);
    // console.log(capacities);
    [solve, cost, capacities] = localSearch(solve, cost, capacities);
    let newSolve = clone(solve);
    let newCapacities = clone(capacities);
    let newCost = cost;
    do {
        // console.log(newSolve);
        let [improveSolve, improveSolveCost, improveCapacities] = pertubation(
            newSolve,
            newCost,
            newCapacities
        );
        [improveSolve, improveSolveCost, improveCapacities] = localSearch(
            improveSolve,
            improveSolveCost,
            improveCapacities
        );

        // console.log(JSON.stringify(improveSolve));
        console.log(calculateSolveCost(improveSolve));
        // console.log(improveSolve);
        // console.log(improveSolveCost);
        // console.log(improveCapacities);
        // newSolve = improveSolve;
        // newCost = improveSolveCost;
        // newCapacities = improveCapacities;
        if (improveSolveCost < newCost) {
            solve = improveSolve;
            capacities = improveCapacities;
            cost = improveSolveCost;
            countSearchNotImprove = 0;
        } else {
            countSearchNotImprove++;
        }
        countSearch++;
    } while (
        countSearch < MAX_LOCALSEARCH &&
        countSearchNotImprove < MAX_LOCALSEARCH_UNIMPROVE
    );
    console.log(solve);
    console.log(calculateSolveCost(solve));
    console.log(capacities);
}
main();