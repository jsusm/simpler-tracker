import { createFileRoute } from "@tanstack/react-router";
import { useReducer } from "react";
import { ActivityForm } from "#/components/blocks/ActivityForm";
import { ActivityFormCheckout } from "#/components/blocks/ActivityFormCheckout";
import { MetricForm } from "#/components/blocks/MetricForm";
import {
	type CreateActivityDispatcherType,
	CreateActivityStepFormReducer,
	type CreateActivityStepFormStateType,
	type CreateActivityStepFormStepState,
} from "#/hooks/useCreateActivityFormState";
import { getActivitySF } from "#/server/activities";

export const Route = createFileRoute("/activity/$activityId/update")({
	component: RouteComponent,
	loader: async ({ params }) => {
		return await getActivitySF({ data: { activityId: params.activityId } });
	},
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

type UpdateActivity = {
	id: number;
	title: string;
	description: string | null;
};

type UpdateActivityMetric = {
	id: number;
	label: string;
	type: "numeric" | "qualitative";
	labels: {
		id: number;
		label: string;
		order: number;
	}[];
} | null;

function RouteComponent() {
	const { activity: activities, metrics } = Route.useLoaderData();
	const activity = activities.at(0);

	if (!activity) {
		return (
			<main className="flex min-h-svh items-center justify-center bg-muted px-2 py-10 md:p-10">
				<p className="text-muted-foreground">Activity not found.</p>
			</main>
		);
	}

	return <UpdateActivityForm activity={activity} metrics={metrics} />;
}

function UpdateActivityForm({
	activity,
	metrics,
}: {
	activity: UpdateActivity;
	metrics: UpdateActivityMetric[];
}) {
	const initialFormState: CreateActivityStepFormStateType = {
		data: {
			title: activity.title,
			description: activity.description ?? "",
			metrics: metrics.flatMap((metric) => {
				if (!metric) return [];

				return {
					id: metric.id,
					label: metric.label,
					type: metric.type,
					qualitativeLabels: metric.labels
						.toSorted((a, b) => a.order - b.order)
						.map((label, index) => ({
							id: label.id,
							label: label.label,
							order: index,
						})),
				};
			}),
		},
		history: [],
		stepState: { state: "activityForm", updateMetricIdx: undefined },
	};

	const [formState, stepFormDispatcher] = useReducer(
		CreateActivityStepFormReducer,
		initialFormState,
	);
	const CurrComp = activityFormStateComponents[formState.stepState.state];

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted px-2 py-10 md:p-10">
			<div className="flex w-full max-w-md flex-col gap-6">
				<CurrComp
					activityId={activity.id}
					dispatcher={stepFormDispatcher}
					formState={formState}
					variant="update"
				/>
			</div>
		</div>
	);
}
