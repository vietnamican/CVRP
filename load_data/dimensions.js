module.exports = loadDimensions;

function loadDimensions(dataString){
    const dimensionSection = dataString.match(/(?<=DIMENSION)[\w\W]+(?=DEMAND_SECTION)/g)[0];
    const dimensions = dimensionSection.match(/\d+/g)[0];
    return dimensions;
}