yearGlitch();
// updateWing(1, 3, 0.1);
movedSliders();

// Generate a random number for the year
function yearGlitch() {
    var year = document.getElementById("year-glitch");
    var new_year = "";
    // 3 digit number
    for (let i = 0; i < 3; i++) {
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
    let machSlider = <HTMLInputElement>document.getElementById("slider-mach");
    let alphaSlider = <HTMLInputElement>document.getElementById("slider-alpha");
    let heightSlider = <HTMLInputElement>document.getElementById("slider-height");

    // Apply scaling
    let m = Number(machSlider.value) / 10;
    let a = Number(alphaSlider.value) / 10;
    let h = Number(heightSlider.value) / 100;

    // Update the calculations and visualisation
    updateWing(m, a, h);
}

// Visualise a supersonuc wing in ground effect on an HTML canvas
function updateWing(mach: number, alpha: number, h: number) {
    console.log("Updating for M: " + mach + ", alpha: " + alpha + ", h: " + h);

    var yPadding = .1;
    var xPadding = .1;


    var yLim = [0, .2];
    var xLim = [-0.5, 1.5];

    if (h > .15) {
        yLim[1] = h + .05;
    }

    var canvas = <HTMLCanvasElement>document.getElementById("canvas-wing-in-ground");
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        // Deal with devices with a pixel ratio != 1
        const pixelRatio = window.devicePixelRatio;
        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;

        // Exclusiely use radians from here on
        alpha *= Math.PI / 180;
        let wing = getWingCoords(h, alpha);

        ctx.moveTo(processX(wing.x[0], canvas, xPadding, xLim), processY(wing.y[0], canvas, yPadding, yLim));
        ctx.lineTo(processX(wing.x[1], canvas, xPadding, xLim), processY(wing.y[1], canvas, yPadding, yLim));
        ctx.stroke();
    }
}

// Canvas has 0,0 at the top left but I need it at the bottom left with a bit of padding and scaling
function processY(y: number, canvas: HTMLCanvasElement, yPadding: number, yLim: number[]) {
    let heightPerUnit = (1 - yPadding) * canvas.height / (yLim[1] - yLim[0]);
    let offset = (1 - yPadding / 2) * canvas.height;
    return offset - (y - yLim[0]) * heightPerUnit;
}

// Add padding to x coordinates and scale them to the set limits
function processX(x: number, canvas: HTMLCanvasElement, xPadding: number, xLim: number[]) {
    let widthPerUnit = (1 - xPadding) * canvas.width / (xLim[1] - xLim[0]);
    let offset = (xPadding / 2) * canvas.width;
    return offset + (x - xLim[0]) * widthPerUnit;
}

// Calculate the position of the wing 
function getWingCoords(h: number, alpha: number) {
    let x = [1 - Math.cos(alpha), 1]
    let y = [h + Math.sin(alpha), h]
    return { x, y };
}