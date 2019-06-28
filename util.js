//Utility functions

//Returns timestamp object in ISO 8601 format with no milliseconds.
function isoTimestamp() {
    const date = new Date();
    //Remove the milliseconds and add +00:00 instead of Z.
    const timestampObject = {timestamp: date.toISOString().split('.')[0] + "+00:00"};
    return timestampObject;
}

exports.isoTimestamp = isoTimestamp;