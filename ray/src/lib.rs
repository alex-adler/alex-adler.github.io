mod algebra;
mod bvh;
mod camera;
mod helpers;
mod select;

use core::f32;
use std::iter;

use algebra::Vec3;
use bvh::{create_bvh, create_scene_array, AABB, BVH};
use camera::{Camera, CameraUniforms};
use helpers::get_random;
use select::{add_selection, clear_all_selections, get_selected_object, remove_selection};

use bytemuck::Zeroable;
use wgpu::Limits;
use winit::{
    dpi::PhysicalPosition,
    event::*,
    event_loop::EventLoop,
    keyboard::{KeyCode, PhysicalKey},
    window::{Window, WindowBuilder},
};

#[cfg(not(target_arch = "wasm32"))]
use rand::rngs::ThreadRng;

#[cfg(target_arch = "wasm32")]
use web_sys::js_sys::Date;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
#[link(wasm_import_module = "./ray.js")]
extern "C" {
    fn update_fps(new_fps: f32);
}

const FOCAL_DISTANCE: f32 = 4.5;
const VFOV_DEG: f32 = 40.;
const DOF_SCALE: f32 = 0.05;

#[cfg(target_arch = "wasm32")]
const FPS_HISTORY_LENGTH: usize = 60;
pub const MAX_OBJECT_COUNT: usize = 1024;
pub const MAX_PASSES: u32 = 600; // Number of frames before we accept the result

// We need this for Rust to store our data correctly for the shaders
#[repr(C)]
// This is so we can store this in a buffer
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
struct Uniforms {
    camera: CameraUniforms,
    frame_num: u32,
    width: u32,
    height: u32,
    _padding: u32,
}

impl Uniforms {
    fn new() -> Self {
        Self {
            camera: CameraUniforms::zeroed(),
            frame_num: 0,
            width: 0,
            height: 0,
            _padding: 0,
        }
    }
    fn tick(&mut self) {
        self.frame_num += 1;
    }
    fn update(&mut self, width: u32, height: u32) {
        self.width = width;
        self.height = height;
    }
    fn reset_samples(&mut self) {
        self.frame_num = 0;
    }
}

#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
struct Material {
    albedo: Vec3,
    alpha: f32,             // 0.0 = Transparent (Dielectric), 1.0 = Opaque
    refraction_index: f32,  // Relative from air into material (glass is ~1.0/1.5)
    smoothness: f32,        // 0.0 = Matte (Lambertian), 1.0 = Mirror (Specular)
    emissivity: f32,        // 0.0 = No emission, 1.0 = every ray will add light to the scene
    emission_strength: f32, // > 0
    emitted_colour: Vec3,
    _pad: [u32; 1],
}

impl Material {
    pub fn new(
        albedo: Vec3,
        smoothness: f32,
        alpha: f32,
        refraction_index: f32,
        emissivity: f32,
        emission_strength: f32,
        emitted_colour: Vec3,
    ) -> Self {
        Self {
            albedo,
            smoothness,
            alpha,
            refraction_index,
            emissivity,
            emission_strength,
            emitted_colour,
            _pad: [0; 1],
        }
    }
    #[allow(unused)]
    pub fn new_basic(albedo: Vec3, smoothness: f32) -> Self {
        let mut material = Material::default();
        material.albedo = albedo;
        material.smoothness = smoothness;
        material
    }
    #[allow(unused)]
    pub fn new_clear(albedo: Vec3) -> Self {
        let mut material = Material::default();
        material.albedo = albedo;
        material.alpha = 0.;
        material
    }
    #[allow(unused)]
    pub fn new_emissive(emitted_colour: Vec3, emission_strength: f32) -> Self {
        let mut material = Material::default();
        material.emissivity = 1.;
        material.emission_strength = emission_strength;
        material.emitted_colour = emitted_colour;
        material
    }
}

impl Default for Material {
    fn default() -> Self {
        Self {
            albedo: Vec3::new(1., 1., 1.),
            smoothness: 0.0,
            alpha: 1.0,
            refraction_index: 1. / 1.5,
            emissivity: 0.0,
            emission_strength: 0.0,
            emitted_colour: Vec3::new(1., 1., 1.),
            _pad: [0; 1],
        }
    }
}

