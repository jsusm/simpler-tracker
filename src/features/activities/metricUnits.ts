export const numericUnitValues = [
	"unit",
	"kilometer",
	"meter",
	"mile",
	"foot",
	"hour",
	"minute",
	"day",
	"second",
	"celsius",
	"fahrenheit",
	"calorie",
] as const;

export type NumericUnitValue = (typeof numericUnitValues)[number];

export function isNumericUnitValue(value: string): value is NumericUnitValue {
	return numericUnitValues.includes(value as NumericUnitValue);
}

export const numericUnitOptions: Array<{
	label: string;
	value: NumericUnitValue;
}> = [
	{ label: "Unit", value: "unit" },
	{ label: "Kilometers", value: "kilometer" },
	{ label: "Meters", value: "meter" },
	{ label: "Miles", value: "mile" },
	{ label: "Feet", value: "foot" },
	{ label: "Hours", value: "hour" },
	{ label: "Minutes", value: "minute" },
	{ label: "Days", value: "day" },
	{ label: "Seconds", value: "second" },
	{ label: "Degrees Celsius", value: "celsius" },
	{ label: "Fahrenheit", value: "fahrenheit" },
	{ label: "Calories", value: "calorie" },
];
