import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer } from "react";
import { ActivityForm } from "#/features/activities/components/ActivityForm";
import { ActivityFormCheckout } from "#/features/activities/components/ActivityFormCheckout";
import { MetricForm } from "#/features/activities/components/MetricForm";
import {
	type CreateActivityDispatcherType,
	CreateActivityStepFormReducer,
	type CreateActivityStepFormStateType,
	type CreateActivityStepFormStepState,
	getSessionCreateActivityStepFormState,
	saveSessionCreateActivityStepFormState,
} from "#/features/activities/hooks/useActivityWizardState";

export const Route = createFileRoute("/activities/create")({
	component: RouteComponent,
	ssr: "data-only",
});

const activityFormStateComponents: {
	[key in CreateActivityStepFormStepState["state"]]: React.FC<{
		dispatcher: CreateActivityDispatcherType;
		formState: CreateActivityStepFormStateType;
		variant: "create" | "update";
		activityId?: number;
	}>;
} = {
	activityForm: ActivityForm,
	checkout: ActivityFormCheckout,
	metricForm: MetricForm,
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
				<CurrComp
					dispatcher={stepFormDispatcher}
					formState={formState}
					variant="create"
				/>
			</div>
		</div>
	);
}
