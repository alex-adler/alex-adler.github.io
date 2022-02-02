class TickBox {
    name: string;
    enabled: boolean;
    colour: string;
    size: number;
    xPadding: number;
    yPadding: number;
    path: Path2D;

    constructor(name: string, pos: number, initialState: boolean) {
        this.name = name;
        this.enabled = initialState;
        this.colour = "#FFFFFF"
        this.size = 15 * window.devicePixelRatio;
        this.xPadding = 5 * window.devicePixelRatio;
        this.yPadding = 20 * window.devicePixelRatio;

        // Stack multiple boxes vertically
        this.yPadding *= pos;
        this.yPadding += (pos - 1) * this.size;
    }
    generatePath(canvas: HTMLCanvasElement) {
        this.path = new Path2D();
        this.path.rect(canvas.width - (this.size + this.xPadding), this.yPadding, this.size, this.size);
    }
    drawBox(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.colour;
        ctx.stroke(this.path);
        ctx.textAlign = 'right';
        ctx.font = window.devicePixelRatio * 20 + "px Roboto";
        ctx.fillStyle = this.colour;
        ctx.fillText(this.name, canvas.width - (this.size + 2 * this.xPadding), this.yPadding + this.size);
    }
    drawCross(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.colour;
        ctx.moveTo(canvas.width - (this.size + this.xPadding), this.yPadding);
        ctx.lineTo(canvas.width - this.xPadding, this.yPadding + this.size);
        ctx.moveTo(canvas.width - this.xPadding, this.yPadding);
        ctx.lineTo(canvas.width - (this.size + this.xPadding), this.yPadding + this.size);
        ctx.stroke();
    }
}

class PointOnWing {
    x: number;
    y: number;
    pressureRatio: number;
    constructor(x: number, y: number, pressureRatio: number) {
        this.x = x;
        this.y = y;
        this.pressureRatio = pressureRatio;
    }
}

var wingGridTickBox = new TickBox("Grid", 1, true);
var wingThicknessTickBox = new TickBox("Thickness", 2, false);

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
    var wingCanvas = <HTMLCanvasElement>document.getElementById("canvas-wing-in-ground");
    initCanvas(wingCanvas);
    initWingListeners(wingCanvas);
    movedSliders();
}

function initDataCanvas() {
    var dataCanvas = <HTMLCanvasElement>document.getElementById("canvas-wing-in-ground-graph");
    initCanvas(dataCanvas);
}

// Set canvas resolution
function initCanvas(canvas: HTMLCanvasElement) {
    // Deal with devices with a pixel ratio != 1
    const pixelRatio = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
}

function updateDataCanvas(liftCoeff: number, dragCoeff: number, liftCoeffFree: number, dragCoeffFree: number, momentCoeff: number, valid: boolean) {
    var canvas = <HTMLCanvasElement>document.getElementById("canvas-wing-in-ground-graph");
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let divisor = 8

        ctx.textAlign = 'left';
        ctx.font = "30px Roboto";
        ctx.fillStyle = "#FFFFFF";

        if (momentCoeff !== 0) {
            divisor = 10;
            ctx.fillText("Pitching Moment coefficient = " + momentCoeff.toFixed(4), 10, 9 * canvas.height / divisor);
        }

        ctx.fillText("SWIG Lift coefficient = " + liftCoeff.toFixed(4), 10, canvas.height / divisor);
        ctx.fillText("Free Lift coefficient = " + liftCoeffFree.toFixed(4), 10, 2 * canvas.height / divisor);
        ctx.fillText("Lift coefficient Gain = " + (100 * (liftCoeff - liftCoeffFree) / liftCoeffFree).toFixed(2) + "%", 10, 3 * canvas.height / divisor);
        ctx.fillText("SWIG Drag coefficient = " + dragCoeff.toFixed(4), 10, 5 * canvas.height / divisor);
        ctx.fillText("Free Drag coefficient = " + dragCoeffFree.toFixed(4), 10, 6 * canvas.height / divisor);
        ctx.fillText("Drag coefficient Gain = " + (100 * (dragCoeff - dragCoeffFree) / dragCoeffFree).toFixed(2) + "%", 10, 7 * canvas.height / divisor);


        if (!valid) {
            ctx.textAlign = 'center';
            ctx.font = "100px Roboto";
            ctx.fillStyle = "#FF0000";
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText("INVALID", 0, 0);
            ctx.restore();
        }
        // Draw outline
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FFFFFF";
        ctx.rect(1, 1, canvas.width - 2, canvas.height - 2);
        ctx.stroke();
    }
}

