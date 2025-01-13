// ----------------------- Fragment shader ----------------------- 
struct SceneData {
    frame_num: u32,
    width: u32,
    height: u32,
    reserved: vec3<f32>, // There are 5 additional f32 values that are sent in this struct so that it is 32 bytes long
};
@group(0) @binding(0)
var<uniform> scene_data: SceneData;

struct Ray {
    origin: vec3f,
    direction: vec3f,
}

struct Sphere {
    center: vec3f,
    radius: f32,
}

const OBJECT_COUNT: u32 = 2;
alias Scene = array<Sphere, OBJECT_COUNT>;
var<private> scene: Scene = Scene(
    Sphere(vec3(0.0, 0.0 , -1.0), 0.5),
    Sphere(vec3(0.0, -100.5 , -1.0), 100.0),
);

const FOCAL_DISTANCE: f32 = 1.0;
const F32_MAX: f32 = 3.40282346638528859812e+38;

fn sky_colour(ray: Ray) ->vec3f {
    // Get a value that goes from 1 to 0 as you go down
    let t = 0.5 * (normalize(ray.direction).y + 1.0);
    // Make a vertical linear gradient from light blue to white
    // return (1.0 - t) * vec3(1.0) + t * vec3(0.3, 0.5, 1.0);
    // or use a rough approximation of twilight (From light red to white)
    return (1.0 - t) * vec3(1.0) + t * vec3(1.0, 0.5, 0.3);
}

fn intersect_sphere(ray: Ray, sphere: Sphere) -> f32 {
    let v = ray.origin - sphere.center;
    let a = dot(ray.direction, ray.direction);
    let b = dot(v, ray.direction);
    let c = dot(v, v) - sphere.radius * sphere.radius;

    // Find roots for the quadratic
    let d = b * b - a * c;

    // If no roots are found, the ray does not intersect with the sphere
    if d < 0.0 {
        return -1.0;
    }

    // If there is a real solution, find the time at which it takes place
    let sqrt_d = sqrt(d);
    let recip_a = 1.0 / a;
    let mb = -b;
    let t = (mb - sqrt_d) * recip_a;
    if t > 0.0 {
        return t;
    }
    // If the time is negative we need to provide the other root
    return (mb + sqrt_d) * recip_a;
}

@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4<f32> {
    let origin = vec3(0.0);    
    let aspect_ratio = f32(scene_data.width) / f32(scene_data.height);

    // Normalize the viewport coordinates
    var uv = pos.xy / vec2f(f32(scene_data.width-1u), f32(scene_data.height-1u));

    // Map 'uv' from y-down (normalized) viewport coordinates to camera coordinates
    // (y-up, x-right, right hand, screen height is 2 units)
    uv = (2.0 * uv - vec2(1.0)) * vec2(aspect_ratio,  -1.0);

    let direction = vec3(uv, -FOCAL_DISTANCE);
    let ray = Ray(origin, direction);

    // Look for closest object that the ray interesects
    var closest_t = F32_MAX;
    for (var i = 0u; i < OBJECT_COUNT; i += 1u) {
        // Loop through each object
        let t = intersect_sphere(ray, scene[i]);
        if t > 0. && t < closest_t {
            closest_t = t;
        }
    }
    // Check that we found an object
    if closest_t < F32_MAX {
        return vec4(0.03, 1.0, 0.76, 1.) * saturate(1.0 - closest_t);
    }

    return vec4(sky_colour(ray), 1.0);
}
