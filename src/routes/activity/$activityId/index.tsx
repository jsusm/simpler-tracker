import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { TrackingCard } from "#/features/activities/components/TrackingCard";
import {
	deleteActivitySF,
	getActivitySF,
} from "#/features/activities/server/activities";
import { RecordsTableCard } from "#/features/records/components/RecordsTableCard";
import { listRecordsSF } from "#/features/records/server/records";

export const Route = createFileRoute("/activity/$activityId/")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const [activityData, records] = await Promise.all([
			getActivitySF({ data: { activityId: params.activityId } }),
			listRecordsSF({ data: { activityId: params.activityId } }),
		]);

		return { ...activityData, records };
	},
});

function RouteComponent() {
	const { activity: activities, metrics, records } = Route.useLoaderData();
	const params = Route.useParams();
	const navigate = useNavigate();

	const { mutateAsync: deleteActivityMutation } = useMutation({
		mutationFn: deleteActivitySF,
		onSuccess() {
			navigate({ to: "/activities" });
		},
	});

	const handleDeleteActivity = () => {
		deleteActivityMutation({ data: { activityId: params.activityId } });
	};

	const activity = activities.at(0);

	if (!activity) {
		return (
			<main className="min-h-svh bg-background px-2 py-10 md:p-10">
				<div className="mx-auto max-w-3xl space-y-6">
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
		<main className="min-h-svh bg-background px-2 py-10 md:p-10">
			<div className="mx-auto max-w-5xl space-y-6">
				<Button variant="link" asChild>
					<Link to="/activities">
						<ArrowLeftIcon />
						Back to activities
					</Link>
				</Button>

				<div className="space-y-6">
					<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h1 className="scroll-m-20 text-2xl font-medium tracking-tight">
								{activity.title}
							</h1>
							<p className="text-base text-muted-foreground">
								{activity.description || "No description provided."}
							</p>
						</div>

						<div className="flex gap-2">
							<Button variant="outline" asChild>
								<Link
									to="/activity/$activityId/update"
									params={{ activityId: activity.id.toString() }}
								>
									<PencilIcon />
									Update
								</Link>
							</Button>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive">
										<Trash2Icon />
										Delete
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent size="sm">
									<AlertDialogHeader>
										<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
											<Trash2Icon />
										</AlertDialogMedia>
										<AlertDialogTitle>Delete Activity?</AlertDialogTitle>
										<AlertDialogDescription>
											This will delete all the metrics and records you have
											registered.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel variant="outline">
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											variant="destructive"
											onClick={handleDeleteActivity}
										>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</header>
					<Separator />
					<TrackingCard metrics={metrics} />
					<RecordsTableCard metrics={metrics} records={records} />
					<div className="space-y-3"></div>
				</div>
			</div>
		</main>
	);
}
