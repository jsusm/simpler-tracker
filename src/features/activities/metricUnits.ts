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

const numericUnitSuffixes: Record<NumericUnitValue, string> = {
	unit: "unit",
	kilometer: "km",
	meter: "m",
	mile: "mi",
	foot: "ft",
	hour: "h",
	minute: "min",
	day: "d",
	second: "s",
	celsius: "°C",
	fahrenheit: "°F",
	calorie: "Cal",
};

export function getNumericUnitSuffix(value: string) {
	return isNumericUnitValue(value) ? numericUnitSuffixes[value] : "unit";
}
