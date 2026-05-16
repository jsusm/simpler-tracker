import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { getActivitySF } from "#/features/activities/server/activities";

export const Route = createFileRoute("/activities/$activityId")({
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
			<div className="mx-auto max-w-3xl space-y-6">
				<Button variant="ghost" asChild>
					<Link to="/activities">
						<ArrowLeftIcon />
						Back to activities
					</Link>
				</Button>

				<Card>
					<CardHeader className="gap-4">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div className="space-y-2">
								<CardTitle className="text-3xl tracking-tight">
									{activity.title}
								</CardTitle>
								<CardDescription className="text-base">
									{activity.description || "No description provided."}
								</CardDescription>
							</div>
							<div className="flex gap-2">
								<Button variant="outline">
									<PencilIcon />
									Update
								</Button>
								<Button variant="destructive">
									<Trash2Icon />
									Delete
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<Separator />
						<section className="space-y-3">
							<div>
								<h2 className="font-semibold text-lg">Tracking</h2>
								<p className="text-muted-foreground text-sm">
									Metrics configured for this activity.
								</p>
							</div>

							{metrics.length === 0 ? (
								<div className="rounded-lg border border-dashed p-6 text-muted-foreground text-sm">
									No metrics configured yet.
								</div>
							) : (
								<ul className="space-y-3">
									{metrics.map((metric) => {
										if (!metric) return null;

										return (
											<li
												className="rounded-lg border bg-card p-4"
												key={metric.id}
											>
												<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
													<div>
														<p className="font-medium">{metric.label}</p>
														<p className="text-muted-foreground text-sm capitalize">
															{metric.type} metric
														</p>
													</div>
													{metric.type === "qualitative" ? (
														<div className="flex flex-wrap gap-2">
															{metric.labels.map((label) => (
																<span
																	className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground text-xs"
																	key={label.id}
																>
																	{label.label}
																</span>
															))}
														</div>
													) : null}
												</div>
											</li>
										);
									})}
								</ul>
							)}
						</section>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
