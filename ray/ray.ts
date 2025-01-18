import init from "./ray_rs.js";

function main() {
	init().then(() => console.log("WASM Loaded"));
}

window.onload = function () {
	if (!navigator.gpu) {
		console.log("WebGPU is not supported on your browser. Please enable it or check http://webgpu.io");
		// Display warning and hide the FPS counter
		(document.getElementById("webgpu-missing") as HTMLDivElement).style.display = "block";
		(document.getElementById("fps") as HTMLDivElement).style.display = "none";
		return;
	}
	main();
};

export function update_fps(new_fps: Number) {
	let text = document.getElementById("fps") as HTMLHeadingElement;
	text.innerHTML = new_fps.toFixed(4) + " FPS"
}