import { createClientOnlyFn } from "@tanstack/react-start";
import type { ActionDispatch } from "react";
import * as z from "zod";

export type CreateActivityStepFormStepState = {
	state: "activityForm" | "metricForm" | "checkout";
	updateMetricIdx?: number | undefined;
};

const metricValues = ["numeric", "qualitative"] as const;
type metricValuesType = (typeof metricValues)[number];

export type CreateActivityStepFormStateType = {
	data: {
		title: string;
		description: string;
		metrics: {
			label: string;
			type: metricValuesType;
			qualitativeLabels: string[];
		}[];
	};
	stepState: CreateActivityStepFormStepState;
	history: CreateActivityStepFormStepState[];
};

const createActivityStepFormStateSchema = z.object({
	data: z.object({
		title: z.string(),
		description: z.string(),
		metrics: z.array(
			z.object({
				label: z.string(),
				type: z.enum(metricValues),
				qualitativeLabels: z.array(z.string()),
			}),
		),
	}),
	stepState: z.object({
		state: z.enum(["activityForm", "metricForm", "checkout"]),
		updateMetricIdx: z.number().optional(),
	}),
	history: z.array(
		z.object({
			state: z.enum(["activityForm", "metricForm", "checkout"]),
			updateMetricIdx: z.number().optional(),
		}),
	),
});

const defaultCreateActivityStateValues = {
	data: { description: "", title: "", metrics: [] },
	history: [],
	stepState: { state: "activityForm" as const, updateMetricIdx: undefined },
};

export const getSessionCreateActivityStepFormState = createClientOnlyFn(
	(): CreateActivityStepFormStateType => {
		const sessionStorageData = sessionStorage.getItem("CreateMetricFormState");
		if (sessionStorageData) {
			const data = createActivityStepFormStateSchema.safeParse(
				JSON.parse(sessionStorageData),
			);
			if (data.success) {
				return data.data;
			}
		}
		return defaultCreateActivityStateValues;
	},
);

export const saveSessionCreateActivityStepFormState = createClientOnlyFn(
	(state: CreateActivityStepFormStateType) => {
		sessionStorage.setItem("CreateMetricFormState", JSON.stringify(state));
	},
);

export const clearSessionCreateActivityStepFormState = createClientOnlyFn(
	() => {
		sessionStorage.removeItem("CreateMetricFormState");
	},
);

export type CreateActivityStepFormActionType =
	| { type: "setActivityDone"; payload: { title: string; description: string } }
	| { type: "removeMetric"; payload: { idx: number } }
	| {
			type: "addMetricDone";
			payload: {
				label: string;
				type: metricValuesType;
				qualitativeLabels: string[];
			};
	  }
	| { type: "removeMetricDone" }
	| { type: "goToActivityForm" }
	| { type: "goToMetric"; payload: { idx: number } }
	| { type: "goBack" }
	| { type: "goToAddNewMetric" };

export function CreateActivityStepFormReducer(
	state: CreateActivityStepFormStateType,
	action: CreateActivityStepFormActionType,
): CreateActivityStepFormStateType {
	if (action.type === "setActivityDone") {
		let nextStep: CreateActivityStepFormStepState["state"] = "metricForm";
		if (state.data.metrics.length > 0) {
			nextStep = "checkout";
		}

		return {
			...state,
			data: {
				...state.data,
				title: action.payload.title,
				description: action.payload.description,
			},
			stepState: { updateMetricIdx: undefined, state: nextStep },
			history: [...state.history, state.stepState],
		};
	}
	if (action.type === "addMetricDone") {
		if (state.stepState.updateMetricIdx === undefined) {
			return {
				...state,
				data: {
					...state.data,
					metrics: [...state.data.metrics, { ...action.payload }],
				},
				stepState: { updateMetricIdx: undefined, state: "checkout" },
				history: [...state.history, state.stepState],
			};
		}
		return {
			...state,
			data: {
				...state.data,
				metrics: state.data.metrics.map((m, idx) =>
					idx === state.stepState.updateMetricIdx ? { ...action.payload } : m,
				),
			},
			stepState: { updateMetricIdx: undefined, state: "checkout" },
			history: [...state.history, state.stepState],
		};
	}
	if (action.type === "removeMetric") {
		let nextStep: CreateActivityStepFormStepState["state"] = "checkout";
		if (state.data.metrics.length <= 1) {
			nextStep = "metricForm";
		}

		return {
			...state,
			data: {
				...state.data,
				metrics: state.data.metrics.filter(
					(_, idx) => idx !== action.payload.idx,
				),
			},
			stepState: { updateMetricIdx: undefined, state: nextStep },
			history: state.history.filter(
				(e) => e.updateMetricIdx !== action.payload.idx,
			),
		};
	}

	if (action.type === "removeMetricDone") {
		if (state.stepState.updateMetricIdx === undefined) {
			throw new Error("Trying to update a not defined metric");
		}
		return {
			...state,
			data: {
				...state.data,
				metrics: state.data.metrics.filter(
					(_, idx) => idx !== state.stepState.updateMetricIdx,
				),
			},
			stepState: { updateMetricIdx: undefined, state: "checkout" },
			history: state.history.filter(
				(e) => e.updateMetricIdx !== state.stepState.updateMetricIdx,
			),
		};
	}
	if (action.type === "goToActivityForm") {
		return {
			...state,
			stepState: { updateMetricIdx: undefined, state: "activityForm" },
			history: [...state.history, state.stepState],
		};
	}
	if (action.type === "goToMetric") {
		return {
			...state,
			stepState: { updateMetricIdx: action.payload.idx, state: "metricForm" },
			history: [...state.history, state.stepState],
		};
	}
	if (action.type === "goToAddNewMetric") {
		return {
			...state,
			stepState: { updateMetricIdx: undefined, state: "metricForm" },
			history: [...state.history, state.stepState],
		};
	}
	if (action.type === "goBack") {
		let lastState = state.history.at(state.history.length - 1);
		if (lastState === undefined) {
			lastState = { state: "activityForm" };
		}
		return {
			...state,
			stepState: lastState,
			history: state.history.slice(0, state.history.length - 1),
		};
	}
	return { ...state };
}

export function getDefaultActivityMetricValuesFromState(
	state: CreateActivityStepFormStateType,
) {
	const defaultValues = {
		label: "",
		type: "",
		qualitativeLabels: [] as string[],
	};
	if (state.stepState.updateMetricIdx !== undefined) {
		const stateMetric = state.data.metrics[state.stepState.updateMetricIdx];
		if (stateMetric) {
			return stateMetric;
		}
	}
	return defaultValues;
}

export type CreateActivityDispatcherType = ActionDispatch<
	[action: CreateActivityStepFormActionType]
>;
