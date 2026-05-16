import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { SubmittingButton } from "#/components/ui/SubmittingButton";
import {
	type CreateActivityDispatcherType,
	type CreateActivityStepFormStateType,
	clearSessionCreateActivityStepFormState,
} from "#/features/activities/hooks/useActivityWizardState";
import {
	createActivityAndMetricsSF,
	updateActivityAndMetricsSF,
} from "#/features/activities/server/activities";

export function ActivityFormCheckout({
	dispatcher: formDispatcher,
	formState: activityFormState,
	variant,
	activityId,
}: {
	dispatcher: CreateActivityDispatcherType;
	formState: CreateActivityStepFormStateType;
	variant: "create" | "update";
	activityId?: number;
}) {
	const navigate = useNavigate();
	const { mutateAsync: createActivityMutation, isPending: isCreating } =
		useMutation({
			mutationFn: createActivityAndMetricsSF,
			onSuccess() {
				clearSessionCreateActivityStepFormState();
				navigate({ to: "/activities" });
			},
		});
	const { mutateAsync: updateActivityMutation, isPending: isUpdating } =
		useMutation({
			mutationFn: updateActivityAndMetricsSF,
			onSuccess() {
				if (!activityId) return;
				navigate({
					to: "/activity/$activityId",
					params: { activityId: activityId.toString() },
				});
			},
		});
	const handleCreateActivity = () => {
		if (variant === "update") {
			if (!activityId) {
				throw new Error("Missing activity id for update");
			}
			updateActivityMutation({
				data: { ...activityFormState.data, activityId },
			});
			return;
		}

		createActivityMutation({ data: activityFormState.data });
	};
	const isPending = isCreating || isUpdating;
	return (
		<div>
			<Card>
				<CardHeader className="">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl">
							{activityFormState.data.title}
						</CardTitle>
						<Button
							size="sm"
							variant={"secondary"}
							onClick={(_) => formDispatcher({ type: "goToActivityForm" })}
						>
							Edit
						</Button>
					</div>
					<CardDescription>
						{activityFormState.data.description}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<p className="text-sm leading-none font-medium ">Metrics</p>

						<ul className="flex flex-col gap-2">
							{activityFormState.data.metrics.map((m, idx) => (
								<li
									className="relative flex items-center"
									key={m.id ?? m.label}
								>
									<Button
										variant="outline"
										className="justify-between pr-8 w-full"
										onClick={() => {
											formDispatcher({ type: "goToMetric", payload: { idx } });
										}}
									>
										<span>{m.label}</span>
										<div className="flex gap-2 items-center">
											<span className="text-muted-foreground">
												{m.type === "numeric"
													? "Numeric"
													: m.qualitativeLabels
															.map((label) => label.label)
															.join(", ")}
											</span>
										</div>
									</Button>
									<Button
										size="icon-xs"
										className="absolute right-1"
										variant={"destructive"}
										onClick={(e) => {
											e.stopPropagation();
											formDispatcher({
												type: "removeMetric",
												payload: { idx },
											});
										}}
									>
										<Trash2Icon className="size-4" />
									</Button>
								</li>
							))}
						</ul>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col items-stretch md:flex-row gap-2 justify-stretch">
					<Button
						variant="outline"
						onClick={(_) => formDispatcher({ type: "goToAddNewMetric" })}
					>
						Add new Metric
					</Button>
					<SubmittingButton
						isSubmitting={isPending}
						className="md:flex-1"
						onClick={handleCreateActivity}
					>
						{variant === "create" ? "Create Activity" : "Update Activity"}
					</SubmittingButton>
				</CardFooter>
			</Card>
		</div>
	);
}
