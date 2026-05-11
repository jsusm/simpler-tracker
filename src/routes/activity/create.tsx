import { createFileRoute } from "@tanstack/react-router";
import { CreateActivityForm } from "#/components/blocks/CreateActivityForm";
import { CreateMetricForm } from "#/components/blocks/CreateMetricForm";

export const Route = createFileRoute("/activity/create")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-md flex-col gap-6">
				{/* <CreateActivityForm /> */}
				<CreateActivityForm />
				<CreateMetricForm />
				{/* <CreateMetricForm /> */}
			</div>
		</div>
	);
}
