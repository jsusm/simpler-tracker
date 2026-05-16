import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Button } from "#/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

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
			<div className="flex w-full max-w-md flex-col gap-2">
				<Button variant="link" className="w-fit px-0" asChild>
					<Link
						to="/activities"
					>
						<ArrowLeftIcon />
						Back to activities
					</Link>
				</Button>
				<CurrComp
					dispatcher={stepFormDispatcher}
					formState={formState}
					variant="create"
				/>
			</div>
		</div>
	);
}
