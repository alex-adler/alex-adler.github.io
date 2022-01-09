class WingGridTickBox {
    enabled: boolean;
    size: number;
    padding: number;
    path: Path2D;

    constructor() {
        this.enabled = true;
        this.size = 15;
        this.padding = 5;
        this.path = new Path2D();
    }
    generatePath(canvas: HTMLCanvasElement) {
        this.path.rect(canvas.width - (this.size + this.padding), this.padding, this.size, this.size);
    }
}

var wingGridTickBox = new WingGridTickBox();

yearGlitch();
initWingCanvas();
initDataCanvas();

// Redraw canvas' when they have changed size
addEventListener("resize", updateDataCanvas);
addEventListener("resize", movedSliders);

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

function initWingCanvas() {
    var wingCanvas = <HTMLCanvasElement>document.getElementById("canvas-wing-in-ground");
    initCanvas(wingCanvas);
    initWingListeners(wingCanvas);
    movedSliders();
}

function initDataCanvas() {
    var dataCanvas = <HTMLCanvasElement>document.getElementById("canvas-wing-in-ground-graph");
    initCanvas(dataCanvas);
    updateDataCanvas();
}

function initCanvas(canvas: HTMLCanvasElement) {
    // Deal with devices with a pixel ratio != 1
    const pixelRatio = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
}

function updateDataCanvas() {
    var canvas = <HTMLCanvasElement>document.getElementById("canvas-wing-in-ground-graph");
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        ctx.font = "30px Roboto";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText('This page is intentionally left blank', canvas.width / 2, canvas.height / 2);

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FFFFFF";
        ctx.rect(1, 1, canvas.width - 2, canvas.height - 2);
        ctx.stroke();
    }
}

function initWingListeners(canvas: HTMLCanvasElement) {
    wingGridTickBox.generatePath(canvas);
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ['click', 'ontouchstart'].forEach(evt => {
            canvas.addEventListener(evt, (e: MouseEvent) => {
                var rect = canvas.getBoundingClientRect(), // abs. size of element
                    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
                    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

                var mouseX = (e.clientX - rect.left) * scaleX;  // scale mouse coordinates after they have
                var mouseY = (e.clientY - rect.top) * scaleY;   // been adjusted to be relative to element

                if (ctx.isPointInPath(wingGridTickBox.path, mouseX, mouseY)) {
                    wingGridTickBox.enabled = !wingGridTickBox.enabled;
                    movedSliders();
                }
            }, false)
        });
    }
}

// Read all sliders and update the wing canvas whenever any slider moves
function movedSliders() {
    // Read all the sliders
    let machSlider = <HTMLInputElement>document.getElementById("slider-mach");
    let alphaSlider = <HTMLInputElement>document.getElementById("slider-alpha");
    let heightSlider = <HTMLInputElement>document.getElementById("slider-height");

    // Apply scaling
    let m = Number(machSlider.value) / 100;
    let a = Number(alphaSlider.value) / 100;
    let h = Number(heightSlider.value) / 1000;

    // Update the calculations and visualisation
    updateWing(m, a, h);
}

