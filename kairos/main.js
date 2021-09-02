// Play/Pause button
document.querySelector('.button').addEventListener('click', (e) => {
    e.target.classList.toggle('pause');
    // PLaying
    if (isPaused) {
        Play();
    }
    // Pausing
    else {
        Pause();
    }
})

// Button to toggle between displaying slider and buttons
document.querySelector(".change-input").addEventListener('click', (e) => {
    if (e.target.getAttribute("data-text-swap") == e.target.innerHTML) {
        e.target.innerHTML = e.target.getAttribute("data-text-original");
        document.getElementById("sliderSpeed").style.display = "block";
        document.getElementById("speed-buttons").style.display = "none";
    }
    else {
        e.target.setAttribute("data-text-original", e.target.innerHTML);
        e.target.innerHTML = e.target.getAttribute("data-text-swap");
        document.getElementById("sliderSpeed").style.display = "none";
        document.getElementById("speed-buttons").style.display = "block";
    }
}, false);

/* Functions called by HTML */

function IrlTime() {
    // J2000ish epoch
    realTime = Date.now() - 946684800000;
    scalingFactor = 1;
    document.getElementById('sliderSpeed').value = 0;
}

function EpochTime() {
    // J2000ish epoch
    realTime = 0;
    scalingFactor = 1;
    document.getElementById('sliderSpeed').value = 0;
}

function Pause() {
    prevScalingFactor = scalingFactor;
    scalingFactor = 0;
    isPaused = 1;
}

function Play() {
    scalingFactor = prevScalingFactor;
    isPaused = 0;
}

function ResetMultiplier() {
    scalingFactor = 1;
}

function Forward(speed) {
    if (speed < 10) {
        if (scalingFactor < 0 && (Math.log10(Math.abs(scalingFactor)) % 1) === 0) {
            scalingFactor += Math.pow(10, Math.floor(Math.log10(Math.abs(scalingFactor)) - 1));
        }
        else {
            scalingFactor += Math.pow(10, Math.floor(Math.log10(Math.abs(scalingFactor))));
        }
    }
    else if (Math.abs(scalingFactor) <= 1 || speed === 1) {
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
    if (speed < 10) {
        if (scalingFactor > 0 && (Math.log10(Math.abs(scalingFactor)) % 1) === 0) {
            scalingFactor -= Math.pow(10, Math.floor(Math.log10(Math.abs(scalingFactor)) - 1));
        }
        else {
            scalingFactor -= Math.pow(10, Math.floor(Math.log10(Math.abs(scalingFactor))));
        }

    }
    else if (Math.abs(scalingFactor) <= 1 || speed === 1) {
        scalingFactor = -speed;
    }
    else if (scalingFactor < 0) {
        scalingFactor *= speed;
    }
    else {
        scalingFactor /= speed;
    }
}

/* Function to open fullscreen mode */
function openFullscreen() {
    var canvas = document.getElementsByClassName("right")[0];
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) { /* Safari */
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { /* IE11 */
        canvas.msRequestFullscreen();
    }
}

function generate() {
    let table = document.querySelector("table");
    let tableHeaders = ["Body", "Local Time", "Solar Time", "Weekday", "Date"];
    IrlTime();
    data = generateData(bodies);
    info = generateInformation(bodies);
    generateTableHead(table, tableHeaders);
    generateTable(table, data, info);

    balls(table, bodies);
}