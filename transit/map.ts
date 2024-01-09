const AU_km = 1.496e8;
const scalePerKm = 1 / (5 * AU_km);

export class Orbit {
	GM_km3_s2: number;

	semiMajorAxis_km: number;
	eccentricity: number;
	inclination_deg: number;
	longitudOfAscendingNode_deg: number;
	argumentOfPeriapsis_deg: number;
	meanAnomaly_0_deg: number;

	semiMinorAxis_km: number;

	meanAnomaly_deg: number;
	eccentricAnomaly_deg: number;
	trueAnomaly_rad: number;
	trueAnomaly_deg: number;

	radius_km: number;

	positionVector_perifocalFrame = [0, 0, 0];
	constructor(
		a_km: number,
		e: number,
		i_deg: number,
		longitudeOfAscendingNode_deg: number,
		argumentOfPeriapsis_deg: number,
		meanAnomaly_deg: number,
		GM_km3_s2: number,
		radius_km: number
	) {
		this.semiMajorAxis_km = a_km;
		this.eccentricity = e;
		this.inclination_deg = i_deg;
		this.longitudOfAscendingNode_deg = longitudeOfAscendingNode_deg;
		this.argumentOfPeriapsis_deg = argumentOfPeriapsis_deg;
		// this.meanAnomaly_0_deg = meanAnomaly_deg;
		this.meanAnomaly_0_deg = 0;

		this.semiMinorAxis_km = a_km * (1 - this.eccentricity);

		this.GM_km3_s2 = GM_km3_s2;
		this.radius_km = radius_km;
	}
	draw(ctx: CanvasRenderingContext2D, canvasUnit: number, reset: () => void, currentScale: number) {
		if (this.semiMajorAxis_km == undefined) return;

		// console.log("true: " + this.eccentricAnomaly_deg + ", mean: " + this.meanAnomaly_deg);
		// The scale (in pixels per km) is the number of pixels displayed on the canvas divided by a number of kilometers
		let scale = canvasUnit * scalePerKm;

		// let ellipseCenter = {
		// 	x: 0,
		// 	y: 0,
		// };
		let ellipseCenter = {
			x: Math.cos(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
			y: Math.sin(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
		};

		let ellipseCenterMagnitude = Math.sqrt(ellipseCenter.x**2 + ellipseCenter.y**2)
		// console.log(ellipseCenter.x^2);
		// console.log("Magnitude {ellipseCenterMagnitude} +this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg + this.eccentricity + this.semiMajorAxis_km");

		ctx.beginPath();
		ctx.fillStyle = "coral";
		ctx.arc(this.positionVector_perifocalFrame[0] * scale, this.positionVector_perifocalFrame[1] * scale, 5 / currentScale, 0, 2 * Math.PI);
		// ctx.arc(this.positionVector_inertialFrame[0] * scale, this.positionVector_inertialFrame[1] * scale, this.radius_km * scale, 0, 2 * Math.PI);
		ctx.fill();

		// console.log("x: " + this.positionVector_inertialFrame[0] * scale + ", y: " + this.positionVector_inertialFrame[1] * scale);
		// console.log("x: " + ellipseCenter.x + ", y: " + ellipseCenter.y);

		// Draw orbit circle with a gradient to illustrate current position and direction
		// let largeSide = this.semiMajorAxis_km * scale; // Why is the fudge factor necessary?
		let largeSide = ellipseCenterMagnitude +this.semiMajorAxis_km * scale; // Why is the fudge factor necessary?
		var width = 0.5 / currentScale;
		ctx.lineWidth = width;

		let colourAngle_rad = degToRad(this.trueAnomaly_deg);

		var brightHalf = ctx.createLinearGradient(
			largeSide * Math.cos(colourAngle_rad),
			-largeSide * Math.sin(colourAngle_rad),
			-largeSide * Math.cos(colourAngle_rad),
			largeSide * Math.sin(colourAngle_rad)
		);
		brightHalf.addColorStop(0, "white");
		brightHalf.addColorStop(1, "DimGray");

		var darkHalf = ctx.createLinearGradient(
			largeSide * Math.cos(colourAngle_rad),
			-largeSide * Math.sin(colourAngle_rad),
			-largeSide * Math.cos(colourAngle_rad),
			largeSide * Math.sin(colourAngle_rad)
		);
		darkHalf.addColorStop(0, "#202020");
		// darkHalf.addColorStop(0, "#222222");
		darkHalf.addColorStop(1, "DimGray");

		// First we make a clipping region for the left half
		ctx.save();
		ctx.beginPath();
		ctx.rotate(colourAngle_rad);
		ctx.rect(-largeSide - width, -largeSide - width, (largeSide + width) * 2, largeSide + width * 2);
		reset();
		ctx.clip();

		// Then we draw the left half
		ctx.strokeStyle = brightHalf;
		ctx.beginPath();
		ctx.ellipse(
			ellipseCenter.x,
			ellipseCenter.y,
			this.semiMajorAxis_km * scale,
			this.semiMinorAxis_km * scale,
			degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg),
			0 * Math.PI,
			2 * Math.PI
		);
		ctx.stroke();

		ctx.restore(); // restore clipping region to default

		// Then we make a clipping region for the right half
		ctx.save();
		ctx.beginPath();
		ctx.rotate(colourAngle_rad);
		ctx.rect(-largeSide - width, -width, (largeSide + width) * 2, largeSide + width * 2);
		reset();
		ctx.clip();

		// Then we draw the right half
		ctx.strokeStyle = darkHalf;
		ctx.beginPath();
		ctx.ellipse(
			ellipseCenter.x,
			ellipseCenter.y,
			this.semiMajorAxis_km * scale,
			this.semiMinorAxis_km * scale,
			degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg),
			0 * Math.PI,
			2 * Math.PI
		);
		ctx.stroke();

		ctx.restore(); // restore clipping region to default
	}
	keplersEquation(E_rad: number): number {
		return E_rad - this.eccentricity * Math.sin(E_rad) - radToDeg(this.meanAnomaly_deg);
	}
	updatePosition(t_ms: number) {
		this.meanAnomaly_deg = (this.meanAnomaly_0_deg + t_ms * (this.GM_km3_s2 / this.semiMajorAxis_km ** 3) ** 0.5) % 360;
		let eccentricAnomaly_rad = newtonRaphson(this.keplersEquation.bind(this), degToRad(this.meanAnomaly_deg), null);
		this.eccentricAnomaly_deg = radToDeg(eccentricAnomaly_rad);
		this.trueAnomaly_rad =
			2 *
			Math.atan2(
				(1 + this.eccentricity) ** 0.5 * Math.sin(eccentricAnomaly_rad / 2),
				(1 - this.eccentricity) ** 0.5 * Math.cos(eccentricAnomaly_rad / 2)
			);
		this.trueAnomaly_deg = degToRad(this.trueAnomaly_rad);
		let distanceToCenter = this.semiMajorAxis_km * (1 - this.eccentricity * Math.cos(eccentricAnomaly_rad));
		console.log(
			"Mean anomaly: " +
				this.meanAnomaly_deg +
				" deg | Eccentric anomaly: " +
				(radToDeg(eccentricAnomaly_rad) % 360) +
				" deg | Radius = " +
				distanceToCenter
		);
		// let positionVector_perifocalFrame = new Array(3);
		this.positionVector_perifocalFrame[0] = distanceToCenter * Math.cos(this.trueAnomaly_rad);
		this.positionVector_perifocalFrame[1] = distanceToCenter * Math.sin(this.trueAnomaly_rad);
		this.positionVector_perifocalFrame[2] = 0;

		let argumentOfPeriapsis_rad = degToRad(this.argumentOfPeriapsis_deg);
		let inclination_rad = degToRad(this.inclination_deg);
		let longitudOfAscendingNode_rad = degToRad(this.longitudOfAscendingNode_deg);

		// this.positionVector_inertialFrame[0] =
		// 	positionVector_perifocalFrame[0] *
		// 		(Math.cos(argumentOfPeriapsis_rad) * Math.cos(longitudOfAscendingNode_rad) -
		// 			Math.sin(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.sin(longitudOfAscendingNode_rad)) -
		// 	positionVector_perifocalFrame[1] *
		// 		(Math.sin(argumentOfPeriapsis_rad) * Math.cos(longitudOfAscendingNode_rad) +
		// 			Math.cos(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.sin(longitudOfAscendingNode_rad));
		// this.positionVector_inertialFrame[1] =
		// 	positionVector_perifocalFrame[0] *
		// 		(Math.cos(argumentOfPeriapsis_rad) * Math.sin(longitudOfAscendingNode_rad) +
		// 			Math.sin(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.cos(longitudOfAscendingNode_rad)) +
		// 	positionVector_perifocalFrame[1] *
		// 		(Math.cos(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.cos(longitudOfAscendingNode_rad) -
		// 			Math.sin(argumentOfPeriapsis_rad) * Math.sin(longitudOfAscendingNode_rad));
		// this.positionVector_inertialFrame[2] =
		// 	positionVector_perifocalFrame[0] * (Math.sin(argumentOfPeriapsis_rad) * Math.sin(inclination_rad)) -
		// 	positionVector_perifocalFrame[1] * (Math.cos(argumentOfPeriapsis_rad) * Math.sin(inclination_rad));
		// console.log(
		// 	"Perifocal: " +
		// 	this.positionVector_perifocalFrame[0] / AU_km +
		// 	" AU | " +
		// 	this.positionVector_perifocalFrame[1] / AU_km +
		// 	" AU | " +
		// 	this.positionVector_perifocalFrame[2] +
		// 	" km"
		// );
		// console.log(
		// 	"Inertial: " +
		// 		this.positionVector_inertialFrame[0] / AU_km +
		// 		" AU | " +
		// 		this.positionVector_inertialFrame[1] / AU_km +
		// 		" AU | " +
		// 		this.positionVector_inertialFrame[2] +
		// 		" km"
		// );
	}
}
// https://github.com/scijs/newton-raphson-method
// function newtonRaphson(f: (x: number) => number, fp: (x: number) => number, x0: number, options: any) {
function newtonRaphson(f: (x: number) => number, x0: number, options: any): number {
	var x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose, eps;
	let fp = null;

	// Interpret variadic forms:
	// if (typeof fp !== "function") {
	// 	options = x0;
	// 	x0 = fp;
	// 	fp = null;
	// }

	options = options || {};
	tol = options.tolerance === undefined ? 1e-7 : options.tolerance;
	eps = options.epsilon === undefined ? 2.220446049250313e-16 : options.epsilon;
	maxIter = options.maxIterations === undefined ? 20 : options.maxIterations;
	h = options.h === undefined ? 1e-4 : options.h;
	verbose = options.verbose === undefined ? false : options.verbose;
	hr = 1 / h;

	iter = 0;
	while (iter++ < maxIter) {
		// Compute the value of the function:
		y = f(x0);

		// if (fp) {
		// 	yp = fp(x0);
		// } else {
		// Needs numerical derivatives:
		yph = f(x0 + h);
		ymh = f(x0 - h);
		yp2h = f(x0 + 2 * h);
		ym2h = f(x0 - 2 * h);

		yp = ((ym2h - yp2h + 8 * (yph - ymh)) * hr) / 12;
		// }

		// Check for badly conditioned update (extremely small first deriv relative to function):
		if (Math.abs(yp) <= eps * Math.abs(y)) {
			if (verbose) {
				console.log("Newton-Raphson: failed to converged due to nearly zero first derivative");
			}
			return 0;
		}

		// Update the guess:
		x1 = x0 - y / yp;

		// Check for convergence:
		if (Math.abs(x1 - x0) <= tol * Math.abs(x1)) {
			if (verbose) {
				console.log("Newton-Raphson: converged to x = " + x1 + " after " + iter + " iterations");
			}
			return x1;
		}

		// Transfer update to the new guess:
		x0 = x1;
	}

	if (verbose) {
		console.log("Newton-Raphson: Maximum iterations reached (" + maxIter + ")");
	}
	return 0;
}

function degToRad(degrees: number) {
	return degrees * (Math.PI / 180);
}

function radToDeg(radians: number) {
	return radians * (180 / Math.PI);
}
