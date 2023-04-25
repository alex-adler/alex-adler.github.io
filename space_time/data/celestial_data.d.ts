declare type body_type = {
	name: string;
	dayLength_ms: number;
	yearLength_ms: number;
	yearLength_hd: number;
	hDayLength_ms: number;
	weekLength_d: number;
	weekLength_hd: number;
	hYearLength_ms: number;
	monthCount: number;
	nominalMonthLength_hd: number;
	nominalMonthLength_ms: number;
	leapYearFreq_hd: number[];
	leapYearBlocks_ms: number[];
	monthRemainder_hd: number;
	initialWeekDay: number;
	initialYearProgress: number;
	// Orbital elements at J2000
	semiMajorAxis_0_km: number;
	eccentricity_0: number;
	inclination_0_deg: number;
	longitudOfAscendingNode_0_deg: number;
	argumentOfPeriapsis_0_deg: number;
	trueAnomaly_0_deg: number;
};
export type body_dict_type = { [name: string]: body_type };
export const space_time: body_dict_type;
