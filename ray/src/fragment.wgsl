// ----------------------- Fragment shader ----------------------- 
struct Uniforms {
    frame_num: u32,
    width: u32,
    height: u32,
    reserved: vec3<f32>, // There are 5 additional f32 values that are sent in this struct so that it is 32 bytes long
};
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var radiance_samples_old: texture_2d<f32>;
@group(0) @binding(2) var radiance_samples_new: texture_storage_2d<rgba32float, write>;

struct Ray {
    origin: vec3f,
    direction: vec3f,
}

struct Sphere {
    center: vec3f,
    radius: f32,
}

struct Intersection {
    normal: vec3f,
    t: f32,
}

struct Scatter {
    attenuation: vec3f,
    ray: Ray,
}

const OBJECT_COUNT: u32 = 2;
alias Scene = array<Sphere, OBJECT_COUNT>;
var<private> scene: Scene = Scene(
    Sphere(vec3(0., 0. , -1.), 0.5),
    Sphere(vec3(0., -100.5 , -1.), 100.),
);

const F32_MAX: f32 = 3.40282346638528859812e+38;
const EPSILON: f32 = 1e-2;

const FOCAL_DISTANCE: f32 = 1.;
const MAX_PATH_LENGTH: u32 = 6u;

fn sky_colour(ray: Ray) ->vec3f {
    // Get a value that goes from 1 to 0 as you go down
    let t = 0.5 * (normalize(ray.direction).y + 1.);
    // Make a vertical linear gradient from light blue to white
    // return (1. - t) * vec3(1.) + t * vec3(0.3, 0.5, 1.);
    // or use a rough approximation of twilight (From light red to white)
    return (1. - t) * vec3(1.) + t * vec3(1., 0.5, 0.3);
}

// Get the position of point on a ray at a given time
fn point_on_ray(ray: Ray, t: f32) -> vec3f{
    return ray.origin + t * ray.direction;
}

fn scatter(input_ray: Ray, hit: Intersection) -> Scatter {
    let reflected = reflect(input_ray.direction, hit.normal);
    // Bump the start of the reflected ray a little bit off the surface to 
    // try to minimize self intersections due to floating point errors
    let output_ray = Ray(point_on_ray(input_ray, hit.t) + hit.normal * EPSILON, reflected);
    let attenuation = vec3(0.4); // TODO: Remove hardcoded value
    return Scatter(attenuation, output_ray);
}

// Create an empty intersection
fn no_intersection() -> Intersection {
    return Intersection(vec3(0.), -1.);
}

// Calculate if an intersection has occured
fn is_intersection(hit: Intersection) -> bool {
    return hit.t > 0.;
}

fn intersect_sphere(ray: Ray, sphere: Sphere) -> Intersection {
    let v = ray.origin - sphere.center;
    let a = dot(ray.direction, ray.direction);
    let b = dot(v, ray.direction);
    let c = dot(v, v) - sphere.radius * sphere.radius;

    // Find roots for the quadratic
    let d = b * b - a * c;

    // If no roots are found, the ray does not intersect with the sphere
    if d < 0. {
        return no_intersection();
    }

    // If there is a real solution, find the time at which it takes place
    let sqrt_d = sqrt(d);
    let recip_a = 1. / a;
    let mb = -b;
    let t1 = (mb - sqrt_d) * recip_a;
    let t2 = (mb + sqrt_d) * recip_a;
    let t = select(t2, t1, t1 > EPSILON);
    if t <= EPSILON {
        // Check if the solution is for time = 0
        return no_intersection();
    }

    let p = point_on_ray(ray, t);
    let N = (p - sphere.center) / sphere.radius;
    return Intersection(N, t);
}

fn intersect_scene(ray: Ray) -> Intersection {
    var closest_hit = Intersection(vec3(0.), F32_MAX);
    for (var i = 0u; i < OBJECT_COUNT; i += 1u) {
        // Loop through each object
        let hit = intersect_sphere(ray, scene[i]);
        if hit.t > 0. && hit.t < closest_hit.t {
            closest_hit = hit;
        }
    }
    if closest_hit.t < F32_MAX {
        return closest_hit;
    }
    return no_intersection();
}

@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4<f32> {
    // Seed the Random Number Generator
    init_rng(vec2u(pos.xy), uniforms.width, uniforms.frame_num);
    let origin = vec3(0.);    
    let aspect_ratio = f32(uniforms.width) / f32(uniforms.height);

    // Normalize the viewport coordinates
    let offset = vec2(rand_f32() - 0.5, rand_f32() - 0.5);
    var uv = (pos.xy + offset) / vec2f(f32(uniforms.width-1u), f32(uniforms.height-1u));

    // Map 'uv' from y-down (normalized) viewport coordinates to camera coordinates
    // (y-up, x-right, right hand, screen height is 2 units)
    uv = (2. * uv - vec2(1.)) * vec2(aspect_ratio,  -1.);

    let direction = vec3(uv, -FOCAL_DISTANCE);
    var ray = Ray(origin, direction);
    var throughput = vec3f(1.);
    var radiance_sample = vec3(0.);

    // Propagate the ray into the scene and get the final colours
    var path_length = 0u;
    while path_length < MAX_PATH_LENGTH {
        let hit = intersect_scene(ray);
        if !is_intersection(hit) {
            // If not intersection was found, return the colout of the sky and terminate the path
            radiance_sample = sky_colour(ray);
            break;
        }

        let scattered = scatter(ray, hit);
        throughput *= scattered.attenuation;
        ray = scattered.ray;
        path_length += 1u;
    }

    // Fetch the old sum of samples
    var old_sum: vec3f;
    if uniforms.frame_num > 1 {
        old_sum = textureLoad(radiance_samples_old, vec2u(pos.xy), 0).xyz;
    } else {
        old_sum = vec3(0.);
    }

    // Compute and store the new sum
    let new_sum = radiance_sample + old_sum;
    textureStore(radiance_samples_new, vec2u(pos.xy), vec4(new_sum, 0.));

    return vec4(new_sum / f32(uniforms.frame_num), 1.);
}
