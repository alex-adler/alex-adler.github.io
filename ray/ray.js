import init from "./ray_rs.js";
function main() {
    init().then(() => console.log("WASM Loaded"));
}
window.onload = function () {
    // console.log("Setting up canvas");
    // // Deal with devices with a pixel ratio != 1
    // const pixelRatio = window.devicePixelRatio;
    // let canvas = <HTMLCanvasElement>document.getElementById("wgpu-canvas");
    // canvas.width = canvas.clientWidth * pixelRatio;
    // canvas.height = canvas.clientHeight * pixelRatio;
    console.log("Loading wasm");
    main();
};
