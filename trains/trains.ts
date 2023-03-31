let message = "hi";

class CelestialBody {
	radius: number;
	circumference: number;
	escape_velocity: number;
	acceleration_ms: number
	vertical_acceleration: number;
	acceleration_time_s: number;
	acceleration_distance_m: number;
	acceleration_distance_circ: number;
	gravity: number;
	constructor(radius: number, escape_velocity: number, gravity: number, acceleration_g: number) {
		this.radius = radius;
		this.circumference = 2 * Math.PI * radius;
		this.escape_velocity = escape_velocity;
		this.gravity = gravity;
		this.acceleration_ms = acceleration_g * 9.81;
		this.vertical_acceleration = this.gravity - this.escape_velocity ** 2 / this.radius;
		this.acceleration_time_s = this.escape_velocity / this.acceleration_ms;
		this.acceleration_distance_m = 0.5 * this.acceleration_ms * this.acceleration_time_s ** 2;
		this.acceleration_distance_circ = this.acceleration_distance_m / this.circumference;
	}
	generate_time_string(): string {
		let secs = this.acceleration_time_s;
		let hours = Math.floor(secs / 3600);
		secs -= hours * 3600;
		let minutes = Math.floor(secs / 60);
		secs -= minutes * 60;



		let time_string = this.add_leading_zero(hours) + ":" + this.add_leading_zero(minutes) + ":" + this.add_leading_zero(secs);
		return time_string;
	}
	add_leading_zero(num_in: number): string {
		num_in = Math.round(num_in);
		if (num_in < 10) {
			return "0" + num_in.toString();
		} else {
			return num_in.toString();
		}
	}
}

let bodies: { [name: string]: CelestialBody } = {};

bodies["Earth"] = new CelestialBody(6378 * 1000, 11.2 * 1000, 9.81, 1);
bodies["Luna"] = new CelestialBody(1737.4 * 1000, 2.42 * 1000, 1.62, 1);
bodies["Mars"] = new CelestialBody(3396.2 * 1000, 5.03 * 1000, 3.72, 1);
bodies["Ceres"] = new CelestialBody(469.7 * 1000, 0.51 * 1000, 0.28, 1);
bodies["Europa"] = new CelestialBody(1560.8 * 1000, 2.025 * 1000, 1.314, 1);
bodies["Ganymede"] = new CelestialBody(2634.1 * 1000, 2.741 * 1000, 1.428, 1);

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
			row.insertCell().innerText = b.generate_time_string();
			row.insertCell().innerText = b.acceleration_distance_circ.toPrecision(2);
		}
	}
}