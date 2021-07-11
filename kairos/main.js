/* Functions called by HTML */

function IrlTime() {
    // J2000ish epoch
    realTime = Date.now() - 946684800000;

    scalingFactor = 1;
}

function EpochTime() {
    // J2000ish epoch
    realTime = 0;
    scalingFactor = 1;
}

function Pause() {
    scalingFactor = 0;
}

function Forward(speed) {
    if (Math.abs(scalingFactor) <= 1 || speed === 1) {
        scalingFactor = speed;
    }
    else if (scalingFactor < 0) {
        scalingFactor /= speed;
    }
    else {
        scalingFactor *= speed;
    }
}

function Rewind(speed) {
    if (Math.abs(scalingFactor) <= 1 || speed === 1) {
        scalingFactor = -speed;
    }
    else if (scalingFactor < 0) {
        scalingFactor *= speed;
    }
    else {
        scalingFactor /= speed;
    }
}

function generate() {
    let table = document.querySelector("table");
    let tableHeaders = ["Body", "Local Time", "Solar Time", "Day of the Week", "Date"];
    IrlTime();
    data = generateData(bodies);
    info = generateInformation(bodies);
    generateTableHead(table, tableHeaders);
    generateTable(table, data, info);

    balls(table, bodies);
}

/* TODO:
- Figure out months
- Date picker with all the calendars (https://github.com/crsten/datepickk?)
- Make and add blender renders
*/