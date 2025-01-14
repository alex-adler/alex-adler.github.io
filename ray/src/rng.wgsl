struct Rng {
  state: u32,
};
var<private> rng: Rng;

fn init_rng(pixel: vec2u, width: u32, frame_num: u32) {
    // Seed the PRNG using the scalar index of the pixel and the current frame count.
    let seed = (pixel.x + pixel.y * width) ^ jenkins_hash(frame_num);
    rng.state = jenkins_hash(seed);
}

// A slightly modified version of the "One-at-a-Time Hash" function by Bob Jenkins.
// See https://www.burtleburtle.net/bob/hash/doobs.html
fn jenkins_hash(i: u32) -> u32 {
    var x = i;
    x += x << 10u;
    x ^= x >> 6u;
    x += x << 3u;
    x ^= x >> 11u;
    x += x << 15u;
    return x;
}

// The 32-bit "xor" function from Marsaglia G., "Xorshift RNGs", Section 3.
fn xorshift32() -> u32 {
    var x = rng.state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    rng.state = x;
    return x;
}

// Returns a random float in the range [0...1]. This sets the floating point exponent to zero and
// sets the most significant 23 bits of a random 32-bit unsigned integer as the mantissa. That
// generates a number in the range [1, 1.9999999], which is then mapped to [0, 0.9999999] by
// subtraction. See Ray Tracing Gems II, Section 14.3.4.
fn rand_f32() -> f32 {
    return bitcast<f32>(0x3f800000u | (xorshift32() >> 9u)) - 1.;
}