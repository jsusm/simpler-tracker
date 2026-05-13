import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "#/components/ui/item";
import { Separator } from "#/components/ui/separator";
import { getActivitySF } from "#/server/activities";

export const Route = createFileRoute("/activity/$activityId/")({
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
							<Button variant="destructive">
								<Trash2Icon />
								Delete
							</Button>
						</div>
					</header>
					<Separator />
					<Card>
						<CardHeader>
							<CardTitle>Tracking</CardTitle>
							<CardDescription>
								Metrics configured for this activity.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{metrics.length === 0 ? (
								<div className="rounded-lg border border-dashed p-6 text-muted-foreground text-sm">
									No metrics configured yet.
								</div>
							) : (
								<ItemGroup className="gap-2">
									{metrics.map((metric) => {
										if (!metric) return null;
										return (
											<Item variant="outline" key={metric.id}>
												<ItemContent className="flex-row gap-2 items-center">
													<ItemTitle className="leading-normal">
														{metric.label}
													</ItemTitle>
													<ItemDescription>
														{metric.type === "numeric"
															? "Numeric"
															: metric.labels.map((l) => l.label).join(",")}
													</ItemDescription>
												</ItemContent>
											</Item>
										);
									})}
								</ItemGroup>
							)}
						</CardContent>
					</Card>
					<div className="space-y-3"></div>
				</div>
			</div>
		</main>
	);
}
