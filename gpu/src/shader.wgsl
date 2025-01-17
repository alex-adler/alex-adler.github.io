// ----------------------- Vertex shader ----------------------- 

struct InstanceInput {
    @location(5) model_matrix_0: vec4<f32>,
    @location(6) model_matrix_1: vec4<f32>,
    @location(7) model_matrix_2: vec4<f32>,
    @location(8) model_matrix_3: vec4<f32>,
};

struct CameraUniform {
    view_proj: mat4x4<f32>,
};
@group(1) @binding(0)
var<uniform> camera: CameraUniform;

struct SceneTime {
    frame_num: f32,
    reserved: vec3<f32>, // There are 7 additional f32 values that are sent in this struct so that it is 32 bytes long
};
@group(2) @binding(0)
var<uniform> scene_time: SceneTime;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) tex_coords: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) tex_coords: vec2<f32>,
}

@vertex
fn vs_main(
    model: VertexInput,
    instance: InstanceInput,
) -> VertexOutput {
	var model_matrix = mat4x4<f32>(
        instance.model_matrix_0,
        instance.model_matrix_1,
        instance.model_matrix_2,
        instance.model_matrix_3,
    );
    var out: VertexOutput;
    out.tex_coords = model.tex_coords;

	// Change the y position
	model_matrix[3][1] = abs(cos(0.05*scene_time.frame_num)) * 1.5 + model_matrix[3][1];

	// Rotation speed is a function of the position of the instance
	let angle_rad: f32 = 0.001 * scene_time.frame_num  * model_matrix[3][0] * model_matrix[3][1] * model_matrix[3][2];

	// Rotate about the x axis
	let rotation = mat4x4<f32>(	1.0, 0.0, 			0.0, 				0.0,
								0.0, cos(angle_rad), -sin(angle_rad), 	0.0,
								0.0, sin(angle_rad), cos(angle_rad), 	0.0,
								0.0, 0.0, 			0.0, 				1.0);

    out.clip_position = camera.view_proj * model_matrix * rotation * vec4<f32>(model.position, 1.0);
    return out;
}

// ----------------------- Fragment shader ----------------------- 

@group(0) @binding(0)
var t_diffuse: texture_2d<f32>;
@group(0) @binding(1)
var s_diffuse: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(t_diffuse, s_diffuse, in.tex_coords);
}