function initWingListeners(canvas: HTMLCanvasElement) {
    wingGridTickBox.generatePath(canvas);
    wingThicknessTickBox.generatePath(canvas);
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ['click', 'ontouchstart'].forEach(evt => {
            canvas.addEventListener(evt, (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect(), // abs. size of element
                    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
                    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

                const mouseX = (e.clientX - rect.left) * scaleX;  // scale mouse coordinates after they have
                const mouseY = (e.clientY - rect.top) * scaleY;   // been adjusted to be relative to element

                if (ctx.isPointInPath(wingGridTickBox.path, mouseX, mouseY)) {
                    wingGridTickBox.enabled = !wingGridTickBox.enabled;
                    movedSliders();
                }

                if (ctx.isPointInPath(wingThicknessTickBox.path, mouseX, mouseY)) {
                    wingThicknessTickBox.enabled = !wingThicknessTickBox.enabled;
                    movedSliders();
                }
            }, false)
        });
    }
}

// Read all sliders and update the wing canvas whenever any slider moves
function movedSliders() {
    // Read all the sliders
    const machSlider = <HTMLInputElement>document.getElementById("slider-mach");
    const alphaSlider = <HTMLInputElement>document.getElementById("slider-alpha");
    const heightSlider = <HTMLInputElement>document.getElementById("slider-height");
    const kinkSlider = <HTMLInputElement>document.getElementById("slider-kink");

    // Apply scaling
    const m = Number(machSlider.value) / 100;
    const a = Number(alphaSlider.value) / 100;
    const h = Number(heightSlider.value) / 1000;

    // Update the calculations and visualisation
    updateWing(m, a, h, kinkSlider);
}

// Visualise a supersonic wing in ground effect on an HTML canvas
function updateWing(mach: number, alpha: number, h: number, kinkSlider: HTMLInputElement) {
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
    const gamma = 1.31;

    // Padding as fraction of width or height
    const yPadding = .1;
    const xPadding = .1;

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
        const xScale = (1 - xPadding) * canvas.width / (xLim[1] - xLim[0]);
        const yScale = (1 - yPadding) * canvas.height / (yLim[1] - yLim[0]);

        const scale = Math.min(xScale, yScale);

        if (wingGridTickBox.enabled) {
            // Draw cross on grid tick box
            wingGridTickBox.drawCross(canvas, ctx);
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
        }

        // Draw tick box to enable grids
        wingGridTickBox.drawBox(canvas, ctx);
        // Draw tick box to enable thickness
        wingThicknessTickBox.drawBox(canvas, ctx);

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
        const xLeadingEdge = wing.x[0];
        const yLeadingEdge = wing.y[0];

        const xTrailingEdge = wing.x[1];
        const yTrailingEdge = wing.y[1];

        // Get the text by the slider
        var kinkSliderText = document.getElementById("display-kink");

        var kinkAngle = 0;
        var xKink = 0;

        let centroid = { x: 0, y: 0 };

        // Check if we are displaying the wing with thickness
        if (wingThicknessTickBox.enabled) {
            // Tick the box
            wingThicknessTickBox.drawCross(canvas, ctx);

            // Set the range of the slider to the physical limits 
            kinkSlider.min = (alpha * 100).toString();
            kinkSlider.max = ((Math.min(Math.PI / 2, calcMaxTurnAngle(mach, gamma)) - .1) * 100).toString();

            kinkAngle = Number(kinkSlider.value) / 100;
            xKink = 1 - (yLeadingEdge - h) / Math.atan(kinkAngle);

            // Draw top surface of the wing
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.fillStyle = orange;
            ctx.moveTo(processX(wing.x[0], canvas.width, xPadding, scale), processY(wing.y[0], canvas.height, yPadding, scale));
            ctx.lineTo(processX(xKink, canvas.width, xPadding, scale), processY(wing.y[0], canvas.height, yPadding, scale));
            ctx.lineTo(processX(wing.x[1], canvas.width, xPadding, scale), processY(wing.y[1], canvas.height, yPadding, scale));
            ctx.lineTo(processX(wing.x[0], canvas.width, xPadding, scale), processY(wing.y[0], canvas.height, yPadding, scale));
            ctx.closePath();
            ctx.fill();

            // Calculate centroid of the triangle (center of mass if homogeneous)
            centroid = {
                x: (wing.x[0] + wing.x[1] + xKink) / 3,
                y: (2 * wing.y[0] + wing.y[1]) / 3
            }

            // Draw center of mass/gravity
            let CoG = new Path2D();
            ctx.fillStyle = "#a40e4c";
            CoG.arc(processX(centroid.x, canvas.width, xPadding, scale), processY(centroid.y, canvas.height, yPadding, scale), 3, 0, 2 * Math.PI);
            ctx.fill(CoG);

            // Display slider and text
            kinkSliderText.hidden = false;
            kinkSlider.hidden = false;
        } else {
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = orange;
            ctx.moveTo(processX(wing.x[0], canvas.width, xPadding, scale), processY(wing.y[0], canvas.height, yPadding, scale));
            ctx.lineTo(processX(wing.x[1], canvas.width, xPadding, scale), processY(wing.y[1], canvas.height, yPadding, scale));
            ctx.stroke();

            // Used for the turn angle in the expansion
            kinkAngle = alpha;

            // Hide everything 
            kinkSliderText.hidden = true;
            kinkSlider.hidden = true;
        }

        var x = xLeadingEdge;
        var y = yLeadingEdge;

        // Straight line equation for the wing
        const wingM = (yLeadingEdge - yTrailingEdge) / (xLeadingEdge - xTrailingEdge);
        const wingC = yLeadingEdge - xLeadingEdge * wingM;

        const maxShocks = 20;
        var shockCount = 0;

        // Line width of shocks
        ctx.lineWidth = 2;
        ctx.strokeStyle = offwhite;

        // Variable for calculating forces
        var lowerSurface: PointOnWing[] = [new PointOnWing(xLeadingEdge, yLeadingEdge, 1)];
        const machInfinity = mach;

        // Variable for keeping track of whether the assumptions are still valid and the result is useful 
        var valid = true;

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

            lowerSurface.push(new PointOnWing(x, y, shock.shock.p2_p1));
            // If the shock has passed the wing
            if (y !== 0 && x > 1)
                break;

            // I don't know what happens if the flow goes subsonic under the wing (choked flow?)
            if (mach < 1 && x < 1)
                valid = false;

            shockCount++;
            if (shockCount > maxShocks) {
                valid = false;
                console.log("Too many shocks");
                break;
            }
        }
        const wingProperties = calcLiftAndDrag(h, lowerSurface, gamma, machInfinity, alpha, kinkAngle, xKink, centroid.x, centroid.y);
        let CoP = new Path2D();
        ctx.fillStyle = "#4FFFDC";
        CoP.arc(processX(wingProperties.centerOfPressure.x, canvas.width, xPadding, scale), processY(wingProperties.centerOfPressure.y, canvas.height, yPadding, scale), 3, 0, 2 * Math.PI);
        ctx.fill(CoP);

        updateDataCanvas(wingProperties.c_l, wingProperties.c_d, wingProperties.c_lFreeStream, wingProperties.c_dFreeStream, wingProperties.c_m, valid);
    }
}

