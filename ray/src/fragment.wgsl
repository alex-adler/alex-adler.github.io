// ----------------------- Fragment shader ----------------------- 
struct SceneData {
    frame_num: u32,
    width: u32,
    height: u32,
    reserved: vec3<f32>, // There are 5 additional f32 values that are sent in this struct so that it is 32 bytes long
};
@group(0) @binding(0)
var<uniform> scene_data: SceneData;

const PULSE_RATE: u32 = 120u;

@fragment
fn fs_main(
    @builtin(position) pos: vec4f
) -> @location(0) vec4<f32> {
    let angle_rad: f32 = 0.05 * f32(scene_data.frame_num);
    let b: f32 = cos(angle_rad) / 2.0 + 0.5; // Cycling between 0 and 1
    // let b: f32 = 0.0;

    return vec4f(pos.xy / vec2f(f32(scene_data.width-1u), f32(scene_data.height-1u)), b, 1.0);
    // return vec4f(1.0, 0.0, 0.0, 1.0);
}
