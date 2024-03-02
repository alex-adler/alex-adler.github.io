use js_sys::Array;
use std::ops::{Add, Mul, Sub};

use wasm_bindgen::prelude::*;

mod body;
use body::{Body, V};

extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

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
    acceleration: f64,
    mercury_data: &[f64],
    venus_data: &[f64],
    earth_data: &[f64],
    mars_data: &[f64],
    jupiter_data: &[f64],
    saturn_data: &[f64],
    uranus_data: &[f64],
    neptune_data: &[f64],
    current_time_s: u32,
    start_body_index: usize,
    end_body_index: usize,
    dt: u32,
    rk4_iterations: u32,
) -> Array {
    let mut bodies: [Body; 8] = [Body::new(); 8];
    bodies[0].populate(mercury_data);
    bodies[1].populate(venus_data);
    bodies[2].populate(earth_data);
    bodies[3].populate(mars_data);
    bodies[4].populate(jupiter_data);
    bodies[5].populate(saturn_data);
    bodies[6].populate(uranus_data);
    bodies[7].populate(neptune_data);

    // Update all of the planetary positions and velocities to the current time
    bodies.iter_mut().for_each(|b| b.propagate(current_time_s));

    let mut trajectory: Vec<f64> = Vec::new();
    trajectory.reserve(1000);
    let mut result = State {
        x: bodies[start_body_index].x,
        x_dot: bodies[start_body_index].v,
    };

    let max_loops = 1000;
    let mut final_step: u32 = 0;

    // Acceleration phase
    for i in 0..max_loops {
        let a: V;
        if (bodies[end_body_index].x - result.x).norm() == 0.0 {
            a = V::zeros();
        } else {
            a = (bodies[end_body_index].x - result.x).normalize() * acceleration;
        }
        let orbit = ConstAccOrbit {
            // Acceleration direction is vector to the location of the end body
            a,
            μ: 1.32712440018e11,
            x_0: result,
            iterations: rk4_iterations,
            dt: dt as f64,
        };
        result = orbit.propagate();
        trajectory.push(result.x.x);
        trajectory.push(result.x.y);
        trajectory.push(result.x.z);
        bodies.iter_mut().for_each(|b| b.propagate(dt));
        final_step = i;
        // Check if we are halfway and should perform the flip
        if (bodies[end_body_index].x - result.x).norm_squared()
            < (bodies[start_body_index].x - result.x).norm_squared()
        {
            break;
        }
    }

    if final_step == max_loops {
        log!(
            "Failed to find halfway point between bodies {} and {}",
            start_body_index,
            end_body_index
        );
    }

    // Deceleration phase
    for i in final_step..(final_step + max_loops) {
        let a;
        // Deal with if the velocities are very close (or identical) by assuming we match speeds
        if (bodies[end_body_index].v - result.x_dot).norm() < 1.0 {
            result.x_dot = bodies[end_body_index].v;
            break;
        }

        a = (bodies[end_body_index].v - result.x_dot).normalize() * acceleration;

        let orbit = ConstAccOrbit {
            // Acceleration is the vector required to align velocity vectors
            a,
            μ: 1.32712440018e11,
            x_0: result,
            iterations: rk4_iterations,
            dt: dt as f64,
        };
        result = orbit.propagate();
        // bodies.iter_mut().for_each(|b| b.propagate(dt));
        trajectory.push(result.x.x);
        trajectory.push(result.x.y);
        trajectory.push(result.x.z);
        final_step = i;
    }

    if final_step == max_loops {
        log!("Failed to match velocity with body {}", end_body_index);
    }

    let duration: u32 = final_step * dt * rk4_iterations;
    log!(
        "Transit took {:.2} days and cost {:.2} km/s ΔV",
        duration as f64 / 86400.0,
        acceleration * duration as f64
    );

    // Final orbit
    // for _ in final_step..(final_step + max_loops) {
    //     let orbit = ConstAccOrbit {
    //         // Acceleration is 0 once we've matched speeds
    //         a: V::zeros(),
    //         μ: 1.32712440018e11,
    //         x_0: result,
    //         iterations: rk4_iterations,
    //         dt: dt as f64,
    //     };
    //     result = orbit.propagate();
    //     trajectory.push(result.x.x);
    //     trajectory.push(result.x.y);
    //     trajectory.push(result.x.z);
    // }

    trajectory.into_iter().map(JsValue::from_f64).collect()
}

#[wasm_bindgen]
pub fn add(a: &[f64]) -> f64 {
    let mut sum = 0.0;
    for i in 0..a.len() {
        sum += a[i];
    }
    sum
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn it_works() {
//         let result = add(2, 2);
//         assert_eq!(result, 4);
//     }
// }
