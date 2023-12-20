import * as body_data from "../space_time/data/celestial_data.js";
import { Orbit } from "./map.ts";

const AU_km = 1.496e8;

function generate() {
	let table = document.getElementById("output-table") as HTMLTableElement;
	let dropDown = document.getElementById("location-drop-down") as HTMLSelectElement;
	let canvas = document.getElementById("orbital-canvas") as HTMLCanvasElement;

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
}

function generateCanvas(canvas: HTMLCanvasElement, orbits: Orbit[]) {
	if (!canvas.getContext) return;

	let ctx = canvas.getContext("2d");

	// Deal with devices with a pixel ratio != 1
	const pixelRatio = window.devicePixelRatio;
	canvas.width = canvas.clientWidth * pixelRatio;
	canvas.height = canvas.clientHeight * pixelRatio;

	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.arc(canvas.width / 2, canvas.height / 2, 1, 0, 2 * Math.PI);
	ctx.fill(this);

	orbits.forEach((o) => {
		o.draw(canvas, ctx);
	});
}

window.onload = function () {
	generate();
};
