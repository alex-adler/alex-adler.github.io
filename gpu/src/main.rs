use gpu_rs::run;

fn main() {
    pollster::block_on(run());
}
