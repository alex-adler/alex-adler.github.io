class WingGridTickBox {
    constructor() {
        this.enabled = true;
        this.size = 15 * window.devicePixelRatio;
        this.xPadding = 5 * window.devicePixelRatio;
        this.yPadding = 20 * window.devicePixelRatio;
    }
    generatePath(canvas) {
        this.path = new Path2D();
        this.path.rect(canvas.width - (this.size + this.xPadding), this.yPadding, this.size, this.size);
    }
}
class PointOnWing {
    constructor(x, y, pressureRatio) {
        this.x = x;
        this.y = y;
        this.pressureRatio = pressureRatio;
    }
}
var wingGridTickBox = new WingGridTickBox();
yearGlitch();
initDataCanvas();
initWingCanvas();
// Redraw canvas' when they have changed size
addEventListener("resize", initDataCanvas);
addEventListener("resize", initWingCanvas);
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
    var wingCanvas = document.getElementById("canvas-wing-in-ground");
    initCanvas(wingCanvas);
    initWingListeners(wingCanvas);
    movedSliders();
}
function initDataCanvas() {
    var dataCanvas = document.getElementById("canvas-wing-in-ground-graph");
    initCanvas(dataCanvas);
}
// Set canvas resolution
function initCanvas(canvas) {
    // Deal with devices with a pixel ratio != 1
    const pixelRatio = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
}
function updateDataCanvas(liftCoeff, dragCoeff) {
    var canvas = document.getElementById("canvas-wing-in-ground-graph");
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'left';
        ctx.font = "30px Roboto";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Lift coefficient = " + liftCoeff, 0, canvas.height / 3);
        ctx.fillText("Drag coefficient = " + dragCoeff, 0, 2 * canvas.height / 3);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FFFFFF";
        ctx.rect(1, 1, canvas.width - 2, canvas.height - 2);
        ctx.stroke();
    }
}
function initWingListeners(canvas) {
    wingGridTickBox.generatePath(canvas);
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ['click', 'ontouchstart'].forEach(evt => {
            canvas.addEventListener(evt, (e) => {
                var rect = canvas.getBoundingClientRect(), // abs. size of element
                scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
                scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y
                var mouseX = (e.clientX - rect.left) * scaleX; // scale mouse coordinates after they have
                var mouseY = (e.clientY - rect.top) * scaleY; // been adjusted to be relative to element
                if (ctx.isPointInPath(wingGridTickBox.path, mouseX, mouseY)) {
                    wingGridTickBox.enabled = !wingGridTickBox.enabled;
                    movedSliders();
                }
            }, false);
        });
    }
}
// Read all sliders and update the wing canvas whenever any slider moves
function movedSliders() {
    // Read all the sliders
    let machSlider = document.getElementById("slider-mach");
    let alphaSlider = document.getElementById("slider-alpha");
    let heightSlider = document.getElementById("slider-height");
    // Apply scaling
    let m = Number(machSlider.value) / 100;
    let a = Number(alphaSlider.value) / 100;
    let h = Number(heightSlider.value) / 1000;
    // Update the calculations and visualisation
    updateWing(m, a, h);
}
// Visualise a supersonic wing in ground effect on an HTML canvas
function updateWing(mach, alpha, h) {
    let displayMach = document.getElementById("display-mach");
    let displayAlpha = document.getElementById("display-alpha");
    let displayHeight = document.getElementById("display-height");
    displayMach.innerHTML = "Mach: " + mach;
    displayAlpha.innerHTML = "Angle: " + alpha + "&deg;";
    displayHeight.innerHTML = "Height: " + h + " m";
    var orange = "#FF7F50";
    var white = "#ffffff";
    var offwhite = "#f5f5f5";
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
    var canvas = document.getElementById("canvas-wing-in-ground");
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Pixels per meter
        var xScale = (1 - xPadding) * canvas.width / (xLim[1] - xLim[0]);
        var yScale = (1 - yPadding) * canvas.height / (yLim[1] - yLim[0]);
        var scale = Math.min(xScale, yScale);
        if (wingGridTickBox.enabled) {
            // Calculate how many grid lines are required
            var unitsInX = Math.floor(canvas.width / scale) + 1;
            var unitsInY = Math.floor(canvas.height / scale) + 1;
            // Configure grid lines
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = lightGrey;
            // Configure grid label
            ctx.textAlign = 'left';
            ctx.font = window.devicePixelRatio * 15 + "px Roboto";
            ctx.fillStyle = lightGrey;
            // Draw and label a line for each integer x value
            for (let i = -(Math.floor(unitsInX / 2) - 1); i < Math.floor(unitsInX / 2) + 1; i++) {
                // Draw each vertical line
                ctx.moveTo(processX(i, canvas.width, xPadding, scale), 0);
                ctx.lineTo(processX(i, canvas.width, xPadding, scale), canvas.height);
                ctx.stroke();
                // Label each vertical line
                ctx.fillText(i + " m", processX(i, canvas.width, xPadding, scale) + 10, 15 * window.devicePixelRatio);
            }
            // Draw and label a line for each integer y value
            for (let i = 0; i < unitsInY; i++) {
                // Draw each horizontal line
                ctx.moveTo(0, processY(i, canvas.height, yPadding, scale));
                ctx.lineTo(canvas.width, processY(i, canvas.height, yPadding, scale));
                ctx.stroke();
                // Label each horizontal line
                ctx.fillText(i + " m", 10, processY(i, canvas.height, yPadding, scale) - 10);
            }
            // Draw cross on grid tick box
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = white;
            ctx.moveTo(canvas.width - (wingGridTickBox.size + wingGridTickBox.xPadding), wingGridTickBox.yPadding);
            ctx.lineTo(canvas.width - wingGridTickBox.xPadding, wingGridTickBox.yPadding + wingGridTickBox.size);
            ctx.moveTo(canvas.width - wingGridTickBox.xPadding, wingGridTickBox.yPadding);
            ctx.lineTo(canvas.width - (wingGridTickBox.size + wingGridTickBox.xPadding), wingGridTickBox.yPadding + wingGridTickBox.size);
            ctx.stroke();
        }
        // Draw tick box to enable grids
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke(wingGridTickBox.path);
        ctx.textAlign = 'right';
        ctx.font = window.devicePixelRatio * 20 + "px Roboto";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText('Grid', canvas.width - (wingGridTickBox.size + 2 * wingGridTickBox.xPadding), wingGridTickBox.yPadding + wingGridTickBox.size);
        // Draw Ground
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = offwhite;
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
        ctx.strokeStyle = offwhite;
        // Variable for calculating forces
        var lowerSurface = [new PointOnWing(x, y, 1)];
        var machInfinity = mach;
        // Loop until flow is no longer supersonic or it has reached the end of the wing
        while (mach > 1) {
            var shock = getShockCoords(x, y, mach, alpha, wingM, wingC, gamma);
            ctx.beginPath();
            ctx.moveTo(processX(shock.x[0], canvas.width, xPadding, scale), processY(shock.y[0], canvas.height, yPadding, scale));
            ctx.lineTo(processX(shock.x[1], canvas.width, xPadding, scale), processY(shock.y[1], canvas.height, yPadding, scale));
            ctx.stroke();
            x = shock.x[1];
            y = shock.y[1];
            mach = shock.shock.M2;
            lowerSurface.push(new PointOnWing(x, y, shock.shock.p2_p1));
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
    let coefficients = calcLiftAndDrag(h, lowerSurface, gamma, machInfinity, alpha);
    updateDataCanvas(coefficients.c_l, coefficients.c_d);
}
// Canvas has 0,0 at the top left but I need it at the bottom left with a bit of padding and scaling
function processY(y, height, padding, scale) {
    let offset_px = (1 - padding / 2) * height;
    return offset_px - y * scale;
}
// Add padding to x coordinates and scale them to the set limits
function processX(x, width, padding, scale) {
    // Make sure the it is centered on x=.5 (halfway along the wing)
    let x0 = (((1 - padding) * width / scale) - 1) / 2;
    let offset_px = (padding / 2) * width;
    return offset_px + (x + x0) * scale;
}
// Calculate the position of the wing 
function getWingCoords(h, alpha) {
    let x = [1 - Math.cos(alpha), 1];
    let y = [h + Math.sin(alpha), h];
    return { x, y };
}
// Calculates the deflection required for a given Mach number and shock angle beta
function oblique(beta, M, gamma) {
    return Math.atan((2 * (Math.pow(M, 2) * Math.pow(Math.sin(beta), 2) - 1)) / (Math.tan(beta) * (Math.pow(M, 2) * (gamma + Math.cos(2 * beta)) + 2)));
}
// Get the angle of a shock created by a mach M flow being deflected by theta radians
function getObliqueShockAngle(M, theta, gamma) {
    const betaStart = Math.PI / 180;
    const betaMax = Math.PI / 2;
    const betaStep = .001;
    var thetaLeft = 0;
    var betaLeft = 0;
    var shockTable = [];
    // Create the theta - beta plot
    const betaArrayLength = Math.floor(((betaMax - betaStart) / betaStep)) + 1;
    var betaArray = [...Array(betaArrayLength).keys()].map(x => (x * betaStep) + betaStart);
    betaArray.forEach(beta => shockTable.push([beta, oblique(beta, M, gamma)]));
    // Function for performing linear interpolation
    const interp = (x, xp, fp) => fp[0] + (x - xp[0]) * (fp[1] - fp[0]) / (xp[1] - xp[0]);
    // Look for theta and interpolate when passed or return 90 deg (normal shock)
    for (let i = 0; i < shockTable.length; i++) {
        if (shockTable[i][1] < theta) {
            thetaLeft = shockTable[i][1];
            betaLeft = shockTable[i][0];
        }
        else {
            return interp(theta, [thetaLeft, shockTable[i][1]], [betaLeft, shockTable[i][0]]);
        }
    }
    return Math.PI / 2;
}
// Returns (M2, shock angle, p2/p1, p02/p01, rho2/rho1, T2/T1)
function calcObliqueShock(M1, theta, gamma) {
    let beta = getObliqueShockAngle(M1, theta, gamma);
    let M1n2 = Math.pow(M1, 2) * Math.pow(Math.sin(beta), 2);
    let M2 = Math.sqrt(((gamma - 1) * M1n2 + 2) / ((2 * gamma * M1n2 - (gamma - 1)) * Math.pow(Math.sin(beta - theta), 2)));
    let p2_p1 = (2 * gamma * M1n2 - (gamma - 1)) / (gamma + 1);
    let rho2_rho1 = ((gamma + 1) * M1n2) / ((gamma - 1) * M1n2 + 2);
    let T2_T1 = ((2 * gamma * M1n2 - (gamma - 1)) * ((gamma - 1) * M1n2 + 2)) / (Math.pow((gamma + 1), 2) * M1n2);
    let p02_p01 = Math.pow(rho2_rho1, (gamma / (gamma - 1))) * Math.pow((p2_p1), (-1 / (gamma - 1)));
    return { M2, beta, p2_p1, p02_p01, rho2_rho1, T2_T1 };
}
// Get the coordinates needed to draw a shock wave
function getShockCoords(x1, y1, M, theta, wing_m, wing_c, gamma) {
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
                y2 = 10;
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
    }
    else {
        // Bounce down
        y2 = 0;
        x2 = x1 + (y1 - y2) / (Math.tan(shock.beta));
    }
    let x = [x1, x2];
    let y = [y1, y2];
    return { x, y, shock };
}
function calcLiftAndDrag(h, lowerSurface, gamma, machInfinity, theta) {
    var xLast = lowerSurface[0].x;
    var yLast = lowerSurface[0].y;
    var lift = 0;
    var drag = 0;
    var currentPressureRatio = 1;
    // Loop through each shock
    for (let i = 0; i < lowerSurface.length; i++) {
        // Caculate the pressure with respect to freestream
        currentPressureRatio *= lowerSurface[i].pressureRatio;
        // If the shock is on the wing
        if (lowerSurface[i].y !== 0) {
            let x = lowerSurface[i].x;
            let y = lowerSurface[i].y;
            // Still take into account influence from the last shock
            if (x > 1) {
                x = 1;
                y = h;
            }
            // Create lift and drag per unit area
            lift += (x - xLast) * currentPressureRatio;
            drag += (yLast - y) * currentPressureRatio;
            xLast = x;
            yLast = y;
        }
    }
    // Calculate force on the upper surface using shock expansion method of a flat plate
    let expansion = calcExpansion(machInfinity, theta, gamma);
    // Check expansion was successful
    if (expansion.p2_p1 !== 0) {
        lift -= (1 - lowerSurface[0].x) * expansion.p2_p1;
        drag -= (lowerSurface[0].y - 1) * expansion.p2_p1;
    }
    // Non-dimensionalise
    var c_l = lift / (0.5 * gamma * Math.pow(machInfinity, 2));
    var c_d = drag / (0.5 * gamma * Math.pow(machInfinity, 2));
    return { c_l, c_d };
}
function calcPrandtlMeyer(M, gamma) {
    let M2 = Math.pow(M, 2);
    return Math.sqrt((gamma + 1) / (gamma - 1)) * Math.atan(Math.sqrt(((gamma - 1) / (gamma + 1)) * (M2 - 1))) - Math.atan(Math.sqrt(M2 - 1));
}
function invPrandtlMeyer(nu, gamma) {
    let nuMax = (Math.PI / 2) * (Math.sqrt((gamma + 1) / (gamma - 1)) - 1);
    // Deflection greater than max turning angle
    if (nu > nuMax)
        return 0;
    const machMax = 18;
    const machStep = .01;
    var machLeft = 0;
    var nuLeft = 0;
    var PMTable = [];
    // Create the mach - Prandtl Meyer Table
    const machLength = Math.floor(((machMax - 1) / machStep)) + 1;
    var machArray = [...Array(machLength).keys()].map(x => (x * machStep) + 1);
    machArray.forEach(mach => PMTable.push([mach, calcPrandtlMeyer(mach, gamma)]));
    // Function for performing linear interpolation
    const interp = (x, xp, fp) => fp[0] + (x - xp[0]) * (fp[1] - fp[0]) / (xp[1] - xp[0]);
    // Look for theta and interpolate when passed or return 90 deg (normal shock)
    for (let i = 0; i < PMTable.length; i++) {
        if (PMTable[i][1] < nu) {
            nuLeft = PMTable[i][1];
            machLeft = PMTable[i][0];
        }
        else {
            return interp(nu, [nuLeft, PMTable[i][1]], [machLeft, PMTable[i][0]]);
        }
    }
    console.log("Invalid Prandtl Meyer angle");
}
function calcExpansion(M1, theta, gamma) {
    let nu_M2 = theta + calcPrandtlMeyer(M1, gamma);
    let M2 = invPrandtlMeyer(nu_M2, gamma);
    let T2_T1 = 0;
    let p2_p1 = 0;
    let rho2_rho1 = 0;
    // If the expansion was successful
    if (M2 !== 0) {
        let numerator = 1 + (gamma - 1) / 2 * Math.pow(M1, 2);
        let denominator = 1 + (gamma - 1) / 2 * Math.pow(M2, 2);
        T2_T1 = numerator / denominator;
        p2_p1 = Math.pow((numerator / denominator), (gamma / (gamma - 1)));
        rho2_rho1 = Math.pow((numerator / denominator), (1 / (gamma - 1)));
    }
    return { M2, T2_T1, p2_p1, rho2_rho1 };
}
