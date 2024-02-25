import { Vector, Matrix } from "ts-matrix";

const AU_km = 1.496e8;
const scalePerKm = 1 / (5 * AU_km);

export class Orbit {
	GM_km3_s2: number = 0;
	GM_km3_s2_primary: number = 0;

	semiMajorAxis_km: number = 0;
	eccentricity: number = 0;
	inclination_deg: number = 0;
	inclination_rad: number = 0;
	longitudeOfAscendingNode_deg: number = 0;
	longitudeOfAscendingNode_rad: number = 0;
	argumentOfPeriapsis_deg: number = 0;
	argumentOfPeriapsis_rad: number = 0;
	meanAnomaly_0_deg: number = 0;
	meanAnomaly_0_rad: number = 0;

	semiMinorAxis_km: number = 0;

	meanAnomaly_deg: number = 0;
	meanAnomaly_rad: number = 0;
	eccentricAnomaly_deg: number = 0;
	trueAnomaly_rad: number = 0;
	trueAnomaly_deg: number = 0;

	radius_km: number = 0;

	positionVector_perifocalFrame = new Matrix(3, 1);
	positionVector_inertialFrame = new Matrix(3, 1);

	velocity = new Vector();

	// v_radial = 0;
	// v_perpendicular = 0;
	constructor(
		a_km: number,
		e: number,
		i_deg: number,
		longitudeOfAscendingNode_deg: number,
		argumentOfPeriapsis_deg: number,
		meanAnomaly_deg: number,
		GM_km3_s2: number,
		GM_km3_s2_primary: number,
		radius_km: number
	) {
		this.semiMajorAxis_km = a_km;
		if (e !== undefined) this.eccentricity = e;
		if (!isNaN(i_deg)) this.inclination_deg = i_deg;
		this.longitudeOfAscendingNode_deg = longitudeOfAscendingNode_deg;
		this.argumentOfPeriapsis_deg = argumentOfPeriapsis_deg;

		this.meanAnomaly_0_deg = meanAnomaly_deg;
		this.meanAnomaly_0_rad = degToRad(this.meanAnomaly_0_deg);

		this.semiMinorAxis_km = a_km * Math.sqrt(1 - this.eccentricity ** 2);

		this.GM_km3_s2 = GM_km3_s2;
		this.GM_km3_s2_primary = GM_km3_s2_primary;
		this.radius_km = radius_km;

		this.updatePosition(0);
	}
	draw(ctx: CanvasRenderingContext2D, canvasUnit: number, reset: () => void, currentScale: number) {
		if (this.semiMajorAxis_km == undefined) return;

		// The scale (in pixels per km) is the number of pixels displayed on the canvas divided by a number of kilometers
		let scale = canvasUnit * scalePerKm;

		let ellipseCenter = {
			x: Math.cos(degToRad(this.longitudeOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
			y: Math.sin(degToRad(this.longitudeOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * scale,
		};

		let ellipseCenterMagnitude = Math.sqrt(ellipseCenter.x ** 2 + ellipseCenter.y ** 2);

		// Draw body
		ctx.beginPath();
		ctx.fillStyle = "coral";
		ctx.arc(
			this.positionVector_inertialFrame.values[0][0] * scale,
			this.positionVector_inertialFrame.values[1][0] * scale,
			this.radius_km * scale,
			// 5 / currentScale,
			0,
			2 * Math.PI
		);
		ctx.fill();

		// for (let index = 0; index < 360; index++) {
		// 	this.meanAnomaly_deg = index;
		// 	this.updatePositionVector();
		// 	ctx.beginPath();
		// 	ctx.fillStyle = "teal";
		// 	ctx.arc(
		// 		this.positionVector_inertialFrame.values[0][0] * scale,
		// 		this.positionVector_inertialFrame.values[1][0] * scale,
		// 		1 / currentScale,
		// 		0,
		// 		2 * Math.PI
		// 	);
		// 	ctx.fill();
		// }

		// Draw orbit circle with a gradient to illustrate current position and direction
		let largeSide = ellipseCenterMagnitude + this.semiMajorAxis_km * scale;
		var width = 0.5 / currentScale;
		if (currentScale > 100) {
			width /= (currentScale - 100) / 10;
		}

		ctx.lineWidth = width;

		let colourAngle_deg = this.trueAnomaly_deg + this.longitudeOfAscendingNode_deg + this.argumentOfPeriapsis_deg;
		let colourAngle_rad = degToRad(colourAngle_deg);

		var brightHalf = ctx.createLinearGradient(
			largeSide * Math.cos(colourAngle_rad),
			largeSide * Math.sin(colourAngle_rad),
			-largeSide * Math.cos(colourAngle_rad),
			-largeSide * Math.sin(colourAngle_rad)
		);
		var darkHalf = ctx.createLinearGradient(
			largeSide * Math.cos(colourAngle_rad),
			largeSide * Math.sin(colourAngle_rad),
			-largeSide * Math.cos(colourAngle_rad),
			-largeSide * Math.sin(colourAngle_rad)
		);

		// darkHalf.addColorStop(0, "#222222");
		brightHalf.addColorStop(0, "white");
		brightHalf.addColorStop(1, "DimGray");

		darkHalf.addColorStop(1, "DimGray");
		darkHalf.addColorStop(0, "#202020");

		// First we make a clipping region for the left half
		ctx.save();
		ctx.beginPath();
		ctx.rotate(colourAngle_rad);
		ctx.rect(-largeSide - width, -largeSide - width, (largeSide + width) * 2, largeSide + width * 2);
		reset();
		ctx.clip();

		// Then we draw the left half
		ctx.strokeStyle = darkHalf;
		ctx.beginPath();
		ctx.ellipse(
			-ellipseCenter.x,
			-ellipseCenter.y,
			this.semiMajorAxis_km * scale,
			this.semiMinorAxis_km * scale,
			degToRad(this.longitudeOfAscendingNode_deg + this.argumentOfPeriapsis_deg),
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
		ctx.strokeStyle = brightHalf;
		ctx.beginPath();
		ctx.ellipse(
			-ellipseCenter.x,
			-ellipseCenter.y,
			this.semiMajorAxis_km * scale,
			this.semiMinorAxis_km * scale,
			degToRad(this.longitudeOfAscendingNode_deg + this.argumentOfPeriapsis_deg),
			0 * Math.PI,
			2 * Math.PI
		);
		ctx.stroke();

		ctx.restore(); // restore clipping region to default
	}
	keplersEquation(E_rad: number): number {
		return E_rad - this.eccentricity * Math.sin(E_rad) - degToRad(this.meanAnomaly_deg);
	}
	updatePositionVector() {
		let eccentricAnomaly_rad = newtonRaphson(this.keplersEquation.bind(this), degToRad(this.meanAnomaly_deg), null);
		this.eccentricAnomaly_deg = radToDeg(eccentricAnomaly_rad);
		this.trueAnomaly_rad =
			2 *
			Math.atan2(
				(1 + this.eccentricity) ** 0.5 * Math.sin(eccentricAnomaly_rad / 2),
				(1 - this.eccentricity) ** 0.5 * Math.cos(eccentricAnomaly_rad / 2)
			);
		this.trueAnomaly_deg = radToDeg(this.trueAnomaly_rad);
		let semiLatusRectum = this.semiMajorAxis_km * (1 - this.eccentricity ** 2);
		let r = semiLatusRectum / (1 + this.eccentricity * Math.cos(this.trueAnomaly_rad));

		this.positionVector_perifocalFrame.values = [[r * Math.cos(this.trueAnomaly_rad)], [r * Math.sin(this.trueAnomaly_rad)], [0]];

		let Q = new Matrix(3, 3, [
			[
				Math.cos(this.longitudeOfAscendingNode_rad) * Math.cos(this.argumentOfPeriapsis_rad) -
					Math.cos(this.inclination_rad) * Math.sin(this.longitudeOfAscendingNode_rad) * Math.sin(this.argumentOfPeriapsis_rad),

				-Math.cos(this.longitudeOfAscendingNode_rad) * Math.sin(this.argumentOfPeriapsis_rad) -
					Math.cos(this.inclination_rad) * Math.cos(this.argumentOfPeriapsis_rad) * Math.sin(this.longitudeOfAscendingNode_rad),

				Math.sin(this.longitudeOfAscendingNode_rad) * Math.sin(this.inclination_rad),
			],
			[
				Math.cos(this.argumentOfPeriapsis_rad) * Math.sin(this.longitudeOfAscendingNode_rad) +
					Math.cos(this.longitudeOfAscendingNode_rad) * Math.cos(this.inclination_rad) * Math.sin(this.argumentOfPeriapsis_rad),

				Math.cos(this.longitudeOfAscendingNode_rad) * Math.cos(this.inclination_rad) * Math.cos(this.argumentOfPeriapsis_rad) -
					Math.sin(this.longitudeOfAscendingNode_rad) * Math.sin(this.argumentOfPeriapsis_rad),

				-Math.cos(this.longitudeOfAscendingNode_rad) * Math.sin(this.inclination_rad),
			],
			[
				Math.sin(this.inclination_rad) * Math.sin(this.argumentOfPeriapsis_rad),

				Math.cos(this.argumentOfPeriapsis_rad) * Math.sin(this.inclination_rad),

				Math.cos(this.inclination_rad),
			],
		]);
		this.positionVector_inertialFrame = Q.multiply(this.positionVector_perifocalFrame);

		let angular_momentum = (semiLatusRectum * this.GM_km3_s2_primary) ** 0.5;

		let velocity_matrix = Q.multiply(new Matrix(3, 1, [[-Math.sin(this.trueAnomaly_rad)], [this.eccentricity + Math.cos(this.trueAnomaly_rad)], [0]]));
		this.velocity = new Vector();
		for (let i = 0; i < velocity_matrix.rows; i++) {
			// this.velocity.values[i][0] *= this.GM_km3_s2_primary / angular_momentum;
			this.velocity.addAValue();
			this.velocity[i] = -(velocity_matrix.values[i][0] * this.GM_km3_s2_primary) / angular_momentum;
		}
	}

	updatePosition(t_ms: number) {
		this.argumentOfPeriapsis_rad = degToRad(this.argumentOfPeriapsis_deg);
		this.inclination_rad = degToRad(this.inclination_deg);
		this.longitudeOfAscendingNode_rad = degToRad(this.longitudeOfAscendingNode_deg);

		this.meanAnomaly_rad = (this.meanAnomaly_0_rad + (t_ms / 1000) * (this.GM_km3_s2_primary / this.semiMajorAxis_km ** 3) ** 0.5) % (2 * Math.PI);
		this.meanAnomaly_deg = radToDeg(this.meanAnomaly_rad);

		this.updatePositionVector();
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
