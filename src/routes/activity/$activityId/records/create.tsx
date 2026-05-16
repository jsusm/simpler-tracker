import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { getActivitySF } from "#/features/activities/server/activities";
import { CreateRecordForm } from "#/features/records/components/CreateRecordForm";

export const Route = createFileRoute("/activity/$activityId/records/create")({
	component: RouteComponent,
	loader: async ({ params }) => {
		return await getActivitySF({ data: { activityId: params.activityId } });
	},
});

function RouteComponent() {
	const { activity: activities, metrics } = Route.useLoaderData();
	const activity = activities.at(0);

	if (!activity) {
		return (
			<main className="min-h-svh bg-muted px-2 py-10 md:p-10">
				<div className="mx-auto max-w-md space-y-6">
					<Button variant="ghost" asChild>
						<Link to="/activities">
							<ArrowLeftIcon />
							Back to activities
						</Link>
					</Button>
					<Card>
						<CardHeader>
							<CardTitle>Activity not found</CardTitle>
							<CardDescription>
								The activity you are looking for does not exist.
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</main>
		);
	}

	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted px-2 py-10 md:p-10">
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
				<CreateRecordForm activity={activity} metrics={metrics} />
			</div>
		</main>
	);
}
