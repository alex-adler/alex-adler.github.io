import * as body_data from "../space_time/data/celestial_data.js";
import { Orbit } from "./map.ts";
import { DepartureBoard } from "./board.ts";
import { InfiniteCanvas } from "./infinite_canvas.ts";
import init, { get_acc_orbit, add } from "./transit_rs.js";

const AU_km = 1.496e8;
const consideredBodies = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

let initialDraw = false;

function generate() {
	let table = document.getElementById("output-table") as HTMLTableElement;
	let dropDown = document.getElementById("location-drop-down") as HTMLSelectElement;
	let canvas = document.getElementById("orbital-canvas") as HTMLCanvasElement;

	// var departureBoard = new DepartureBoard(document.getElementById("departure"), 11, 41);
	// var arrivalBoard = new DepartureBoard(document.getElementById("arrival"), 11, 41);

	// for (let i = 0; i < 11; i++) departureBoard.setValueNoSpin(i, "25:17 Earth     Spin AX1938 0" + i.toString(16));
	// for (let i = 0; i < 11; i++) arrivalBoard.setValueNoSpin(i, "02:40 Mars      1/3g PO1342 0" + i.toString(16));

	let orbits: { [name: string]: Orbit } = {};
	let rust_array: Float64Array[] = [];

	for (const key in body_data.space_time) {
		let opt = document.createElement("option");
		let body = body_data.space_time[key];
		opt.value = key;
		opt.innerHTML = body.name;
		dropDown.appendChild(opt);

		if (body.name === "Earth") {
			dropDown.value = key;
		}

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
		// orbits[key].updatePosition(0); // ms since J2000
	}

	const infiniteCanvas = new InfiniteCanvas(canvas);
	infiniteCanvas.addDrawFunction(drawSun, checkIfCanvasNeedsUpdating);
	document.addEventListener("contextmenu", (e) => e.preventDefault(), false);

	for (let i in orbits) {
		let o = orbits[i];
		infiniteCanvas.addDrawFunction(o.draw.bind(o), checkIfCanvasNeedsUpdating);
	}

	consideredBodies.forEach((b) => {
		let elements = new Float64Array(7);
		elements[0] = body_data.space_time[b].semiMajorAxis_0_km;
		elements[1] = body_data.space_time[b].eccentricity_0;
		elements[2] = (body_data.space_time[b].inclination_0_deg * Math.PI) / 180;
		elements[3] = (body_data.space_time[b].argumentOfPeriapsis_0_deg * Math.PI) / 180;
		elements[4] = (body_data.space_time[b].longitudOfAscendingNode_0_deg * Math.PI) / 180;
		elements[5] = (body_data.space_time[b].trueAnomaly_0_deg * Math.PI) / 180;
		elements[6] = body_data.space_time[b].GM_km3_s2;
		rust_array.push(elements);
	});

	infiniteCanvas.addDrawFunction(impulseTransfer.bind(this, orbits["Mercury"], orbits["Mars"], 1000), checkIfCanvasNeedsUpdating);

	const a = 3.3e-3;

	console.log("Performing transfer at " + ((a * 1000) / 9.81).toFixed(2) + "g");

	consideredBodies.forEach((b) => {
		if (b === "Earth") return;
		init().then(() => {
			let dt = 10;
			let rk4_iterations = 10;
			let trajectory = get_acc_orbit(
				a,
				rust_array[0],
				rust_array[1],
				rust_array[2],
				rust_array[3],
				rust_array[4],
				rust_array[5],
				rust_array[6],
				rust_array[7],
				(Date.now() - 946684800000) / 1000,
				consideredBodies.indexOf("Earth"),
				consideredBodies.indexOf(b),
				dt,
				rk4_iterations
			);
			let transferDuration = trajectory.length * dt * rk4_iterations;
			console.log(
				"Transfer between " +
					"Earth" +
					" and " +
					b +
					" took " +
					(transferDuration / 86400).toFixed(2) +
					" days and cost " +
					a * transferDuration +
					" km/s ΔV"
			);
			infiniteCanvas.addDrawFunction(accelerationTransfer.bind(this, trajectory), checkIfCanvasNeedsUpdating);
			initialDraw = false;
		});
	});

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
		let a = new Float64Array(10);
		for (let index = 0; index < a.length; index++) {
			a[index] = index;
		}
		// console.log(add(a));
	});
}

function accelerationTransfer(trajectory: number[], ctx: CanvasRenderingContext2D, canvasUnit: number, reset: () => void, currentScale: number): void {
	let scale = canvasUnit / (5 * 1.496e8); // divided by 5 AU
	ctx.strokeStyle = "Yellow";
	ctx.lineWidth = 1 / currentScale;
	ctx.beginPath();
	ctx.moveTo(trajectory[0] * scale, trajectory[1] * scale);
	for (let i = 1; i < trajectory.length / 3; i++) {
		ctx.lineTo(trajectory[3 * i + 0] * scale, trajectory[3 * i + 1] * scale);
	}
	ctx.stroke();
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
