import * as body_data from "../space_time/data/celestial_data.js";
import { Orbit } from "./map.ts";
import { DepartureBoard } from "./board.ts";
import { InfiniteCanvas } from "./infinite_canvas.ts";
import init, { get_acc_orbit, add } from "./transit_rs.js";

const AU_km = 1.496e8;

function generate() {
	let table = document.getElementById("output-table") as HTMLTableElement;
	let dropDown = document.getElementById("location-drop-down") as HTMLSelectElement;
	let canvas = document.getElementById("orbital-canvas") as HTMLCanvasElement;

	// var departureBoard = new DepartureBoard(document.getElementById("departure"), 11, 41);
	// var arrivalBoard = new DepartureBoard(document.getElementById("arrival"), 11, 41);

	// for (let i = 0; i < 11; i++) departureBoard.setValueNoSpin(i, "25:17 Earth     Spin AX1938 0" + i.toString(16));
	// for (let i = 0; i < 11; i++) arrivalBoard.setValueNoSpin(i, "02:40 Mars      1/3g PO1342 0" + i.toString(16));

	let orbits: { [name: string]: Orbit } = {};

	for (const key in body_data.space_time) {
		let opt = document.createElement("option");
		let body = body_data.space_time[key];
		opt.value = key;
		opt.innerHTML = body.name;
		dropDown.appendChild(opt);

		orbits[key] = new Orbit(
			body.semiMajorAxis_0_km,
			body.eccentricity_0,
			body.inclination_0_deg,
			body.longitudOfAscendingNode_0_deg,
			body.argumentOfPeriapsis_0_deg,
			body.trueAnomaly_0_deg,
			body.GM_km3_s2,
			body.GM_km3_s2_primary,
			body.radius_km
		);

		// console.log(body.name);
		// orbits[key].updatePosition(3.156e10); // One Terran year
		orbits[key].updatePosition(Date.now() - 946684800000); // ms since J2000
	}

	const infiniteCanvas = new InfiniteCanvas(canvas);
	infiniteCanvas.addDrawFunction(drawSun, checkIfCanvasNeedsUpdating);
	document.addEventListener("contextmenu", (e) => e.preventDefault(), false);

	for (let i in orbits) {
		let o = orbits[i];
		infiniteCanvas.addDrawFunction(o.draw.bind(o), checkIfCanvasNeedsUpdating);
	}

	infiniteCanvas.addDrawFunction(impulseTransfer.bind(this, orbits["Earth"], orbits["Mars"], 1000), checkIfCanvasNeedsUpdating);
	infiniteCanvas.addDrawFunction(accelerationTransfer.bind(this, orbits["Earth"], orbits["Mars"], 1000), checkIfCanvasNeedsUpdating);

	// for (const key in body_data.space_time) {
	// 	if (Object.prototype.hasOwnProperty.call(bodies, key)) {
	// 		const b = bodies[key];
	// 		let row = table.insertRow();
	// 		let name_cell = row.insertCell();
	// 		name_cell.innerText = key;
	// 		row.insertCell().innerText = (b.escape_velocity / 1000).toString();
	// 		row.insertCell().innerText = b.vertical_acceleration.toPrecision(2);
	// 		row.insertCell().innerText = (b.vertical_acceleration / 9.81).toPrecision(2);
	// 		row.insertCell().innerText = b.generate_time_string();
	// 		row.insertCell().innerText = b.acceleration_distance_circ.toPrecision(2);
	// 	}
	// }

	// window.setTimeout(spinDeparture, 5000, departureBoard);
	// window.setTimeout(spinArrival, 10000, arrivalBoard);
}

function impulseTransfer(
	bodyStart: Orbit,
	bodyEnd: Orbit,
	deltaV_km_s: number,
	ctx: CanvasRenderingContext2D,
	canvasUnit: number,
	reset: () => void,
	currentScale: number
): void {
	// TODO: Implement a solution to Lambert's Problem
	init().then(() => {
		// console.log(add(4, 3));
	});
}

function accelerationTransfer(
	bodyStart: Orbit,
	bodyEnd: Orbit,
	deltaV_km_s: number,
	ctx: CanvasRenderingContext2D,
	canvasUnit: number,
	reset: () => void,
	currentScale: number
): void {
	// TODO: Implement a solution to Lambert's Problem
	init().then(() => {
		let iterations = 40;
		let end = get_acc_orbit(
			// 1e-5,
			-2e-5,
			// 0,
			5e-6,
			// 0,
			0,
			bodyStart.positionVector_inertialFrame.values[0][0],
			bodyStart.positionVector_inertialFrame.values[1][0],
			bodyStart.positionVector_inertialFrame.values[2][0],
			bodyStart.velocity[0],
			bodyStart.velocity[1],
			bodyStart.velocity[2],
			1000,
			60,
			iterations
		);

		let scale = canvasUnit / (5 * 1.496e8);

		ctx.strokeStyle = "red";
		ctx.lineWidth = 1 / currentScale;
		ctx.beginPath();
		ctx.moveTo(bodyStart.positionVector_inertialFrame.values[0][0] * scale, bodyStart.positionVector_inertialFrame.values[1][0] * scale);
		for (let i = 0; i < iterations * 10; i++) {
			ctx.lineTo(end[3 * i + 0] * scale, end[3 * i + 1] * scale);
		}
		ctx.stroke();

		console.log("Start: " + bodyStart.positionVector_inertialFrame.values[0][0] + ", " + bodyStart.positionVector_inertialFrame.values[1][0]);

		console.log(bodyStart.velocity);
		console.log(
			"Initial velocity of x:" +
				bodyStart.velocity[0] +
				" km/s, y:" +
				bodyStart.velocity[1] +
				" km/s, z:" +
				bodyStart.velocity[2] +
				" km/s, overall speed of " +
				(bodyStart.velocity[0] ** 2 + bodyStart.velocity[1] ** 2 + bodyStart.velocity[2] ** 2) ** 0.5 +
				" km/s	"
		);
	});
}

