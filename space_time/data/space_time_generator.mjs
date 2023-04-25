import * as fs from "fs";
class Celestial {
    constructor(name, dayLength_h, yearLength_h, initialYearProgress = 0, initialWeekDay = 0) {
        this.name = name;
        this.dayLength_ms = Math.floor(dayLength_h * 3600) * 1000;
        this.yearLength_ms = Math.floor(yearLength_h * 3600) * 1000;
        this.yearLength_hd = 0;
        // ------------------ Days and weeks -----------------------------
        // Factor for calculating length of human day
        let offsetFrom24h = 1;
        // Check if day length is +-offsetFrom24h from 24 hours
        if (Math.abs(24 * 3600 * 1000 - this.dayLength_ms) > offsetFrom24h * 3600 * 1000) {
            // If it's not, use the solar day as a week and calculate a human day
            this.calculateWeek(offsetFrom24h, 1);
        }
        else {
            // Use a default 7 day week if we don't need a special one
            this.hDayLength_ms = this.dayLength_ms;
            this.weekLength_d = 7;
            this.weekLength_hd = this.weekLength_d;
        }
        // Calculate year length including rounding to integer days
        this.yearLength_hd = Math.floor(this.yearLength_ms / this.hDayLength_ms);
        this.hYearLength_ms = this.yearLength_hd * this.hDayLength_ms;
        // ------------------ Months -----------------------------
        // Months are as close as 4 weeks per month as reasonable
        let idealWeeksPerMonth = 4;
        let idealDaysPerMonth = idealWeeksPerMonth * this.weekLength_hd;
        let idealMonthCount = Math.round(this.yearLength_hd / idealDaysPerMonth);
        // Number of months must be a multiple of 4 (so seasons are easier)
        this.monthCount = Math.floor(idealMonthCount / 4) * 4;
        this.nominalMonthLength_hd = Math.floor(this.yearLength_hd / this.monthCount);
        this.nominalMonthLength_ms = this.nominalMonthLength_hd * this.hDayLength_ms;
        // ------------------ Leap Years -----------------------------
        let yearRemainder_hd = [];
        this.leapYearFreq_hd = [];
        this.leapYearBlocks_ms = [];
        yearRemainder_hd.push((this.yearLength_ms % this.hYearLength_ms) / this.hDayLength_ms);
        this.leapYearFreq_hd.push(Math.ceil(1 / yearRemainder_hd.at(-1)));
        yearRemainder_hd.push((this.yearLength_ms % this.hYearLength_ms) / this.hDayLength_ms - 1 / this.leapYearFreq_hd.at(-1));
        this.leapYearFreq_hd.push(Math.ceil(1 / yearRemainder_hd.at(-1)));
        this.monthRemainder_hd = this.hYearLength_ms / this.hDayLength_ms - (this.nominalMonthLength_ms / this.hDayLength_ms) * this.monthCount;
        let excessYearRemainder = (this.yearLength_ms % this.hYearLength_ms) / this.hDayLength_ms - 1 / this.leapYearFreq_hd[0] - 1 / this.leapYearFreq_hd[1];
        // Length of time between leap years in ms
        this.leapYearBlocks_ms.push(this.leapYearFreq_hd[0] * this.hYearLength_ms + this.hDayLength_ms);
        this.leapYearBlocks_ms.push(Math.floor(this.leapYearFreq_hd[1] / this.leapYearFreq_hd[0]) * this.leapYearBlocks_ms.at(-1) +
            (this.leapYearFreq_hd[1] % this.leapYearFreq_hd[0]) * this.hYearLength_ms +
            this.hDayLength_ms);
        // Fudge factors
        this.initialWeekDay = initialWeekDay;
        this.initialYearProgress = initialYearProgress;
    }
    calculateWeek(offsetFrom24h_h, solarDaysPerWeek) {
        let minWeekLength = 4;
        let lowerLimit = (this.dayLength_ms * solarDaysPerWeek) / ((24 - offsetFrom24h_h) * 3600 * 1000);
        let upperLimit = (this.dayLength_ms * solarDaysPerWeek) / ((24 + offsetFrom24h_h) * 3600 * 1000);
        if (Math.floor(lowerLimit) > upperLimit && Math.floor(lowerLimit) > minWeekLength) {
            // Valid week length (also longer than the minimum length)
            this.weekLength_d = solarDaysPerWeek;
            this.weekLength_hd = Math.floor(lowerLimit);
            this.hDayLength_ms = Math.floor((this.dayLength_ms * solarDaysPerWeek) / (this.weekLength_hd * 1000)) * 1000;
        }
        else {
            if (solarDaysPerWeek < 100) {
                this.calculateWeek(offsetFrom24h_h, solarDaysPerWeek + 1);
            }
            else {
                console.log("Week length not found for " + this.name);
                this.hDayLength_ms = 0;
                this.weekLength_d = 0;
                this.weekLength_hd = 0;
            }
        }
    }
    setPhysicalParameters(GM_km3_S2, radius_km) {
        this.GM_km3_s2 = GM_km3_S2;
        this.radius_km = radius_km;
        this.surface_gravity_ms = (GM_km3_S2 / radius_km ** 2) * 1000;
    }
    setJ2000OrbitalElements(a_km, e, i_deg, longitudeOfAscendingNode_deg, argumentOfPeriapsis_deg) {
        this.semiMajorAxis_0_km = a_km;
        this.eccentricity_0 = e;
        this.inclination_0_deg = i_deg;
        this.longitudOfAscendingNode_0_deg = longitudeOfAscendingNode_deg;
        this.argumentOfPeriapsis_0_deg = argumentOfPeriapsis_deg;
        this.trueAnomaly_0_deg = 0;
        this.semiMajorAxis_km_Cy = 0;
        this.eccentricity_Cy = 0;
        this.inclination_sec_Cy = 0;
        this.longitudOfAscendingNode_sec_Cy = 0;
        this.argumentOfPeriapsis_sec_Cy = 0;
        this.trueAnomaly_sec_Cy = 0;
    }
    setTrueAnomaly(trueAnomaly_deg, trueAnomaly_sec_Cy = 0) {
        this.trueAnomaly_0_deg = trueAnomaly_deg;
        this.trueAnomaly_sec_Cy = trueAnomaly_sec_Cy;
    }
}
let bodies = {};
// Celestial Bodies (name, dayLength, yearLength, initialYearProgress, initialWeekDay)
bodies["Earth"] = new Celestial("Earth", 24, 365.256363004 * 24, 0, 6);
bodies["Mars"] = new Celestial("Mars", 24.65979, 668.5991 * 24.623, 0, 0);
// var Venus = new Celestial("Venus", 116.75 * 24, 5832.6, 0, 0, 0);
bodies["Ceres"] = new Celestial("Ceres", 9.07417, 1683.14570801 * 24, 0, 0);
bodies["Europa"] = new Celestial("Europa", 3.551181 * 24, 4332.59 * 24, 0, 0);
bodies["Ganymede"] = new Celestial("Ganymede", 7.15455296 * 24, 4332.59 * 24, 0, 0);
bodies["Callisto"] = new Celestial("Callisto", 16.6890184 * 24, 4332.59 * 24, 0, 0);
bodies["Titan"] = new Celestial("Titan", 15.945 * 24, 10759.22 * 24, 0, 0);
bodies["Enceladus"] = new Celestial("Enceladus", 1.370218 * 24, 10759.22 * 24, 0, 0);
bodies["Titania"] = new Celestial("Titania", 8.706234 * 24, 30688.5 * 24, 0, 0);
bodies["Triton"] = new Celestial("Triton", 5.876854 * 24, 60182 * 24, 0, 0);
// Data from https://ssd.jpl.nasa.gov/horizons/app.html#/
bodies["Earth"].setPhysicalParameters(398600.435436, 6378.137);
bodies["Earth"].setJ2000OrbitalElements(1.496534962738141e8, 1.704239718110438e-2, 2.668809336274974e-4, 1.639748712430063e2, 2.977671795415902e2);
bodies["Earth"].setTrueAnomaly(3.581260865474801e2);
bodies["Mars"].setPhysicalParameters(42828.375214, 3396.19);
bodies["Mars"].setJ2000OrbitalElements(2.279390120013493e8, 9.33146065415545e-2, 1.849876654038142, 4.956199905920329e1, 2.865373583154345e2);
bodies["Mars"].setTrueAnomaly(2.302024685501411e1);
let jsonString = "export const space_time = ";
jsonString += JSON.stringify(bodies);
fs.writeFile("celestial_data.js", jsonString, (err) => {
    if (err)
        throw err;
    console.log("Data written to file");
});
