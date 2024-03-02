/* tslint:disable */
/* eslint-disable */
/**
* @param {number} acceleration
* @param {Float64Array} mercury_data
* @param {Float64Array} venus_data
* @param {Float64Array} earth_data
* @param {Float64Array} mars_data
* @param {Float64Array} jupiter_data
* @param {Float64Array} saturn_data
* @param {Float64Array} uranus_data
* @param {Float64Array} neptune_data
* @param {number} current_time_s
* @param {number} start_body_index
* @param {number} end_body_index
* @param {number} dt
* @param {number} rk4_iterations
* @returns {Array<any>}
*/
export function get_acc_orbit(acceleration: number, mercury_data: Float64Array, venus_data: Float64Array, earth_data: Float64Array, mars_data: Float64Array, jupiter_data: Float64Array, saturn_data: Float64Array, uranus_data: Float64Array, neptune_data: Float64Array, current_time_s: number, start_body_index: number, end_body_index: number, dt: number, rk4_iterations: number): Array<any>;
/**
* @param {Float64Array} a
* @returns {number}
*/
export function add(a: Float64Array): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_acc_orbit: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number) => number;
  readonly add: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