// Visualise a supersonic wing in ground effect on an HTML canvas
function updateWing(mach: number, alpha: number, h: number) {
    let displayMach = document.getElementById("display-mach");
    let displayAlpha = document.getElementById("display-alpha");
    let displayHeight = document.getElementById("display-height");

    displayMach.innerHTML = "Mach: " + mach;
    displayAlpha.innerHTML = "Angle: " + alpha + "&deg;";
    displayHeight.innerHTML = "Height: " + h + " m";

    var orange = "#FF7F50";
    var white = "#f5f5f5";
    var lightGrey = "#808080";

    // Set adiabatic gas constant
    var gamma = 1.31;

    // Padding as fraction of width or height
    var yPadding = .1;
    var xPadding = .1;

    // Set the ranges of the x and y axis that msut be shown
    var yLim = [0, .2];
    var xLim = [0, 1];

    // If the wing will move out of the canvas, increasy the y limit
    if (h > .15) {
        yLim[1] = 2 * h;
    }

    var canvas = <HTMLCanvasElement>document.getElementById("canvas-wing-in-ground");
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Pixels per meter
        var xScale = (1 - xPadding) * canvas.width / (xLim[1] - xLim[0]);
        var yScale = (1 - yPadding) * canvas.height / (yLim[1] - yLim[0]);

        var scale = Math.min(xScale, yScale);

        // Draw tick box to enable grids

        // ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke(wingGridTickBox.path);

        if (wingGridTickBox.enabled) {
            // Draw grid
            var unitsInX = Math.floor(canvas.width / scale) + 1;
            var unitsInY = Math.floor(canvas.height / scale) + 1;

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = lightGrey;

            for (let i = 0; i < unitsInX; i++) {
                ctx.moveTo(processX(i, canvas.width, xPadding, scale), 0);
                ctx.lineTo(processX(i, canvas.width, xPadding, scale), canvas.height);
                ctx.stroke();
            }

            for (let i = 0; i < unitsInY; i++) {
                ctx.moveTo(0, processY(i, canvas.height, yPadding, scale));
                ctx.lineTo(canvas.width, processY(i, canvas.height, yPadding, scale));
                ctx.stroke();
            }
        }

        // Draw Ground
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = white;
        ctx.moveTo(0, (1 - (yPadding / 2)) * canvas.height);
        ctx.lineTo(canvas.width, (1 - (yPadding / 2)) * canvas.height);
        ctx.stroke();

        // Exclusiely use radians from here on
        alpha *= Math.PI / 180;

        // Draw wing
        let wing = getWingCoords(h, alpha);
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = orange;
        ctx.moveTo(processX(wing.x[0], canvas.width, xPadding, scale), processY(wing.y[0], canvas.height, yPadding, scale));
        ctx.lineTo(processX(wing.x[1], canvas.width, xPadding, scale), processY(wing.y[1], canvas.height, yPadding, scale));
        ctx.stroke();

        var x = wing.x[0];
        var y = wing.y[0];

        // Straight line equation for the wing
        var wingM = (wing.y[0] - wing.y[1]) / (wing.x[0] - wing.x[1]);
        var wingC = wing.y[0] - wing.x[0] * wingM;

        var maxShocks = 20;
        var shockCount = 0;

        // Line width of shocks
        ctx.lineWidth = 2;
        ctx.strokeStyle = white;
        // Loop until flow is no longer supersonic or it has reached the end of the wing
        while (mach > 1) {
            var shock = getShockCoords(x, y, mach, alpha, wingM, wingC, gamma);

            ctx.beginPath();
            ctx.moveTo(processX(shock.x[0], canvas.width, xPadding, scale), processY(shock.y[0], canvas.height, yPadding, scale));
            ctx.lineTo(processX(shock.x[1], canvas.width, xPadding, scale), processY(shock.y[1], canvas.height, yPadding, scale));
            ctx.stroke();

            x = shock.x[1]
            y = shock.y[1]
            mach = shock.shock.M2;

            // If the shock has passed the wing
            if (y !== 0 && x > 1)
                break;
            shockCount++;
            if (shockCount > maxShocks) {
                console.log("Too many shocks");
                break;
            }
        }
    }
}

// Canvas has 0,0 at the top left but I need it at the bottom left with a bit of padding and scaling
function processY(y: number, height: number, padding: number, scale: number) {
    let offset_px = (1 - padding / 2) * height;
    return offset_px - y * scale;
}

// Add padding to x coordinates and scale them to the set limits
function processX(x: number, width: number, padding: number, scale: number) {
    // Make sure the it is centered on x=.5 (halfway along the wing)
    let x0 = (((1 - padding) * width / scale) - 1) / 2;
    let offset_px = (padding / 2) * width;
    return offset_px + (x + x0) * scale;
}

// Calculate the position of the wing 
function getWingCoords(h: number, alpha: number) {
    let x = [1 - Math.cos(alpha), 1]
    let y = [h + Math.sin(alpha), h]
    return { x, y };
}

