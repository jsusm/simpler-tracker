import { createFileRoute } from "@tanstack/react-router";
import { getActivitySF } from "#/server/activities";

export const Route = createFileRoute("/activities/$activityId")({
	component: RouteComponent,
	loader: async ({ params }) => {
		await getActivitySF({ data: { activityId: params.activityId } });
	},
});

function RouteComponent() {
	return <div>Hello "/activities/$activityId"!</div>;
}
