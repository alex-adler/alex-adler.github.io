const AU_km = 1.496e8;
const scale = 1 / (5 * AU_km);

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
	trueAnomaly_deg: number;
	constructor(
		a_km: number,
		e: number,
		i_deg: number,
		longitudeOfAscendingNode_deg: number,
		argumentOfPeriapsis_deg: number,
		meanAnomaly_deg: number,
		GM_km3_s2: number
	) {
		this.semiMajorAxis_km = a_km;
		this.eccentricity = e;
		this.inclination_deg = i_deg;
		this.longitudOfAscendingNode_deg = longitudeOfAscendingNode_deg;
		this.argumentOfPeriapsis_deg = argumentOfPeriapsis_deg;
		this.meanAnomaly_0_deg = meanAnomaly_deg;

		this.semiMinorAxis_km = a_km * (1 - this.eccentricity);

		this.GM_km3_s2 = GM_km3_s2;
	}
	draw(ctx: CanvasRenderingContext2D, canvasUnit: number) {
		if (this.semiMajorAxis_km == undefined) return;

		// this.meanAnomaly_deg

		let largeSide = this.semiMajorAxis_km * canvasUnit * scale;
		var width = 0.5;
		ctx.lineWidth = width;

		var brightHalf = ctx.createLinearGradient(0, 0, largeSide, 0);
		brightHalf.addColorStop(0, "white");
		brightHalf.addColorStop(1, "gray");

		var darkHalf = ctx.createLinearGradient(0, 0, largeSide, 0);
		darkHalf.addColorStop(0, "#242424");
		darkHalf.addColorStop(1, "gray");

		// ctx.rotate(degToRad(this.meanAnomaly_deg));
		// First we make a clipping region for the left half
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = brightHalf;
		ctx.rect(-largeSide - width, -largeSide - width, (largeSide + width) * 2, largeSide + width * 2);
		ctx.clip();
		// ctx.stroke();
		// ctx.setTransform(1, 0, 0, 1, 0, 0);
		// Then we draw the left half
		ctx.beginPath();
		ctx.ellipse(
			Math.cos(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
			Math.sin(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
			this.semiMajorAxis_km * canvasUnit * scale,
			this.semiMinorAxis_km * canvasUnit * scale,
			degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg),
			0 * Math.PI,
			2 * Math.PI
		);
		ctx.stroke();

		ctx.restore(); // restore clipping region to default

		// Then we make a clipping region for the right half
		ctx.save();
		ctx.beginPath();
		ctx.rect(-largeSide - width, 0, (largeSide + width) * 2, largeSide + width * 2);
		// ctx.stroke();
		ctx.clip();

		// Then we draw the right half
		ctx.strokeStyle = darkHalf;
		ctx.beginPath();
		ctx.ellipse(
			Math.cos(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
			Math.sin(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
			this.semiMajorAxis_km * canvasUnit * scale,
			this.semiMinorAxis_km * canvasUnit * scale,
			degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg),
			0 * Math.PI,
			2 * Math.PI
		);
		ctx.stroke();

		// ctx.beginPath();
		// ctx.rect(-largeSide, -largeSide, largeSide * 2, largeSide * 2);
		// ctx.ellipse(
		// 	Math.cos(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
		// 	Math.sin(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
		// 	this.semiMajorAxis_km * canvasUnit * scale,
		// 	this.semiMinorAxis_km * canvasUnit * scale,
		// 	degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg),
		// 	0 * Math.PI,
		// 	1 * Math.PI
		// );
		// ctx.strokeStyle = "white";
		// ctx.stroke();

		ctx.restore(); // restore clipping region to default
	}
	keplersEquation(E_rad: number): number {
		return E_rad - this.eccentricity * Math.sin(E_rad) - radToDeg(this.meanAnomaly_deg);
	}
	updatePosition(t_ms: number) {
		this.meanAnomaly_deg = this.meanAnomaly_0_deg + t_ms * (this.GM_km3_s2 / this.semiMajorAxis_km ** 3) ** 0.5;
		let eccentricAnomaly_rad = newtonRaphson(this.keplersEquation.bind(this), degToRad(this.meanAnomaly_deg), null);
		let trueAnomaly_rad =
			2 *
			Math.atan2(
				(1 + this.eccentricity) ** 0.5 * Math.sin(eccentricAnomaly_rad / 2),
				(1 - this.eccentricity) ** 0.5 * Math.cos(eccentricAnomaly_rad / 2)
			);
		let distanceToCenter = this.semiMajorAxis_km * (1 - this.eccentricity * Math.cos(eccentricAnomaly_rad));
		console.log(
			"Mean anomaly: " +
				this.meanAnomaly_deg +
				" deg | Eccentric anomaly: " +
				(radToDeg(eccentricAnomaly_rad) % 360) +
				" deg | Radius = " +
				distanceToCenter
		);
		let positionVector_perifocalFrame = new Array(3);
		positionVector_perifocalFrame[0] = distanceToCenter * Math.cos(trueAnomaly_rad);
		positionVector_perifocalFrame[1] = distanceToCenter * Math.sin(trueAnomaly_rad);
		positionVector_perifocalFrame[2] = 0;

		let argumentOfPeriapsis_rad = degToRad(this.argumentOfPeriapsis_deg);
		let inclination_rad = degToRad(this.inclination_deg);
		let longitudOfAscendingNode_rad = degToRad(this.longitudOfAscendingNode_deg);

		let positionVector_inertialFrame = new Array(3);
		positionVector_inertialFrame[0] =
			positionVector_perifocalFrame[0] *
			(Math.cos(argumentOfPeriapsis_rad) * Math.cos(longitudOfAscendingNode_rad) -
				Math.sin(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.sin(longitudOfAscendingNode_rad) -
				positionVector_perifocalFrame[1] *
					(Math.sin(argumentOfPeriapsis_rad) * Math.cos(longitudOfAscendingNode_rad) +
						Math.cos(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.sin(longitudOfAscendingNode_rad)));
		positionVector_inertialFrame[1] =
			positionVector_perifocalFrame[0] *
			(Math.cos(argumentOfPeriapsis_rad) * Math.cos(longitudOfAscendingNode_rad) +
				Math.sin(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.sin(longitudOfAscendingNode_rad) +
				positionVector_perifocalFrame[1] *
					(Math.cos(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.cos(longitudOfAscendingNode_rad) -
						Math.sin(argumentOfPeriapsis_rad) * Math.sin(longitudOfAscendingNode_rad)));
		positionVector_inertialFrame[2] =
			positionVector_perifocalFrame[0] * (Math.sin(argumentOfPeriapsis_rad) * Math.sin(inclination_rad)) -
			positionVector_perifocalFrame[1] * (Math.cos(argumentOfPeriapsis_rad) * Math.sin(inclination_rad));
		console.log(
			"Perifocal: " +
				positionVector_perifocalFrame[0] / AU_km +
				" AU | " +
				positionVector_perifocalFrame[1] / AU_km +
				" AU | " +
				positionVector_perifocalFrame[2] +
				" km"
		);
		console.log(
			"Inertial: " +
				positionVector_inertialFrame[0] / AU_km +
				" AU | " +
				positionVector_inertialFrame[1] / AU_km +
				" AU | " +
				positionVector_inertialFrame[2] +
				" km"
		);
	}
}
// https://github.com/scijs/newton-raphson-method
// function newtonRaphson(f: (x: number) => number, fp: (x: number) => number, x0: number, options: any) {
function newtonRaphson(f: (x: number) => number, x0: number, options: any): number {
	var x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose, eps;
	let fp = null;

	// Interpret variadic forms:
	if (typeof fp !== "function") {
		options = x0;
		x0 = fp;
		fp = null;
	}

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
