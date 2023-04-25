import * as body_data from "../space_time/data/celestial_data.js";
const AU_km = 1.496e8;
class Orbit {
    constructor(a_km, e, i_deg, longitudeOfAscendingNode_deg, argumentOfPeriapsis_deg, trueAnomaly_deg, scale) {
        this.semiMajorAxis_km = a_km;
        this.eccentricity = e;
        this.inclination_deg = i_deg;
        this.longitudOfAscendingNode_deg = longitudeOfAscendingNode_deg;
        this.argumentOfPeriapsis_deg = argumentOfPeriapsis_deg;
        this.trueAnomaly_deg = trueAnomaly_deg;
        this.semiMinorAxis_km = a_km * (1 - this.eccentricity);
        this.scale = scale;
    }
    draw(canvas, ctx) {
        if (this.semiMajorAxis_km == undefined)
            return;
        ctx.beginPath();
        ctx.ellipse(0.5 * canvas.width +
            Math.cos(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * this.scale, 0.5 * canvas.height +
            Math.sin(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * this.scale, this.semiMajorAxis_km * this.scale, this.semiMinorAxis_km * this.scale, degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg), 0, 2 * Math.PI);
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
}
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}
function generateCanvas(canvas, orbits) {
    if (!canvas.getContext)
        return;
    let ctx = canvas.getContext("2d");
    // Deal with devices with a pixel ratio != 1
    const pixelRatio = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    orbits.forEach((o) => {
        o.draw(canvas, ctx);
    });
}
function generate() {
    let table = document.getElementById("output-table");
    let dropDown = document.getElementById("location-drop-down");
    let canvas = document.getElementById("orbital-canvas");
    let orbits = [];
    for (const key in body_data.space_time) {
        let opt = document.createElement("option");
        let body = body_data.space_time[key];
        opt.value = key;
        opt.innerHTML = body.name;
        dropDown.appendChild(opt);
        orbits.push(new Orbit(body.semiMajorAxis_0_km, body.eccentricity_0, body.inclination_0_deg, body.longitudOfAscendingNode_0_deg, body.argumentOfPeriapsis_0_deg, body.trueAnomaly_0_deg, canvas.clientWidth / (5 * AU_km)));
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
window.onload = function () {
    generate();
};
