yearGlitch();
updateWing(1, 3, 0.1);
// Generate a random number for the year
function yearGlitch() {
    var year = document.getElementById("year-glitch");
    var new_year = "";
    // 3 digit number
    for (var i = 0; i < 3; i++) {
        var num = Math.floor(Math.random() * 10);
        // If the first digit is 0 then skip it
        if (!(i === 0 && num === 0)) {
            new_year += num;
        }
    }
    year.innerHTML = new_year;
    // Change the number every second
    setTimeout(yearGlitch, 1000);
}
function movedSliders() {
    // Read all the sliders
    var machSlider = document.getElementById("slider-mach");
    var alphaSlider = document.getElementById("slider-alpha");
    var heightSlider = document.getElementById("slider-height");
    // Update the calculations and visualisation
    updateWing(Number(machSlider.value), Number(alphaSlider.value), Number(heightSlider.value));
}
// Visualise a supersonuc wing in ground effect on an HTML canvas
function updateWing(mach, alpha, h) {
    var yPadding = .1;
    var xPadding = .1;
    var yLim = [0, 1];
    var xLim = [-0.5, 1.5];
    var canvas = document.getElementById("canvas-wing-in-ground");
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        // Deal with devices with a pixel ratio != 1
        var pixelRatio = window.devicePixelRatio;
        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;
        // Exclusiely use radians from here on
        alpha *= Math.PI / 180;
        var wing = getWingCoords(h, alpha);
        // ctx.moveTo(processX(canvas, xPadding, wing.x[0]), processY(canvas, yPadding, wing.y[0]));
        // ctx.lineTo(processX(canvas, xPadding, wing.x[1]), processY(canvas, yPadding, wing.y[1]));
        ctx.moveTo(processX(0, canvas, xPadding, xLim), processY(.6, canvas, yPadding, yLim));
        ctx.lineTo(processX(1, canvas, xPadding, xLim), processY(.4, canvas, yPadding, yLim));
        ctx.stroke();
    }
}
// Canvas has 0,0 at the top left but I need it at the bottom left with a bit of padding and scaling
function processY(y, canvas, yPadding, yLim) {
    var heightPerUnit = (1 - yPadding) * canvas.height / (yLim[1] - yLim[0]);
    var offset = (1 - yPadding / 2) * canvas.height;
    return offset - (y - yLim[0]) * heightPerUnit;
}
// Add padding to x coordinates and scale them to the set limits
function processX(x, canvas, xPadding, xLim) {
    var widthPerUnit = (1 - xPadding) * canvas.width / (xLim[1] - xLim[0]);
    var offset = (xPadding / 2) * canvas.width;
    return offset + (x - xLim[0]) * widthPerUnit;
}
// Calculate the position of the wing 
function getWingCoords(h, alpha) {
    var x = [1 - Math.cos(alpha), 1];
    var y = [h * (1 + Math.sin(alpha)), h];
    return { x: x, y: y };
}
