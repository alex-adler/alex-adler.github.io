import init from "./gpu_rs.js";
function main() {
    init().then(() => console.log("WASM Loaded"));
}
window.onload = function () {
    console.log("Loading wasm");
    main();
};
