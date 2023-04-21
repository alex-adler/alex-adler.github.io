declare type body_type = {
	day_length_ms: number;
	year_length_ms: number;
	year_length_hd: number;
	h_day_length_ms: number;
	week_length_d: number;
	week_length_hd: number;
	month_count: number;
	nominal_month_length_hd: number;
};
export type body_dict_type = { [name: string]: body_type };
export const space_time: body_dict_type;
