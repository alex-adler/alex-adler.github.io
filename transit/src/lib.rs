use js_sys::Array;
use std::ops::{Add, Mul, Sub};

use nalgebra::{SVector, Vector3};
use wasm_bindgen::prelude::*;
// type M = SMatrix<f64, 3, 3>;
type V = SVector<f64, 3>;

fn acceleration(a: V, μ: f64, r: V) -> V {
    a - μ * r / r.magnitude().powi(3)
}

#[derive(Copy, Clone)]
struct State {
    x: V,
    x_dot: V,
}

impl<T> Mul<T> for State
where
    f64: From<T>,
    T: Copy,
{
    type Output = State;
    fn mul(mut self, rhs: T) -> Self::Output {
        self.x = self.x * f64::from(rhs);
        self.x_dot = self.x_dot * f64::from(rhs);
        self
    }
}

impl Add<State> for State {
    type Output = State;
    fn add(mut self, rhs: State) -> Self::Output {
        self.x = self.x + rhs.x;
        self.x_dot = self.x_dot + rhs.x_dot;
        self
    }
}
impl Sub<State> for State {
    type Output = State;
    fn sub(mut self, rhs: State) -> Self::Output {
        self.x = self.x - rhs.x;
        self.x_dot = self.x_dot - rhs.x_dot;
        self
    }
}

struct ConstAccOrbit {
    a: V,
    μ: f64,
    x_0: State,
    iterations: u32,
    dt: f64,
}

impl ConstAccOrbit {
    fn differentiate(&self, x_in: State) -> State {
        State {
            x: x_in.x_dot,
            x_dot: acceleration(self.a, self.μ, x_in.x),
        }
    }

    #[rustfmt::skip]
    fn dormand_prince(&self, s: State) -> State {
        let k1 = self.differentiate(s) * self.dt;
        let k2 = self.differentiate(s + k1 * (1.0 / 5.0)) * self.dt;
        let k3 = self.differentiate(s + k1 * (3.0 / 40.0) + k2 * ( 9.0 / 40.0)) * self.dt;
        let k4 = self.differentiate(s + k1 * (44.0 / 45.0) - k2 * ( 56.0 / 15.0) + k3 * (32.0 / 9.0)) * self.dt;
        let k5 = self.differentiate(s + k1 * (19372.0 / 6561.0) - k2 * ( 25360.0 / 2187.0) + k3 * (64448.0 / 6561.0) - k4 * (212.0 / 729.0)) * self.dt;
        let k6 = self.differentiate(s + k1 * (9017.0 / 3168.0) - k2 * ( 355.0 / 33.0) + k3 * (46732.0 / 5247.0) + k4 * (49.0 / 176.0) - k5 * (5103.0 / 18656.0)) * self.dt;
        //T k7=dT*differentiate(s+35.0/384*k1+500.0/1113*k3+125.0/192*k4-2187.0/6784*k5+11.0/84*k6);
        s + (k1 * (35.0 / 384.0) + k3 * (500.0 / 1113.0) + k4 * (125.0 / 192.0) - k5 * (2187.0 / 6784.0) + k6 * (11.0 / 84.0))
    }

    fn propagate(&self) -> State {
        let mut x_i = self.x_0;
        for _ in 0..self.iterations {
            x_i = self.dormand_prince(x_i);
        }
        x_i
    }
}

#[wasm_bindgen]
pub fn get_acc_orbit(
    a_x: f64,
    a_y: f64,
    a_z: f64,
    r_x: f64,
    r_y: f64,
    r_z: f64,
    v_x: f64,
    v_y: f64,
    v_z: f64,
    dt: f64,
    rk4_iterations: u32,
    macro_iterations: u32,
) -> Array {
    let ret = Array::new_with_length(3 * macro_iterations);
    let mut result = State {
        x: Vector3::new(r_x, r_y, r_z),
        x_dot: Vector3::new(v_x, v_y, v_z),
    };
    for i in 0..macro_iterations {
        let orbit = ConstAccOrbit {
            a: Vector3::new(a_x, a_y, a_z),
            μ: 1.32712440018e11,
            x_0: result,
            iterations: rk4_iterations,
            dt,
        };
        result = orbit.propagate();
        ret.set(3 * i + 0, JsValue::from_f64(result.x.x));
        ret.set(3 * i + 1, JsValue::from_f64(result.x.y));
        ret.set(3 * i + 2, JsValue::from_f64(result.x.z));
    }
    for i in macro_iterations..macro_iterations * 2 {
        let orbit = ConstAccOrbit {
            a: Vector3::new(-a_x, -a_y, -a_z),
            μ: 1.32712440018e11,
            x_0: result,
            iterations: rk4_iterations,
            dt,
        };
        result = orbit.propagate();
        ret.set(3 * i + 0, JsValue::from_f64(result.x.x));
        ret.set(3 * i + 1, JsValue::from_f64(result.x.y));
        ret.set(3 * i + 2, JsValue::from_f64(result.x.z));
    }
    for i in macro_iterations * 2..macro_iterations * 10 {
        let orbit = ConstAccOrbit {
            a: Vector3::new(0.0, 0.0, 0.0),
            μ: 1.32712440018e11,
            x_0: result,
            iterations: rk4_iterations,
            dt,
        };
        result = orbit.propagate();
        ret.set(3 * i + 0, JsValue::from_f64(result.x.x));
        ret.set(3 * i + 1, JsValue::from_f64(result.x.y));
        ret.set(3 * i + 2, JsValue::from_f64(result.x.z));
    }

    ret
}

#[wasm_bindgen]
pub fn add(left: usize, right: usize) -> usize {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
