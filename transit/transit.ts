import * as body_data from "../space_time/data/celestial_data.js";
import { Orbit } from "./map.ts";
import { DepartureBoard } from "./board.ts";
import { InfiniteCanvas } from "./infinite_canvas.ts";

const AU_km = 1.496e8;

function generate() {
	let table = document.getElementById("output-table") as HTMLTableElement;
	let dropDown = document.getElementById("location-drop-down") as HTMLSelectElement;
	let canvas = document.getElementById("orbital-canvas") as HTMLCanvasElement;

	var departureBoard = new DepartureBoard(document.getElementById("departure"), 11, 41);
	var arrivalBoard = new DepartureBoard(document.getElementById("arrival"), 11, 41);

	for (let i = 0; i < 11; i++) departureBoard.setValueNoSpin(i, "25:17 Earth     Spin AX1938 0" + i.toString(16));
	for (let i = 0; i < 11; i++) arrivalBoard.setValueNoSpin(i, "02:40 Mars      1/3g PO1342 0" + i.toString(16));

	let orbits: Orbit[] = [];

	for (const key in body_data.space_time) {
		let opt = document.createElement("option");
		let body = body_data.space_time[key];
		opt.value = key;
		opt.innerHTML = body.name;
		dropDown.appendChild(opt);

		orbits.push(
			new Orbit(
				body.semiMajorAxis_0_km,
				body.eccentricity_0,
				body.inclination_0_deg,
				body.longitudOfAscendingNode_0_deg,
				body.argumentOfPeriapsis_0_deg,
				body.trueAnomaly_0_deg,
				body.GM_km3_s2,
				canvas.clientWidth / (5 * AU_km)
			)
		);

		console.log(body.name);
		console.log(orbits.at(-1));
		orbits.at(-1).updatePosition(0);
		orbits.at(-1).updatePosition(Date.now() - 946684800000);
	}

	generateCanvas(canvas, orbits);
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

	window.setTimeout(spinDeparture, 5000, departureBoard);
	window.setTimeout(spinArrival, 10000, arrivalBoard);
}

function drawCircle(context: CanvasRenderingContext2D, displayUnit: number): void {
	context.beginPath();
	context.ellipse(0, 0, displayUnit, displayUnit, 0, 0, 2 * Math.PI);
	context.strokeStyle = "white";
	context.stroke();
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

function generateCanvas(canvas: HTMLCanvasElement, orbits: Orbit[]) {
	if (!canvas.getContext) return;

	const infiniteCanvas = new InfiniteCanvas(canvas, canvas.getContext("2d"));
	infiniteCanvas.addDrawFunction(drawSquares, checkIfCanvasNeedsUpdating);
	infiniteCanvas.addDrawFunction(drawCircle, checkIfCanvasNeedsUpdating);
	document.addEventListener("contextmenu", (e) => e.preventDefault(), false);

	// let ctx = canvas.getContext("2d");

	// // Deal with devices with a pixel ratio != 1
	// const pixelRatio = window.devicePixelRatio;
	// canvas.width = canvas.clientWidth * pixelRatio;
	// canvas.height = canvas.clientHeight * pixelRatio;

	// ctx.beginPath();
	// ctx.fillStyle = "white";
	// ctx.arc(canvas.width / 2, canvas.height / 2, 1, 0, 2 * Math.PI);
	// ctx.fill(this);

	// orbits.forEach((o) => {
	// 	o.draw(canvas, ctx);
	// });
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
