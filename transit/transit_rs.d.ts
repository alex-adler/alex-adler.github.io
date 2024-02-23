/* tslint:disable */
/* eslint-disable */
/**
* @param {number} a
* @param {number} r_x
* @param {number} r_y
* @param {number} r_z
* @param {number} v
* @param {number} t
* @param {number} dt
* @returns {Array<any>}
*/
export function get_acc_orbit(a: number, r_x: number, r_y: number, r_z: number, v: number, t: number, dt: number): Array<any>;
/**
* @param {number} left
* @param {number} right
* @returns {number}
*/
export function add(left: number, right: number): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_acc_orbit: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly add: (a: number, b: number) => number;
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
