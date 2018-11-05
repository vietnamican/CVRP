module.exports = {loadCapacity}

function loadCapacity(dataString){
    const capacityString =  dataString.match(/CAPACITY.*((\d)+)?/g);
    const capacity = capacityString[0].replace(/[\D]/g, "");
    return capacity;
}