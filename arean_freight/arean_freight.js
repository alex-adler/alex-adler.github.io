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
    let machSlider = document.getElementById("slider-mach");
    let alphaSlider = document.getElementById("slider-alpha");
    let heightSlider = document.getElementById("slider-height");
    // Apply scaling
    let m = Number(machSlider.value) / 100;
    let a = Number(alphaSlider.value) / 100;
    let h = Number(heightSlider.value) / 100;
    // Update the calculations and visualisation
    updateWing(m, a, h);
}
// Visualise a supersonuc wing in ground effect on an HTML canvas
function updateWing(mach, alpha, h) {
    console.log("Updating for M: " + mach + ", alpha: " + alpha + ", h: " + h);
    var gamma = 1.31;
    var yPadding = .1;
    var xPadding = .1;
    var yLim = [0, .2];
    var xLim = [-0.5, 1.5];
    if (h > .15) {
        yLim[1] = h + .05;
    }
    var canvas = document.getElementById("canvas-wing-in-ground");
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        // Deal with devices with a pixel ratio != 1
        const pixelRatio = window.devicePixelRatio;
        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;
        // Exclusiely use radians from here on
        alpha *= Math.PI / 180;
        // Draw wing
        let wing = getWingCoords(h, alpha);
        ctx.moveTo(processX(wing.x[0], canvas, xPadding, xLim), processY(wing.y[0], canvas, yPadding, yLim));
        ctx.lineTo(processX(wing.x[1], canvas, xPadding, xLim), processY(wing.y[1], canvas, yPadding, yLim));
        ctx.stroke();
        var x = wing.x[0];
        var y = wing.y[0];
        // Straight line equation for the wing
        var wingM = (wing.y[0] - wing.y[1]) / (wing.x[0] - wing.x[1]);
        var wingC = wing.y[0] - wing.x[0] * wingM;
        var maxShocks = 20;
        var shockCount = 0;
        // Loop until flow is no longer supersonic or it has reached the end of the wing
        while (mach > 1) {
            var shock = getShockCoords(x, y, mach, alpha, wingM, wingC, gamma);
            ctx.moveTo(processX(shock.x[0], canvas, xPadding, xLim), processY(shock.y[0], canvas, yPadding, yLim));
            ctx.lineTo(processX(shock.x[1], canvas, xPadding, xLim), processY(shock.y[1], canvas, yPadding, yLim));
            ctx.stroke();
            x = shock.x[1];
            y = shock.y[1];
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
function processY(y, canvas, yPadding, yLim) {
    let heightPerUnit = (1 - yPadding) * canvas.height / (yLim[1] - yLim[0]);
    let offset = (1 - yPadding / 2) * canvas.height;
    return offset - (y - yLim[0]) * heightPerUnit;
}
// Add padding to x coordinates and scale them to the set limits
function processX(x, canvas, xPadding, xLim) {
    let widthPerUnit = (1 - xPadding) * canvas.width / (xLim[1] - xLim[0]);
    let offset = (xPadding / 2) * canvas.width;
    return offset + (x - xLim[0]) * widthPerUnit;
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
