import * as fs from "fs";

class Celestial {
	name: string; // Name of the celestial body

	generatedTimeZone = true;

	dayLength_ms: number; // Length of a solar day in milliseconds
	hDayLength_ms: number; // Length of a human day in milliseconds

	initialWeekDay: number; // Day of the week that the date 1/1/0 landed on
	weekLength_d: number; // Length of a week in solar days
	weekLength_hd: number; // Length of a week in human days

	monthCount: number; // Number of months in a year
	nominalMonthLength_hd: number; // Minimum month length in human days
	nominalMonthLength_ms: number; // Minimum month length in milliseconds
	monthRemainder_hd: number; // Number of days left over in the year due to splitting it up into equal length months

	initialYearProgress: number; // Units TBD
	yearLength_ms: number;
	yearLength_hd: number;
	hYearLength_ms: number;

	leapYearFreq_hd: number[]; // Human days between leap years for each interval
	leapYearBlocks_ms: number[]; // For each leap year interval, how many ms between a leap year

	// Physical properties
	radius_km: number;
	surface_gravity_ms: number;
	GM_km3_s2: number;

	// Orbital elements at J2000
	semiMajorAxis_0_km: number;
	eccentricity_0: number;
	inclination_0_deg: number;
	longitudOfAscendingNode_0_deg: number;
	argumentOfPeriapsis_0_deg: number;
	trueAnomaly_0_deg: number;
	meanAnomaly_0_deg: number;
	// Orbital elements centeniary rates
	semiMajorAxis_km_Cy: number;
	eccentricity_Cy: number;
	inclination_sec_Cy: number;
	longitudOfAscendingNode_sec_Cy: number;
	argumentOfPeriapsis_sec_Cy: number;
	trueAnomaly_sec_Cy: number;

	period_ms: number;
	constructor(name: string, dayLength_h: number = 0, yearLength_h: number = 0, initialYearProgress = 0, initialWeekDay = 0) {
		this.name = name;

		if (dayLength_h === 0 && yearLength_h === 0) {
			this.generatedTimeZone = false;
			return;
		}

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
		} else {
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

		let yearRemainder_hd: number[] = [];
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
		this.leapYearBlocks_ms.push(
			Math.floor(this.leapYearFreq_hd[1] / this.leapYearFreq_hd[0]) * this.leapYearBlocks_ms.at(-1) +
				(this.leapYearFreq_hd[1] % this.leapYearFreq_hd[0]) * this.hYearLength_ms +
				this.hDayLength_ms
		);

		// Fudge factors
		this.initialWeekDay = initialWeekDay;
		this.initialYearProgress = initialYearProgress;
	}
	calculateWeek(offsetFrom24h_h: number, solarDaysPerWeek: number) {
		let minWeekLength = 4;
		let lowerLimit = (this.dayLength_ms * solarDaysPerWeek) / ((24 - offsetFrom24h_h) * 3600 * 1000);
		let upperLimit = (this.dayLength_ms * solarDaysPerWeek) / ((24 + offsetFrom24h_h) * 3600 * 1000);

		if (Math.floor(lowerLimit) > upperLimit && Math.floor(lowerLimit) > minWeekLength) {
			// Valid week length (also longer than the minimum length)
			this.weekLength_d = solarDaysPerWeek;
			this.weekLength_hd = Math.floor(lowerLimit);
			this.hDayLength_ms = Math.floor((this.dayLength_ms * solarDaysPerWeek) / (this.weekLength_hd * 1000)) * 1000;
		} else {
			if (solarDaysPerWeek < 100) {
				this.calculateWeek(offsetFrom24h_h, solarDaysPerWeek + 1);
			} else {
				console.log("Week length not found for " + this.name);
				this.hDayLength_ms = 0;
				this.weekLength_d = 0;
				this.weekLength_hd = 0;
			}
		}
	}
	setPhysicalParameters(GM_km3_S2: number, radius_km: number) {
		this.GM_km3_s2 = GM_km3_S2;
		this.radius_km = radius_km;
		this.surface_gravity_ms = (GM_km3_S2 / radius_km ** 2) * 1000;

		if (this.semiMajorAxis_0_km != undefined) this.period_ms = 2 * Math.PI * (this.semiMajorAxis_0_km ** 3 / this.GM_km3_s2) ** 0.5 * 1000;
	}
	setJ2000OrbitalElements(a_km: number, e: number, i_deg: number, longitudeOfAscendingNode_deg: number, argumentOfPeriapsis_deg: number) {
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

		if (this.GM_km3_s2 != undefined) this.period_ms = 2 * Math.PI * (this.semiMajorAxis_0_km ** 3 / this.GM_km3_s2) ** 0.5 * 1000;
	}
	setTrueAnomaly(trueAnomaly_deg: number, trueAnomaly_sec_Cy: number = 0) {
		this.trueAnomaly_0_deg = trueAnomaly_deg;
		this.trueAnomaly_sec_Cy = trueAnomaly_sec_Cy;

		let eccentricAnomaly_deg = Math.acos(
			(this.eccentricity_0 + Math.cos(degToRad(this.meanAnomaly_0_deg))) / (1 + this.eccentricity_0 * Math.cos(this.meanAnomaly_0_deg))
		);
		this.meanAnomaly_0_deg = eccentricAnomaly_deg - this.eccentricity_0 * Math.cos(degToRad(eccentricAnomaly_deg));
	}
}

