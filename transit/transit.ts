import * as body_data from "../space_time/data/celestial_data.js";

function generate() {
	let table = document.getElementById("output-table") as HTMLTableElement;
	let dropDown = document.getElementById("location-drop-down") as HTMLSelectElement;

	for (const key in body_data.space_time) {
		let opt = document.createElement("option");
		opt.value = key;
		opt.innerHTML = body_data.space_time[key].name;
		dropDown.appendChild(opt);
	}
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

window.onload = function () {
	generate();
};
