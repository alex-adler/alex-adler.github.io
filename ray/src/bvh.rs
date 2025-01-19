use std::u32;

use bytemuck::Zeroable;

use crate::{algebra::Vec3, Sphere, MAX_OBJECT_COUNT};

const AABB_PADDING_SIZE: f32 = 0.0001;

#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct AABB {
    // Axis Aligned Bounding Box
    min: Vec3,
    left_child_index: u32,
    max: Vec3,
    right_child_index: u32,
    object_index: u32,
    is_populated: u32,
    _pad: [u32; 2],
}

impl AABB {
    pub fn new(min: Vec3, max: Vec3) -> Self {
        Self {
            min,
            max,
            object_index: u32::MAX,
            left_child_index: 0,
            right_child_index: 0,
            is_populated: 1,
            _pad: [0; 2],
        }
    }
    fn grow(&mut self, object: &Sphere) {
        let min = object.center - Vec3::all(object.radius);
        let max = object.center + Vec3::all(object.radius);
        if min.x() < self.min.x() {
            self.min.set_x(min.x());
        }
        if max.x() > self.max.x() {
            self.max.set_x(max.x());
        }
        if min.y() < self.min.y() {
            self.min.set_y(min.y());
        }
        if max.y() > self.max.y() {
            self.max.set_y(max.y());
        }
        if min.z() < self.min.z() {
            self.min.set_z(min.z());
        }
        if max.z() > self.max.z() {
            self.max.set_z(max.z());
        }
    }
    fn sort_longest_axis(&self, scene: &mut Vec<Sphere>, start: usize, end: usize) {
        // Get longest axis
        let size = self.max - self.min;

        // Sort the relevant part scene by the longest axis so that we can split it by selecting the middle object
        if size.x() > size.y() && size.x() > size.z() {
            scene[start..end].sort_by(|x, y| x.center.x().partial_cmp(&y.center.x()).unwrap());
        } else if size.y() > size.z() {
            scene[start..end].sort_by(|x, y| x.center.y().partial_cmp(&y.center.y()).unwrap());
        } else {
            scene[start..end].sort_by(|x, y| x.center.z().partial_cmp(&y.center.z()).unwrap());
        }
    }
    fn pad(&mut self, padding_size: f32) {
        // Make sure the box isn't smaller than padding size in any dimension
        let delta = self.max - self.min;
        if delta.x() < padding_size {
            self.min.set_x(self.min.x() - padding_size);
            self.max.set_x(self.max.x() + padding_size);
        }
        if delta.y() < padding_size {
            self.min.set_y(self.min.y() - padding_size);
            self.max.set_y(self.max.y() + padding_size);
        }
        if delta.z() < padding_size {
            self.min.set_z(self.min.z() - padding_size);
            self.max.set_z(self.max.z() + padding_size);
        }
    }
}

#[repr(C)]
#[derive(Debug)]
pub struct BVH {
    // Bounding Volume Hierarchy
    nodes: [AABB; 2 * MAX_OBJECT_COUNT - 1],
}

impl BVH {
    fn populate(
        &mut self,
        scene: &mut Vec<Sphere>,
        node_index: &mut usize,
        start: usize,
        end: usize,
    ) {
        // There is only one object left to sort so we will make this node a leaf
        if end - start == 1 {
            self.nodes[*node_index].object_index = start as u32;
            self.nodes[*node_index].pad(AABB_PADDING_SIZE);
            *node_index += 1;
            return;
        }

        for i in start..end {
            self.nodes[*node_index].grow(&scene[i]);
        }

        self.nodes[*node_index].sort_longest_axis(scene, start, end);

        let halfway_point = (end - start) / 2 + start;
        let parent_index = *node_index;
        *node_index += 1;

        // Deal with the left child
        self.nodes[parent_index].left_child_index = (*node_index) as u32;

        self.nodes[*node_index] = AABB::new(
            scene[start].center - Vec3::all(scene[start].radius),
            scene[start].center + Vec3::all(scene[start].radius),
        );
        self.populate(scene, node_index, start, halfway_point);

        // Deal with the right child
        self.nodes[parent_index].right_child_index = (*node_index) as u32;
        self.nodes[*node_index] = AABB::new(
            scene[halfway_point].center - Vec3::all(scene[halfway_point].radius),
            scene[halfway_point].center + Vec3::all(scene[halfway_point].radius),
        );
        self.populate(scene, node_index, halfway_point, end);
    }

    fn new(scene: &mut Vec<Sphere>) -> Self {
        let mut nodes = [AABB::zeroed(); 2 * MAX_OBJECT_COUNT - 1];

        nodes[0] = AABB::new(
            scene[0].center - Vec3::all(scene[0].radius),
            scene[0].center + Vec3::all(scene[0].radius),
        );

        let mut bvh = Self { nodes };
        let mut index = 0;
        bvh.populate(scene, &mut index, 0, scene.len());
        bvh
    }
}

pub fn create_bvh(scene: &mut Vec<Sphere>) -> [AABB; 2 * MAX_OBJECT_COUNT - 1] {
    BVH::new(scene).nodes
}

pub fn create_scene_array(scene_vec: &Vec<Sphere>, scene_arr: &mut [Sphere; MAX_OBJECT_COUNT]) {
    for i in 0..scene_arr.len() {
        if i < scene_vec.len() {
            scene_arr[i] = scene_vec[i].clone();
        } else {
            scene_arr[i] = Sphere::zeroed();
        }
    }
}
