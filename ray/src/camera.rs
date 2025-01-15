use bytemuck::{Pod, Zeroable};

use crate::algebra::Vec3;

#[derive(Debug, Copy, Clone, Pod, Zeroable)]
#[repr(C)]
pub struct CameraUniforms {
    origin: Vec3,
    _padding0: u32, //  Vectors need to be aligned to 32 Bytes
    u: Vec3,
    _padding1: u32,
    v: Vec3,
    _padding2: u32,
    w: Vec3,
    _padding3: u32,
}

pub struct Camera {
    uniforms: CameraUniforms,
}

impl Camera {
    pub fn look_at(origin: Vec3, center: Vec3, up: Vec3) -> Camera {
        let w = (center - origin).normalized();
        let u = w.cross(&up).normalized();
        let v = u.cross(&w);
        Camera {
            uniforms: CameraUniforms {
                origin,
                _padding0: 0,
                u,
                _padding1: 0,
                v,
                _padding2: 0,
                w,
                _padding3: 0,
            },
        }
    }

    pub fn uniforms(&self) -> &CameraUniforms {
        &self.uniforms
    }

    pub fn zoom(&mut self, displacement: f32) {
        self.uniforms.origin += displacement * self.uniforms.w;
    }
}