// Canvas has 0,0 at the top left but I need it at the bottom left with a bit of padding and scaling
function processY(y: number, height: number, padding: number, scale: number) {
    const offset_px = (1 - padding / 2) * height;
    return offset_px - y * scale;
}

// Add padding to x coordinates and scale them to the set limits
function processX(x: number, width: number, padding: number, scale: number) {
    // Make sure the it is centered on x=.5 (halfway along the wing)
    const x0 = (((1 - padding) * width / scale) - 1) / 2;
    const offset_px = (padding / 2) * width;
    return offset_px + (x + x0) * scale;
}

// Calculate the position of the wing 
function getWingCoords(h: number, alpha: number) {
    const x = [1 - Math.cos(alpha), 1]
    const y = [h + Math.sin(alpha), h]
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
                x2 = 10;
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

function calcFreeStreamFlatPlate(mach: number, alpha: number, gamma: number) {
    const shock = calcObliqueShock(mach, alpha, gamma);
    const expansion = calcExpansion(mach, alpha, gamma);

    const normal = shock.p2_p1 - expansion.p2_p1;

    const lift = normal * Math.cos(alpha);
    const drag = normal * Math.sin(alpha);

    const M2 = Math.pow(mach, 2);

    const c_l = lift / (0.5 * gamma * M2);
    const c_d = drag / (0.5 * gamma * M2);

    return { c_l, c_d };
}

function calcLiftAndDrag(h: number, lowerSurface: PointOnWing[], gamma: number, machInfinity: number, alpha: number, kinkAngle: number, xKink: number, centroidX: number, centroidY: number) {
    const x_LE = lowerSurface[0].x;
    const y_LE = lowerSurface[0].y;

    var xLast = x_LE;
    var yLast = y_LE;

    var lift = 0;
    var drag = 0;

    var currentPressureRatio = 1;

    let xP = 0;
    let yP = 0;
    let P = 0;

    // Loop through each shock
    for (let i = 1; i < lowerSurface.length; i++) {
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

            // Integrate pressure for center of pressure calculations
            xP += ((x - xLast) / 2 + xLast) * currentPressureRatio;
            yP += ((yLast - y) / 2 + y) * currentPressureRatio;
            P += currentPressureRatio;

            xLast = x;
            yLast = y;
        }
        // Calculate the pressure with respect to freestream
        currentPressureRatio *= lowerSurface[i].pressureRatio;
    }

    // Calculate force on the upper surface using shock expansion method of a flat plate
    const expansion = calcExpansion(machInfinity, kinkAngle, gamma);

    // Check expansion was successful
    if (expansion.p2_p1 !== 0) {
        if (xKink != 0) {
            lift -= (xKink - lowerSurface[0].x) * 1;
            lift -= (1 - xKink) * expansion.p2_p1;
            // For center of pressure
            xP += ((1 - xKink) / 2 + xKink) * expansion.p2_p1;
        }
        else {
            lift -= (1 - lowerSurface[0].x) * expansion.p2_p1;
            // For center of pressure
            xP += ((1 - x_LE) / 2 + x_LE) * expansion.p2_p1;
        }
        drag -= (lowerSurface[0].y - h) * expansion.p2_p1;
        yP += ((y_LE - h) / 2 + h) * expansion.p2_p1;
        P += expansion.p2_p1;
    }

    // Non-dimensionalise
    const c_l = lift / (0.5 * gamma * Math.pow(machInfinity, 2));
    const c_d = drag / (0.5 * gamma * Math.pow(machInfinity, 2));

    const freestream = calcFreeStreamFlatPlate(machInfinity, alpha, gamma);
    const c_lFreeStream = freestream.c_l;
    const c_dFreeStream = freestream.c_d;

    const pressureMagnitude = Math.sqrt(Math.pow(lift, 2) + Math.pow(drag, 2));
    const centerOfPressure = { x: xP / P, y: yP / P };

    let c_m = 0;

    // Calculate the pitching moment about the center of gravity
    if (xKink !== 0) {
        const momentArmLength = Math.sqrt(Math.pow(centroidX - centerOfPressure.x, 2) + Math.pow(centroidY - centerOfPressure.y, 2));
        const momentArmAngle = - Math.atan((centroidY - centerOfPressure.y) / (centroidX - centerOfPressure.x));
        const pressureAngle = Math.atan(lift / drag);

        const torqueForceAngle = Math.PI / 2 - momentArmAngle;
        const torqueForceMagnitude = pressureMagnitude * Math.cos(Math.PI / 2 - momentArmAngle - pressureAngle);
        let moment = Math.abs(torqueForceMagnitude * momentArmLength);

        // If anticlockwise make the moment negative
        if (torqueForceMagnitude * Math.cos(torqueForceAngle) > 0)
            moment = -moment;

        c_m = moment / (0.5 * gamma * Math.pow(machInfinity, 2));
    }
    return { c_l, c_d, c_lFreeStream, c_dFreeStream, centerOfPressure, c_m };
}