// Calculates the deflection required for a given Mach number and shock angle beta
function oblique(beta: number, M: number, gamma: number) {
    return Math.atan((2 * (Math.pow(M, 2) * Math.pow(Math.sin(beta), 2) - 1)) / (Math.tan(beta) * (Math.pow(M, 2) * (gamma + Math.cos(2 * beta)) + 2)));
}

// Get the angle of a shock created by a mach M flow being deflected by theta radians
function getObliqueShockAngle(M: number, theta: number, gamma: number) {
    const betaStart = Math.PI / 180;
    const betaMax = Math.PI / 2;
    const betaStep = .001;
    var thetaLeft = 0;
    var betaLeft = 0;
    var shockTable: number[][] = [];

    // Create the theta - beta plot
    const betaArrayLength = Math.floor(((betaMax - betaStart) / betaStep)) + 1;
    var betaArray = [...Array(betaArrayLength).keys()].map(x => (x * betaStep) + betaStart);
    betaArray.forEach(beta => shockTable.push([beta, oblique(beta, M, gamma)]));

    // Function for performing linear interpolation
    const interp = (x: number, xp: number[], fp: number[]) => fp[0] + (x - xp[0]) * (fp[1] - fp[0]) / (xp[1] - xp[0]);

    // Look for theta and interpolate when passed or return 90 deg (normal shock)
    for (let i = 0; i < shockTable.length; i++) {
        if (shockTable[i][1] < theta) {
            thetaLeft = shockTable[i][1];
            betaLeft = shockTable[i][0];
        }
        else {
            return interp(theta, [thetaLeft, shockTable[i][1]], [betaLeft, shockTable[i][0]])
        }
    }
    return Math.PI / 2;
}

// Returns (M2, shock angle, p2/p1, p02/p01, rho2/rho1, T2/T1)
function calcObliqueShock(M1: number, theta: number, gamma: number) {
    let beta = getObliqueShockAngle(M1, theta, gamma);
    let M1n2 = Math.pow(M1, 2) * Math.pow(Math.sin(beta), 2);
    let M2 = Math.sqrt(((gamma - 1) * M1n2 + 2) / ((2 * gamma * M1n2 - (gamma - 1)) * Math.pow(Math.sin(beta - theta), 2)));
    let p2_p1 = (2 * gamma * M1n2 - (gamma - 1)) / (gamma + 1);
    let rho2_rho1 = ((gamma + 1) * M1n2) / ((gamma - 1) * M1n2 + 2);
    let T2_T1 = ((2 * gamma * M1n2 - (gamma - 1)) * ((gamma - 1) * M1n2 + 2)) / ((gamma + 1) ** 2 * M1n2);
    let p02_p01 = rho2_rho1 ** (gamma / (gamma - 1)) * (p2_p1) ** (-1 / (gamma - 1));
    return { M2, beta, p2_p1, p02_p01, rho2_rho1, T2_T1 };
}

// Get the coordinates needed to draw a shock wave
function getShockCoords(x1: number, y1: number, M: number, theta: number, wing_m: number, wing_c: number, gamma: number) {
    var shock = calcObliqueShock(M, theta, gamma);

    var x2, y2;

    // If shock is reflecting off the ground
    if (y1 == 0) {
        // Normal shock (vertical line)
        if (shock.beta > 1.5705) {
            x2 = x1;
            y2 = wing_m * x2 + wing_c;
            // If the normal shock is behind the wing
            if (x2 > 1)
                y2 = 10
        }
        else {
            //Bounce up
            // Calculate straight line equation for the shock
            let shock_m = Math.tan(shock.beta);
            let shock_c = -shock_m * x1;

            x2 = (shock_c - wing_c) / (wing_m - shock_m);

            // If the shock will miss the wing, draw it off the canvas
            if (x2 > 1)
                x2 = 2;
            y2 = shock_m * x2 + shock_c;

        }
    } else {
        // Bounce down
        y2 = 0;
        x2 = x1 + (y1 - y2) / (Math.tan(shock.beta));
    }
    let x = [x1, x2];
    let y = [y1, y2];
    return { x, y, shock };
}