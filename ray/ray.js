import init from "./ray_rs.js";
function main() {
    init().then(() => console.log("WASM Loaded"));
    update_fps(0);
}
window.onload = function () {
    if (!navigator.gpu) {
        console.log("WebGPU is not supported on your browser. Please enable it or check http://webgpu.io");
        // Display warning and hide the FPS counter
        document.getElementById("webgpu-missing").style.display = "block";
        document.getElementById("fps").style.display = "none";
        return;
    }
    console.log("Loading wasm");
    main();
};
export function update_fps(new_fps) {
    let text = document.getElementById("fps");
    text.innerHTML = new_fps + " FPS";
}
