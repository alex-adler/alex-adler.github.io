struct SceneData {
    frame_num: u32,
    width: u32,
    height: u32,
    reserved: vec3<f32>, // There are 5 additional f32 values that are sent in this struct so that it is 32 bytes long
};
@group(0) @binding(0)
var<uniform> scene_data: SceneData;

// ----------------------- Vertex shader ----------------------- 

alias TriangleVertices = array<vec2f, 6>;
var<private> vertices: TriangleVertices = TriangleVertices(
    vec2f(-1.0,  1.0),
    vec2f(-1.0, -1.0),
    vec2f( 1.0,  1.0),
    vec2f( 1.0,  1.0),
    vec2f(-1.0, -1.0),
    vec2f( 1.0, -1.0),
);

@vertex
fn vs_main(
     @builtin(vertex_index) index: u32,
) -> @builtin(position) vec4f {

    return vec4f(vertices[index], 0.0, 1.0);
}

// ----------------------- Fragment shader ----------------------- 

@fragment
fn fs_main(
    @builtin(position) pos: vec4f
) -> @location(0) vec4<f32> {
    // return pos;
    return vec4f(pos.x/f32(scene_data.width), pos.y/f32(scene_data.height), 0.0, 1.0);
    // return vec4f(1.0, 0.0, 0.0, 1.0);
}
