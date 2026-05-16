import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useReducer } from "react";
import { Button } from "#/components/ui/button";
import { ActivityForm } from "#/features/activities/components/ActivityForm";
import { ActivityFormCheckout } from "#/features/activities/components/ActivityFormCheckout";
import { MetricForm } from "#/features/activities/components/MetricForm";
import {
	type CreateActivityDispatcherType,
	CreateActivityStepFormReducer,
	type CreateActivityStepFormStateType,
	type CreateActivityStepFormStepState,
} from "#/features/activities/hooks/useActivityWizardState";
import { isNumericUnitValue } from "#/features/activities/metricUnits";
import { getActivitySF } from "#/features/activities/server/activities";

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
	numericUnit: string;
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
					numericUnit: isNumericUnitValue(metric.numericUnit)
						? metric.numericUnit
						: "unit",
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
			<div className="flex w-full max-w-md flex-col gap-2">
				<Button variant="link" className="w-fit px-0" asChild>
					<Link
						to="/activity/$activityId"
						params={{ activityId: activity.id.toString() }}
					>
						<ArrowLeftIcon />
						Back to activity
					</Link>
				</Button>
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
