import init from "./ray_rs.js";

function main() {
	init().then(() => console.log("WASM Loaded"));
}

window.onload = function () {
	if(!navigator.gpu){
		console.log("WebGPU is not supported on your browser. Please enable it or check http://webgpu.io");
		let div = document.getElementById("webgpu-missing") as HTMLDivElement;
		div.style.display = "block";
		return;
	}
	
	console.log("Loading wasm");
	main();
};
