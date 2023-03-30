let message = "hi";

class CelestialBody {
	radius: number;
	escape_velocity: number;
	vertical_acceleration: number;
	gravity: number;
	constructor(radius: number, escape_velocity: number, gravity: number) {
		this.radius = radius;
		this.escape_velocity = escape_velocity;
		this.gravity = gravity;
		this.vertical_acceleration = this.gravity - this.escape_velocity ** 2 / this.radius;
	}
}

let bodies: { [name: string]: CelestialBody } = {};

bodies["Earth"] = new CelestialBody(6378 * 1000, 11.2 * 1000, 9.81);
bodies["Luna"] = new CelestialBody(1737.4 * 1000, 2.42 * 1000, 1.62);
bodies["Mars"] = new CelestialBody(3396.2 * 1000, 5.03 * 1000, 3.72);
bodies["Ceres"] = new CelestialBody(469.7 * 1000, 0.51 * 1000, 0.28);
bodies["Europa"] = new CelestialBody(1560.8 * 1000, 2.025 * 1000, 1.314);
bodies["Ganymede"] = new CelestialBody(2634.1 * 1000, 2.741 * 1000, 1.428);

function generate() {
	let table = document.getElementById("output-table") as HTMLTableElement;

	for (const key in bodies) {
		if (Object.prototype.hasOwnProperty.call(bodies, key)) {
			const b = bodies[key];
			let row = table.insertRow();
			let name_cell = row.insertCell();
			name_cell.innerText = key;
			row.insertCell().innerText = (b.escape_velocity / 1000).toString();
			row.insertCell().innerText = b.vertical_acceleration.toPrecision(2);
			row.insertCell().innerText = (b.vertical_acceleration / 9.81).toPrecision(2);
		}
	}
}