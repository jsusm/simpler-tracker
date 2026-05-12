import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowUpRightIcon,
	ChevronRightIcon,
	OrigamiIcon,
	PlusIcon,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#/components/ui/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "#/components/ui/item";
import { listActivitiesSF } from "#/server/activities";

export const Route = createFileRoute("/activities/")({
	component: RouteComponent,
	loader: async ({}) => {
		return { activities: await listActivitiesSF() };
	},
});

function RouteComponent() {
	const { activities } = Route.useLoaderData();
	return (
		<main className="min-h-svh bg-background px-2 py-10 md:p-10">
			<div className="max-w-5xl mx-auto space-y-8">
				<header className="flex flex-col sm:flex-row justify-between items-center gap-4">
					<div>
						<h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
							Your Activities
						</h1>
						<p className="text-lg text-muted-foreground">
							Create new activities or add records to the activities you already
							have.
						</p>
					</div>
					<div className="w-full sm:w-auto">
						<Button className="w-full md:w-auto" size="lg" asChild>
							<Link to="/activities/create">
								Create New Activity <PlusIcon />
							</Link>
						</Button>
					</div>
				</header>
				{activities.length === 0 ? (
					<Empty className="border border-muted-foreground border-dashed">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<OrigamiIcon />
							</EmptyMedia>
							<EmptyTitle>No Activities</EmptyTitle>
							<EmptyDescription>
								Start creating a new activity to track anything in your life!
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button size="lg" asChild>
								<Link to="/activities/create">
									Create Activity
									<ArrowUpRightIcon />
								</Link>
							</Button>
						</EmptyContent>
					</Empty>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
						{activities.map((a) => (
							<Item className="bg-card" variant="outline" asChild>
								<Link
									to="/activities/$activityId"
									params={{ activityId: a.id.toString() }}
								>
									<ItemContent>
										<ItemTitle>{a.title}</ItemTitle>
										<ItemDescription>{a.description}</ItemDescription>
									</ItemContent>
									<ItemActions>
										<ChevronRightIcon className="size-4" />
									</ItemActions>
								</Link>
							</Item>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
