module.exports = {
    clone
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}