function degToRad(degrees: number) {
	return degrees * (Math.PI / 180);
}

function radToDeg(degrees: number) {
	return degrees * (180 / Math.PI);
}

let bodies: { [name: string]: Celestial } = {};

// Celestial Bodies (name, dayLength, yearLength, initialYearProgress, initialWeekDay)
bodies["Mercury"] = new Celestial("Mercury");
bodies["Venus"] = new Celestial("Venus");
// bodies["Venus"] = new Celestial("Venus", 116.75 * 24, 5832.6, 0, 0, 0);
bodies["Earth"] = new Celestial("Earth", 24, 365.256363004 * 24, 0, 6);
bodies["Mars"] = new Celestial("Mars", 24.65979, 668.5991 * 24.623, 0, 0);

bodies["Ceres"] = new Celestial("Ceres", 9.07417, 1683.14570801 * 24, 0, 0);

bodies["Jupiter"] = new Celestial("Jupiter");
bodies["Europa"] = new Celestial("Europa", 3.551181 * 24, 4332.59 * 24, 0, 0);
bodies["Ganymede"] = new Celestial("Ganymede", 7.15455296 * 24, 4332.59 * 24, 0, 0);
bodies["Callisto"] = new Celestial("Callisto", 16.6890184 * 24, 4332.59 * 24, 0, 0);

bodies["Saturn"] = new Celestial("Saturn");
bodies["Titan"] = new Celestial("Titan", 15.945 * 24, 10759.22 * 24, 0, 0);
bodies["Enceladus"] = new Celestial("Enceladus", 1.370218 * 24, 10759.22 * 24, 0, 0);

bodies["Uranus"] = new Celestial("Uranus");
bodies["Titania"] = new Celestial("Titania", 8.706234 * 24, 30688.5 * 24, 0, 0);

bodies["Neptune"] = new Celestial("Neptune");
bodies["Triton"] = new Celestial("Triton", 5.876854 * 24, 60182 * 24, 0, 0);

// Data from https://ssd.jpl.nasa.gov/horizons/app.html#/
bodies["Mercury"].setPhysicalParameters(22031.86855, 2440);
bodies["Mercury"].setJ2000OrbitalElements(5.790907025241733e7, 2.056302515978038e-1, 7.005014362233553, 4.833053877672862e1, 2.912427943500334e1);
bodies["Mercury"].setTrueAnomaly(1.751155302923815e2);

bodies["Venus"].setPhysicalParameters(324858.592, 6051.893);
bodies["Venus"].setJ2000OrbitalElements(1.082081565316098e8, 6.755697268576816e-3, 3.394589632757466, 7.66783751109416e1, 5.518541504725159e1);
bodies["Venus"].setTrueAnomaly(4.990452231912491e1);

bodies["Earth"].setPhysicalParameters(398600.435436, 6378.137);
bodies["Earth"].setJ2000OrbitalElements(1.496534962738141e8, 1.704239718110438e-2, 2.668809336274974e-4, 1.639748712430063e2, 2.977671795415902e2);
bodies["Earth"].setTrueAnomaly(3.581260865474801e2);

bodies["Mars"].setPhysicalParameters(42828.375214, 3396.19);
bodies["Mars"].setJ2000OrbitalElements(2.279390120013493e8, 9.33146065415545e-2, 1.849876654038142, 4.956199905920329e1, 2.865373583154345e2);
bodies["Mars"].setTrueAnomaly(2.302024685501411e1);

bodies["Ceres"].setPhysicalParameters(62.6325, 469.7);
bodies["Ceres"].setJ2000OrbitalElements(4.138616544134015e8, 7.837505504042046e-2, 1.058336067354914e1, 8.049436497118826e1, 7.392278732202695e1);
bodies["Ceres"].setTrueAnomaly(7.121193766358798);

bodies["Jupiter"].setPhysicalParameters(126686531.9, 71492);
bodies["Jupiter"].setJ2000OrbitalElements(7.786731611090481e8, 4.892305962953223e-2, 1.304655711046047, 1.004888615724618e2, 2.751197059498091e2);
bodies["Jupiter"].setTrueAnomaly(2.063463654069944e1);

bodies["Saturn"].setPhysicalParameters(37931206.234, 60268);
bodies["Saturn"].setJ2000OrbitalElements(1.433364815997285e9, 5.559928887285597e-2, 2.48436877980734, 1.136930130794106e2, 3.359006492558044e2);
bodies["Saturn"].setTrueAnomaly(3.160917716241848e2);

bodies["Uranus"].setPhysicalParameters(5793951.256, 25559);
bodies["Uranus"].setJ2000OrbitalElements(2.876758957338404e9, 4.439336258840319e-2, 7.723604869115734e-1, 7.396006633963485e1, 9.661122696481169e1);
bodies["Uranus"].setTrueAnomaly(1.458440420932308e2);

bodies["Neptune"].setPhysicalParameters(6835099.97, 24766);
bodies["Neptune"].setJ2000OrbitalElements(4.503002396427352e9, 1.127490587339749e-2, 1.764331194766304, 1.318103417756993e2, 2.66115451343762e2);
bodies["Neptune"].setTrueAnomaly(2.659963939182547e2);

let jsonString = "export const space_time = ";
jsonString += JSON.stringify(bodies);

fs.writeFile("celestial_data.js", jsonString, (err) => {
	if (err) throw err;
	console.log("Data written to file");
});
