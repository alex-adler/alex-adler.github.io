import * as test_data from "./data/celestial_data";
console.log(test_data.space_time);
for (const body in test_data.space_time) {
    console.log(test_data.space_time[body]);
}
