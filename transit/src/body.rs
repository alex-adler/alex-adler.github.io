use nalgebra::{SMatrix, SVector};
use nrfind::find_root;
use std::f64::consts::PI;
pub type Matrix = SMatrix<f64, 3, 3>;
pub type V = SVector<f64, 3>;

extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
#[allow(unused)]
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[allow(non_upper_case_globals)]
const μ_primary: f64 = 1.32712440018e11;

#[allow(non_snake_case)]
fn keplers_equation_root(E: f64, e: f64, M: f64) -> f64 {
    E - e * E.sin() - M
}
#[allow(non_snake_case)]
fn keplers_equation_root_diff(E: f64, e: f64) -> f64 {
    1.0 - e * E.cos()
}

#[derive(Clone, Copy, Debug)]
#[allow(non_snake_case)]
pub struct Body {
    a: f64,     // Semi major axis  (km)
    e: f64,     // Eccentricity
    i: f64,     // Inclination  (rad)
    ω: f64,     // Argument of periapsis    (rad)
    Ω: f64,     // Right Ascension of Ascending Node    (rad)
    pub θ: f64, // True anomaly (rad)
    μ: f64,     // Gravitational Parameter  (km^3 s^-2)
    pub x: V,   // Position   (km)
    pub v: V,   // Velocity	(km/s)
    Q: Matrix,  // Conversion matrix from keplerian elements to cartesian
    E: f64,
    M: f64,
}

impl Body {
    pub fn new() -> Body {
        Body {
            a: 0.0,
            e: 0.0,
            i: 0.0,
            ω: 0.0,
            Ω: 0.0,
            θ: 0.0,
            μ: 0.0,
            x: V::zeros(),
            v: V::zeros(),
            Q: Matrix::identity(),
            E: 0.0,
            M: 0.0,
        }
    }

    pub fn populate(&mut self, values_in: &[f64]) {
        self.a = values_in[0];
        self.e = values_in[1];
        self.i = values_in[2];
        self.ω = values_in[3];
        self.Ω = values_in[4];
        self.θ = values_in[5];
        self.μ = values_in[6];

        self.Q = Matrix::new(
            // Row 0
            self.Ω.cos() * self.ω.cos() - self.i.cos() * self.Ω.sin() * self.ω.sin(),
            -self.Ω.cos() * self.ω.sin() - self.i.cos() * self.Ω.sin() * self.ω.cos(),
            self.Ω.sin() * self.i.sin(),
            // Row 1
            self.ω.cos() * self.Ω.sin() + self.Ω.cos() * self.i.cos() * self.ω.sin(),
            self.Ω.cos() * self.i.cos() * self.ω.cos() - self.Ω.sin() * self.ω.sin(),
            -self.Ω.cos() * self.i.sin(),
            // Row 2
            self.i.sin() * self.ω.sin(),
            self.ω.cos() * self.i.sin(),
            self.i.cos(),
        );

        // Calculate eccentric anomaly
        // self.E = ((self.e + self.θ.cos()) / (1.0 + self.e * self.θ.cos())).acos();
        self.E = 2.0
            * ((1.0 - self.e).sqrt() * (self.θ / 2.0).sin())
                .atan2((1.0 + self.e).sqrt() * (self.θ / 2.0).cos());

        // Calculate mean anomaly
        self.M = self.E - self.e * self.E.sin();
    }

    pub fn propagate(&mut self, time_s: u32) {
        // Add change to mean anomaly due to passed time
        self.M += time_s as f64 * (μ_primary / self.a.powi(3)).sqrt();
        self.M %= 2.0 * PI;

        // Calculate new eccentric anomaly by using netwton's method on Kepler's equation
        let f = |x| keplers_equation_root(x, self.e, self.M);
        let fd = |x| keplers_equation_root_diff(x, self.e);

        self.E = find_root(&f, &fd, self.M, 1e-7, 100).unwrap();
        self.E %= 2.0 * PI;

        // Convert back to true anomaly
        self.θ = 2.0
            * ((1.0 + self.e).sqrt() * (self.E / 2.0).sin())
                .atan2((1.0 - self.e).sqrt() * (self.E / 2.0).cos());
        self.θ %= 2.0 * PI;

        // Semi-latus rectum
        let p = self.a * (1.0 - self.e.powi(2));
        // Angular momentum
        let h = (μ_primary * p).sqrt();

        let r = p / (1.0 + self.e * self.θ.cos());

        self.x = self.Q * V::new(r * self.θ.cos(), r * self.θ.sin(), 0.0);
        self.v = -(μ_primary / h) * self.Q * V::new(-self.θ.sin(), self.e + (self.θ.cos()), 0.0);
    }
}