function drawSun(context: CanvasRenderingContext2D, displayUnit: number, reset: () => void, currentScale: number): void {
	const radius_km = 696e3;
	let scale = 1 / (5 * AU_km);
	let radius_px = radius_km * displayUnit * scale;
	context.beginPath();
	context.arc(0, 0, radius_px, 0, 2 * Math.PI);
	context.fillStyle = "white";
	context.fill();
}

function drawSquares(context: CanvasRenderingContext2D, displayUnit: number): void {
	context.fillStyle = "#eecc77";
	context.fillRect(0, 0, displayUnit, displayUnit);
	context.fillStyle = "#77ccee";
	context.fillRect(0, 0, -displayUnit, -displayUnit);
}

let initialDraw = false;
function checkIfCanvasNeedsUpdating(): boolean {
	if (initialDraw) return false;
	else {
		initialDraw = true;
		return true;
	}
}

// Each service must occupy 4 characters
const services = ["Spin", "1/3g", " 1g "];
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const hexCharacters = "0123456789ABCDEF";

function spinDeparture(board: DepartureBoard) {
	const changingOdds = 0.3;

	for (let row = 0; row < board._letters.length; row++) {
		// We don't want all of the rows to update at the same time
		if (Math.random() > changingOdds) continue;

		// Time
		let stringOut;
		let hour = Math.floor(Math.random() * 24);
		let minute = Math.floor(Math.random() * 60);

		stringOut = hour > 9 ? String(hour) : "0" + hour;
		stringOut += ":";
		stringOut += minute > 9 ? String(minute) : "0" + minute;
		stringOut += " ";

		let randomBody = function (object: typeof body_data.space_time) {
			var keys = Object.keys(object);
			return object[keys[Math.floor(keys.length * Math.random())]];
		};
		let randomBodyName = randomBody(body_data.space_time).name;
		stringOut += randomBodyName;
		for (let i = randomBodyName.length; i < 10; i++) {
			stringOut += " ";
		}

		stringOut += services[Math.floor(Math.random() * services.length)];
		stringOut += " ";

		// Flight Number
		for (let i = 0; i < 2; i++) stringOut += characters[Math.floor(Math.random() * characters.length)];
		for (let i = 0; i < 4; i++) stringOut += hexCharacters[Math.floor(Math.random() * hexCharacters.length)];
		stringOut += " ";

		// Gate
		for (let i = 0; i < 2; i++) stringOut += hexCharacters[Math.floor(Math.random() * hexCharacters.length)];
		stringOut += " ";

		const remarks = ["", "Boarding", "Final Call", "Delayed", "Cancelled", "Departing"];
		stringOut += remarks[Math.floor(Math.random() * remarks.length)];

		board.setValue(row, stringOut);
	}

	window.setTimeout(spinDeparture, 10000, board);
}

function spinArrival(board: DepartureBoard) {
	const changingOdds = 0.3;

	for (let row = 0; row < board._letters.length; row++) {
		// We don't want all of the rows to update at the same time
		if (Math.random() > changingOdds) continue;

		// Time
		let stringOut;
		let hour = Math.floor(Math.random() * 24);
		let minute = Math.floor(Math.random() * 60);

		stringOut = hour > 9 ? String(hour) : "0" + hour;
		stringOut += ":";
		stringOut += minute > 9 ? String(minute) : "0" + minute;
		stringOut += " ";

		let randomBody = function (object: typeof body_data.space_time) {
			var keys = Object.keys(object);
			return object[keys[Math.floor(keys.length * Math.random())]];
		};
		let randomBodyName = randomBody(body_data.space_time).name;
		stringOut += randomBodyName;
		for (let i = randomBodyName.length; i < 10; i++) {
			stringOut += " ";
		}

		stringOut += services[Math.floor(Math.random() * services.length)];
		stringOut += " ";

		// Flight Number
		for (let i = 0; i < 2; i++) stringOut += characters[Math.floor(Math.random() * characters.length)];
		for (let i = 0; i < 4; i++) stringOut += hexCharacters[Math.floor(Math.random() * hexCharacters.length)];
		stringOut += " ";

		// Gate
		for (let i = 0; i < 2; i++) stringOut += hexCharacters[Math.floor(Math.random() * hexCharacters.length)];
		stringOut += " ";

		const remarks = ["", "Docking", "Delayed", "Docked"];
		stringOut += remarks[Math.floor(Math.random() * remarks.length)];

		board.setValue(row, stringOut);
	}

	// board.setValue(0, "14:58 Ganymede  Spin WA0002 08");
	// board.setValue(1, "10:03 Luna      1g   LA7290 00 Delayed");

	window.setTimeout(spinArrival, 10000, board);
}

// function buildDepartureBoard() {
// 	var board = new DepartureBoard(document.getElementById("departure"), 11, 41);
// 	spin(board);
// }

window.onload = function () {
	// buildDepartureBoard();
	generate();
};