#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
struct Sphere {
    center: Vec3,
    radius: f32,
    material: Material,
    is_selected: u32,
    _pad: [u32; 3],
}

impl Sphere {
    pub fn new(center: Vec3, radius: f32, material: Material) -> Self {
        Self {
            center,
            radius,
            material,
            is_selected: 0,
            _pad: [0; 3],
        }
    }
}

impl Default for Sphere {
    fn default() -> Self {
        Self {
            center: Vec3::new(0., 0., 0.),
            radius: 0.5,
            material: Material::default(),
            is_selected: 0,
            _pad: [0; 3],
        }
    }
}

struct State<'a> {
    limits: Limits,
    surface: wgpu::Surface<'a>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,

    render_pipeline: wgpu::RenderPipeline,

    uniforms: Uniforms,
    uniforms_buffer: wgpu::Buffer,
    display_bind_groups: [wgpu::BindGroup; 2],

    scene: Vec<Sphere>,
    scene_output: [Sphere; MAX_OBJECT_COUNT],
    scene_buffer: wgpu::Buffer,

    bvh: [AABB; 2 * MAX_OBJECT_COUNT - 1],
    bvh_buffer: wgpu::Buffer,

    // The window must be declared after the surface so
    // it gets dropped after it as the surface contains
    // unsafe references to the window's resources.
    window: &'a Window,
    camera: Camera,
    mouse_position: PhysicalPosition<f64>,
    mouse_pressed_position: [PhysicalPosition<f64>; 3],
    mouse_button_pressed: [bool; 3],
    ctrl_pressed: bool,

    #[cfg(target_arch = "wasm32")]
    last_frame_time: Date,
    #[cfg(target_arch = "wasm32")]
    frame_rate_history: [f32; FPS_HISTORY_LENGTH],
    #[cfg(target_arch = "wasm32")]
    frame_rate_pos: usize,

    #[cfg(target_arch = "wasm32")]
    rng: u32, // Dummy variable to allow the same function signature to be used for wasm random calls
    #[cfg(not(target_arch = "wasm32"))]
    rng: ThreadRng,
}

impl<'a> State<'a> {
    async fn new(window: &'a Window, limits: Limits) -> State<'a> {
        let size = window.inner_size();

        // The instance is a handle to our GPU
        // BackendBit::PRIMARY => Vulkan + Metal + DX12 + Browser WebGPU
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            #[cfg(not(target_arch = "wasm32"))]
            backends: wgpu::Backends::PRIMARY,
            #[cfg(target_arch = "wasm32")]
            backends: wgpu::Backends::BROWSER_WEBGPU,
            ..Default::default()
        });

        let surface = instance.create_surface(window).unwrap();

        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::default(),
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .unwrap();

        let (device, queue) = adapter
            .request_device(
                &wgpu::DeviceDescriptor {
                    label: None,
                    required_features: wgpu::Features::empty(),
                    required_limits: limits.clone(),
                    memory_hints: Default::default(),
                },
                // Some(&std::path::Path::new("trace")), // Trace path
                None,
            )
            .await
            .unwrap();

