// http://adripofjavascript.com/blog/drips/object-equality-in-javascript.html

function isEquivalent(a, b) {
    if (a === null && b === null) {
        return true;
    }

    if (a === undefined && b === undefined) {
        return true;
    }

    if (a === null && b !== null) {
        return false;
    }

    if (b === null && a !== null) {
        return false;
    }

    if (a === undefined && b !== undefined) {
        return false;
    }

    if (b === undefined && a !== undefined) {
        return false;
    }

    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

export default isEquivalent;