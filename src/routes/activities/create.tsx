import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer } from "react";
import { ActivityFormCheckout } from "#/components/blocks/ActivityFormCheckout";
import { CreateActivityForm } from "#/components/blocks/CreateActivityForm";
import { CreateMetricForm } from "#/components/blocks/CreateMetricForm";
import {
	type CreateActivityDispatcherType,
	CreateActivityStepFormReducer,
	type CreateActivityStepFormStateType,
	type CreateActivityStepFormStepState,
	getSessionCreateActivityStepFormState,
	saveSessionCreateActivityStepFormState,
} from "#/hooks/useCreateActivityFormState";

export const Route = createFileRoute("/activities/create")({
	component: RouteComponent,
	ssr: "data-only",
});

const activityFormStateComponents: {
	[key in CreateActivityStepFormStepState["state"]]: React.FC<{
		dispatcher: CreateActivityDispatcherType;
		formState: CreateActivityStepFormStateType;
	}>;
} = {
	activityForm: CreateActivityForm,
	checkout: ActivityFormCheckout,
	metricForm: CreateMetricForm,
};

function RouteComponent() {
	const [formState, stepFormDispatcher] = useReducer(
		CreateActivityStepFormReducer,
		getSessionCreateActivityStepFormState(),
	);

	useEffect(() => {
		saveSessionCreateActivityStepFormState(formState);
	}, [formState]);

	const CurrComp = activityFormStateComponents[formState.stepState.state];
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted px-2 py-10 md:p-10">
			<div className="flex w-full max-w-md flex-col gap-6">
				<CurrComp formState={formState} dispatcher={stepFormDispatcher} />
			</div>
		</div>
	);
}