        let surface_caps = surface.get_capabilities(&adapter);
        // Shader code in this tutorial assumes an Srgb surface texture. Using a different
        // one will result all the colors comming out darker. If you want to support non
        // Srgb surfaces, you'll need to account for that when drawing to the frame.
        let surface_format = surface_caps
            .formats
            .iter()
            .copied()
            .find(|f| f.is_srgb())
            .unwrap_or(surface_caps.formats[0]);
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format: surface_format,
            width: size.width,
            height: size.height,
            present_mode: surface_caps.present_modes[0],
            alpha_mode: surface_caps.alpha_modes[0],
            desired_maximum_frame_latency: 2,
            view_formats: vec![],
        };

        let camera = Camera::look_at(
            Vec3::new(3., 2., 3.),
            Vec3::new(0., 1., 0.),
            Vec3::new(0., 1., 0.),
            FOCAL_DISTANCE,
            VFOV_DEG,
            DOF_SCALE,
        );

        let uniforms = Uniforms::new();
        let uniforms_buffer = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Uniforms"),
            size: std::mem::size_of::<Uniforms>() as u64,
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });

        let mut scene = Vec::new();
        scene.push(Sphere::new(
            Vec3::new(0., -1000., -1.),
            1000.,
            Material::new_basic(Vec3::new(0.5, 0.5, 0.5), 0.),
        ));
        // for a in -11..11 {
        //     for b in -11..11 {
        //         scene.push(Sphere::new(
        //             Vec3::new(
        //                 (a as f64 + 0.9 * get_random(&mut self.rng)) as f32,
        //                 0.2,
        //                 (b as f64 + 0.9 * get_random(&mut self.rng)) as f32,
        //             ),
        //             0.2,
        //             Material::new(
        //                 Vec3::new(get_random(&mut self.rng) as f32, get_random(&mut self.rng) as f32, get_random(&mut self.rng) as f32).normalized(),
        //                 get_random(&mut self.rng) as f32,
        //                 get_random(&mut self.rng) as f32,
        //                 1. / 1.5,
        //                 get_random(&mut self.rng) as f32,
        //                 get_random(&mut self.rng) as f32,
        //                 Vec3::new(get_random(&mut self.rng) as f32, get_random(&mut self.rng) as f32, get_random(&mut self.rng) as f32),
        //             ),
        //         ));
        //     }
        // }
        scene.push(Sphere::new(
            Vec3::new(2., 1., -2.),
            1.0,
            Material::new_basic(Vec3::new(0.7, 0.6, 0.5), 1.),
        ));
        scene.push(Sphere::new(
            Vec3::new(0., 1., 0.),
            1.0,
            Material::new_clear(Vec3::new(1., 1., 1.)),
        ));
        scene.push(Sphere::new(
            Vec3::new(-2., 1., -2.),
            1.0,
            Material::new_basic(Vec3::new(0.4, 0.2, 0.1), 0.),
        ));
        scene.push(Sphere::new(
            Vec3::new(0., 3., 0.),
            0.5,
            Material::new(
                Vec3::new(0.9, 0.0, 0.3),
                0.,
                1.,
                0.67,
                1.,
                0.1,
                Vec3::new(0.9, 0.0, 0.3),
            ),
        ));
        scene.push(Sphere::new(
            Vec3::new(0., 3., -1.5),
            0.5,
            Material::new(
                Vec3::new(1.0, 1.0, 1.0),
                0.,
                1.,
                0.67,
                1.,
                1.,
                Vec3::new(1.0, 1.0, 1.0),
            ),
        ));
        let scene_buffer = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Scene"),
            size: (std::mem::size_of::<Sphere>() * MAX_OBJECT_COUNT) as u64,
            usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });

        let bvh_buffer = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("BVH"),
            size: std::mem::size_of::<BVH>() as u64,
            usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });

        // TODO: Figure out why chrome doesn't like the textures to be any bigger
        let radiance_samples = helpers::create_sample_textures(&device, 4096, 4096);

        let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            entries: &[
                wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Texture {
                        sample_type: wgpu::TextureSampleType::Float { filterable: false },
                        view_dimension: wgpu::TextureViewDimension::D2,
                        multisampled: false,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 1,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::StorageTexture {
                        access: wgpu::StorageTextureAccess::WriteOnly,
                        format: wgpu::TextureFormat::Rgba32Float,
                        view_dimension: wgpu::TextureViewDimension::D2,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 2,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 3,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: true },
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 4,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: true },
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                },
            ],
            label: Some("bind_group_layout"),
        });

        let display_bind_groups = helpers::create_display_bind_groups(
            &device,
            &bind_group_layout,
            &radiance_samples,
            &uniforms_buffer,
            &scene_buffer,
            &bvh_buffer,
        );

        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("Shader"),
            source: wgpu::ShaderSource::Wgsl(
                format!(
                    "{}{}",
                    include_str!("vertex.wgsl"),
                    include_str!("fragment.wgsl")
                )
                .into(),
            ),
        });

        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Render Pipeline Layout"),
                bind_group_layouts: &[&bind_group_layout],
                push_constant_ranges: &[],
            });

        let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Render Pipeline"),
            layout: Some(&render_pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: Some("vs_main"),
                buffers: &[],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: Some("fs_main"),
                targets: &[Some(wgpu::ColorTargetState {
                    format: config.format,
                    blend: Some(wgpu::BlendState::REPLACE),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            }),
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                strip_index_format: None,
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: Some(wgpu::Face::Back),
                polygon_mode: wgpu::PolygonMode::Fill, // Setting this to anything other than Fill requires Features::NON_FILL_POLYGON_MODE
                unclipped_depth: false,                // Requires Features::DEPTH_CLIP_CONTROL
                conservative: false, // Requires Features::CONSERVATIVE_RASTERIZATION
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState {
                count: 1,
                mask: !0,
                alpha_to_coverage_enabled: false,
            },
            multiview: None,
            cache: None,
        });

        let bvh = create_bvh(&mut scene);
        let mut scene_output = [Sphere::zeroed(); MAX_OBJECT_COUNT];
        create_scene_array(&scene, &mut scene_output);

        // log::warn!("{:#?}", bvh);

        Self {
            limits,

            surface,
            device,
            queue,
            config,
            size,
            render_pipeline,

            uniforms,
            display_bind_groups,
            uniforms_buffer,

            scene,
            scene_output,
            scene_buffer,

            bvh,
            bvh_buffer,

            window,
            camera,
            mouse_position: PhysicalPosition { x: 0., y: 0. },
            mouse_pressed_position: [PhysicalPosition { x: 0., y: 0. }; 3],
            mouse_button_pressed: [false; 3],
            ctrl_pressed: false,

            #[cfg(target_arch = "wasm32")]
            last_frame_time: Date::new_0(),
            #[cfg(target_arch = "wasm32")]
            frame_rate_history: [60.; FPS_HISTORY_LENGTH],
            #[cfg(target_arch = "wasm32")]
            frame_rate_pos: 0,

            #[cfg(target_arch = "wasm32")]
            rng: 0,
            #[cfg(not(target_arch = "wasm32"))]
            rng: rand::thread_rng(),
        }
    }

    fn rebuild_scene(&mut self) {
        self.bvh = create_bvh(&mut self.scene);
        create_scene_array(&self.scene, &mut self.scene_output);
    }

    fn window(&self) -> &Window {
        &self.window
    }

    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            self.config.width = new_size.width;
            self.config.height = new_size.height;
            self.surface.configure(&self.device, &self.config);
            self.uniforms.update(new_size.width, new_size.height);
            self.uniforms.reset_samples();
        }
    }

    fn input(&mut self, event: &WindowEvent) -> bool {
        match event {
            WindowEvent::CursorMoved { position, .. } => {
                self.mouse_position = *position;
                true
            }
            WindowEvent::KeyboardInput {
                event:
                    KeyEvent {
                        state,
                        physical_key,
                        ..
                    },
                ..
            } => match (physical_key, state) {
                (PhysicalKey::Code(KeyCode::KeyA), ElementState::Pressed) => {
                    for _ in 0..10 {
                        self.scene.push(Sphere::new(
                            Vec3::new(
                                (10. * get_random(&mut self.rng) - 5.0) as f32,
                                (5. * get_random(&mut self.rng)) as f32,
                                (10. * get_random(&mut self.rng) - 5.0) as f32,
                            ),
                            0.2,
                            Material::new(
                                Vec3::new(
                                    get_random(&mut self.rng) as f32,
                                    get_random(&mut self.rng) as f32,
                                    get_random(&mut self.rng) as f32,
                                )
                                .normalized(),
                                get_random(&mut self.rng) as f32,
                                get_random(&mut self.rng) as f32,
                                1. / 1.5,
                                get_random(&mut self.rng) as f32,
                                get_random(&mut self.rng) as f32,
                                Vec3::new(
                                    get_random(&mut self.rng) as f32,
                                    get_random(&mut self.rng) as f32,
                                    get_random(&mut self.rng) as f32,
                                ),
                            ),
                        ));
                    }
                    self.rebuild_scene();
                    self.uniforms.reset_samples();
                    true
                }
                (PhysicalKey::Code(KeyCode::KeyR), ElementState::Pressed) => {
                    self.scene.pop();
                    self.rebuild_scene();
                    self.uniforms.reset_samples();
                    true
                }
                (PhysicalKey::Code(KeyCode::ControlLeft), _) => {
                    self.ctrl_pressed = *state == ElementState::Pressed;
                    true
                }
                _ => false,
            },
            _ => false,
        }
    }

    fn mouse_input(&mut self, event: &DeviceEvent) {
        match event {
            DeviceEvent::MouseWheel { delta } => {
                let delta = match delta {
                    MouseScrollDelta::PixelDelta(delta) => 0.001 * delta.y as f32,
                    MouseScrollDelta::LineDelta(_, y) => y * 0.1,
                };
                self.camera.zoom(delta);
                self.uniforms.reset_samples();
            }
            DeviceEvent::Button { button, state } => {
                // 0 - Left
                // 1 - Right
                // 2 - Middle
                if *button <= 3 {
                    self.mouse_button_pressed[*button as usize] = *state == ElementState::Pressed;

                    if *state == ElementState::Pressed {
                        self.mouse_pressed_position[*button as usize] = self.mouse_position;
                    } else {
                        let last_pos = &self.mouse_pressed_position[*button as usize];
                        let pos = &self.mouse_position;
                        // Allow for the mouse to move a little bit between being pressed and released
                        if (pos.x - last_pos.x).abs() < 5. && (pos.y - last_pos.y).abs() < 5. {
                            // Check if there are any object we can select
                            let (hit_object, dist_to_object) = get_selected_object(
                                &self.mouse_position,
                                &self.uniforms,
                                &self.scene_output,
                            );

                            if hit_object == usize::MAX {
                                clear_all_selections(&mut self.scene_output);
                                if *button == 0 {
                                    self.camera.uniforms.dof_scale = 0.;
                                }
                            } else {
                                match *button {
                                    0 => {
                                        if self.ctrl_pressed {
                                            add_selection(hit_object, &mut self.scene_output);
                                        } else {
                                            self.camera.uniforms.focal_distance = dist_to_object;
                                            self.camera.uniforms.dof_scale = DOF_SCALE;
                                        }
                                    }
                                    1 => {
                                        if self.ctrl_pressed {
                                            remove_selection(hit_object, &mut self.scene_output);
                                        }
                                    }
                                    _ => {
                                        if self.ctrl_pressed {
                                            clear_all_selections(&mut self.scene_output);
                                        }
                                    }
                                }
                            }
                            self.uniforms.reset_samples();
                        }
                    }
                }
            }
            DeviceEvent::MouseMotion { delta: (dx, dy) } => {
                let dx = *dx as f32 * -0.01;
                let dy = *dy as f32 * 0.01;
                if self.mouse_button_pressed[0] {
                    self.camera.orbit(dx, dy);
                    self.uniforms.reset_samples();
                } else if self.mouse_button_pressed[1] {
                    self.camera.pan(dx, dy);
                    self.uniforms.reset_samples();
                } else if self.mouse_button_pressed[2] {
                    self.camera.zoom(-dy);
                    self.uniforms.reset_samples();
                }
            }
            _ => (),
        }
    }

    fn update(&mut self) {}

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        if self.uniforms.frame_num > MAX_PASSES {
            return Ok(());
        }
        #[cfg(target_arch = "wasm32")]
        {
            // Calculate FPS
            let current_date = Date::new_0();
            let elapsed = current_date.get_milliseconds() - self.last_frame_time.get_milliseconds();
            let fps = (1. / elapsed as f32) * 1000.;
            if fps.is_normal() {
                self.frame_rate_history[self.frame_rate_pos] = fps;

                let mut fps_mean = 0.;
                for f in self.frame_rate_history {
                    fps_mean += f;
                }
                fps_mean /= self.frame_rate_history.len() as f32;

                unsafe {
                    update_fps(fps_mean as f32);
                }
                self.last_frame_time = current_date;
                self.frame_rate_pos += 1;
                self.frame_rate_pos %= self.frame_rate_history.len();
            }
        }

        // Update Uniforms
        self.uniforms.camera = *self.camera.uniforms();
        self.uniforms.tick();
        self.queue.write_buffer(
            &self.uniforms_buffer,
            0,
            bytemuck::cast_slice(&[self.uniforms]),
        );

        // Update scene
        self.queue.write_buffer(
            &self.scene_buffer,
            0,
            bytemuck::cast_slice(&self.scene_output),
        );

        self.queue
            .write_buffer(&self.bvh_buffer, 0, bytemuck::cast_slice(&self.bvh));

        // Prepare pipeline
        let output = self.surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });

        {
            let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.,
                            g: 0.,
                            b: 0.,
                            a: 1.0,
                        }),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                occlusion_query_set: None,
                timestamp_writes: None,
            });

            // Swap the textures around for storing the previous frame
            render_pass.set_bind_group(
                0,
                &self.display_bind_groups[(self.uniforms.frame_num % 2) as usize],
                &[],
            );
            render_pass.set_pipeline(&self.render_pipeline);

            // Provide vertices to cover the screen
            render_pass.draw(0..6, 0..1);
        }

        self.queue.submit(iter::once(encoder.finish()));
        output.present();

        Ok(())
    }
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen(start))]
pub async fn run() {
    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            std::panic::set_hook(Box::new(console_error_panic_hook::hook));
            console_log::init_with_level(log::Level::Warn).expect("Couldn't initialize logger");
        } else {
            env_logger::init();
        }
    }

    let event_loop = EventLoop::new().unwrap();
    let window = WindowBuilder::new().build(&event_loop).unwrap();

    // WebGL doesn't support all of wgpu's features, so if
    // we're building for that (or other old APIs) we'll have to disable some.
    let limits = wgpu::Limits::default();

    #[cfg(target_arch = "wasm32")]
    {
        // Winit prevents sizing with CSS, so we have to set
        // the size manually when on web.
        use winit::dpi::{LogicalSize, PhysicalSize};
        use winit::platform::web::WindowExtWebSys;

        web_sys::window()
            .and_then(|win| {
                let width = win.inner_width().unwrap().as_f64().unwrap() as u32;
                let height = win.inner_height().unwrap().as_f64().unwrap() as u32;
                let factor = window.scale_factor();
                let logical = LogicalSize { width, height };
                let PhysicalSize { width, height }: PhysicalSize<u32> = logical.to_physical(factor);
                let _ = window.request_inner_size(PhysicalSize::new(width, height));
                win.document()
            })
            .and_then(|doc| {
                let dst = doc.get_element_by_id("ray-body")?;
                let canvas = web_sys::Element::from(window.canvas()?);
                dst.append_child(&canvas).ok()?;
                Some(())
            })
            .expect("Couldn't append canvas to document body.");
    }

    // State::new uses async code, so we're going to wait for it to finish
    let mut state = State::new(&window, limits).await;
    let mut surface_configured = false;

    // TODO: replace run with run_app
    event_loop
        .run(move |event, control_flow| {
            match event {
                Event::WindowEvent {
                    ref event,
                    window_id,
                } if window_id == state.window().id() => {
                    if !state.input(event) {
                        match event {
                            WindowEvent::CloseRequested
                            | WindowEvent::KeyboardInput {
                                event:
                                    KeyEvent {
                                        state: ElementState::Pressed,
                                        physical_key: PhysicalKey::Code(KeyCode::Escape),
                                        ..
                                    },
                                ..
                            } => control_flow.exit(),
                            WindowEvent::Resized(mut physical_size) => {
                                // Check if we are trying to make a window larger than the current Limits allows
                                if physical_size.width > state.limits.max_texture_dimension_2d {
                                    log::warn!("Trying to resize window width to be larger than the maximum texture size");
                                    physical_size.width = state.limits.max_texture_dimension_2d;
                                }
                                if physical_size.height > state.limits.max_texture_dimension_2d {
                                    log::warn!("Trying to resize window height to be larger than the maximum texture size");
                                    physical_size.height = state.limits.max_texture_dimension_2d;
                                }
                                surface_configured = true;
                                state.resize(physical_size);
                            }
                            WindowEvent::RedrawRequested => {
                                // This tells winit that we want another frame after this one
                                state.window().request_redraw();

                                if !surface_configured {
                                    return;
                                }

                                state.update();
                                match state.render() {
                                    Ok(_) => {}
                                    // Reconfigure the surface if it's lost or outdated
                                    Err(
                                        wgpu::SurfaceError::Lost | wgpu::SurfaceError::Outdated,
                                    ) => state.resize(state.size),
                                    // The system is out of memory, we should probably quit
                                    Err(wgpu::SurfaceError::OutOfMemory) => {
                                        log::error!("OutOfMemory");
                                        control_flow.exit();
                                    }

                                    // This happens when the a frame takes too long to present
                                    Err(wgpu::SurfaceError::Timeout) => {
                                        log::warn!("Surface timeout")
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                }
                Event::DeviceEvent { event, .. } => {state.mouse_input(&event)}
                _ => {}
            }
        })
        .unwrap();
}