function calcPrandtlMeyer(M: number, gamma: number) {
    const M2 = Math.pow(M, 2);
    return Math.sqrt((gamma + 1) / (gamma - 1)) * Math.atan(Math.sqrt(((gamma - 1) / (gamma + 1)) * (M2 - 1))) - Math.atan(Math.sqrt(M2 - 1));
}

function calcMaxTurnAngle(M: number, gamma: number) {
    const nuMax = (Math.PI / 2) * (Math.sqrt((gamma + 1) / (gamma - 1)) - 1);
    return nuMax - calcPrandtlMeyer(M, gamma);
}

function invPrandtlMeyer(nu: number, gamma: number) {
    const machMax = 65;
    const machStep = .1;
    var machLeft = 0;
    var nuLeft = 0;
    var PMTable: number[][] = [];

    // Create the mach - Prandtl Meyer Table
    const machLength = Math.floor(((machMax - 1) / machStep)) + 1;
    var machArray = [...Array(machLength).keys()].map(x => (x * machStep) + 1);
    machArray.forEach(mach => PMTable.push([mach, calcPrandtlMeyer(mach, gamma)]));

    // Function for performing linear interpolation
    const interp = (x: number, xp: number[], fp: number[]) => fp[0] + (x - xp[0]) * (fp[1] - fp[0]) / (xp[1] - xp[0]);

    // Look for theta and interpolate when passed or return 90 deg (normal shock)
    for (let i = 0; i < PMTable.length; i++) {
        if (PMTable[i][1] < nu) {
            nuLeft = PMTable[i][1];
            machLeft = PMTable[i][0];
        }
        else {
            return interp(nu, [nuLeft, PMTable[i][1]], [machLeft, PMTable[i][0]])
        }
    }
    console.log("Invalid Prandtl Meyer angle");
}

function calcExpansion(M1: number, theta: number, gamma: number) {
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