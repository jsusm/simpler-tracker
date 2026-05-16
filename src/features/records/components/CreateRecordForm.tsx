import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { createRecordSF } from "#/features/records/server/records";

type ActivityMetric = {
	id: number;
	label: string;
	type: "numeric" | "qualitative";
	labels: Array<{ id: number; label: string }>;
} | null;

type Activity = {
	id: number;
	title: string;
};

type MetricValues = Record<number, string>;

export function CreateRecordForm({
	activity,
	metrics,
}: {
	activity: Activity;
	metrics: ActivityMetric[];
}) {
	const formId = useId();
	const navigate = useNavigate();
	const activeMetrics = metrics.filter((metric) => metric !== null);
	const [recordedAt, setRecordedAt] = useState(() => getDateTimeLocalValue());
	const [metricValues, setMetricValues] = useState<MetricValues>(() =>
		Object.fromEntries(activeMetrics.map((metric) => [metric.id, ""])),
	);
	const [error, setError] = useState<string | null>(null);
	const { mutateAsync: createRecordMutation, isPending } = useMutation({
		mutationFn: createRecordSF,
		onSuccess() {
			navigate({
				to: "/activity/$activityId",
				params: { activityId: activity.id.toString() },
			});
		},
	});

	const updateMetricValue = (metricId: number, value: string) => {
		setMetricValues((currentValues) => ({
			...currentValues,
			[metricId]: value,
		}));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		try {
			await createRecordMutation({
				data: {
					activityId: activity.id,
					recordedAt: new Date(recordedAt),
					values: activeMetrics.map((metric) => {
						const value = metricValues[metric.id];
						if (metric.type === "numeric") {
							const numericValue = Number(value);
							if (value === "" || Number.isNaN(numericValue)) {
								throw new Error(`${metric.label} requires a numeric value`);
							}

							return { metricId: metric.id, numericValue };
						}

						if (!value) {
							throw new Error(`${metric.label} requires an option`);
						}

						return {
							metricId: metric.id,
							qualitativeLabelId: Number(value),
						};
					}),
				},
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create record");
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Register {activity.title}</CardTitle>
				<CardDescription>
					Fill one value for each metric configured for this activity.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form id={formId} onSubmit={handleSubmit}>
					<FieldSet>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={`${formId}-recorded-at`}>
									Timestamp
								</FieldLabel>
								<FieldDescription>
									When this activity record happened.
								</FieldDescription>
								<Input
									id={`${formId}-recorded-at`}
									type="datetime-local"
									value={recordedAt}
									onChange={(event) => setRecordedAt(event.target.value)}
									required
								/>
							</Field>

							{activeMetrics.map((metric) => (
								<Field key={metric.id}>
									<FieldLabel htmlFor={`${formId}-metric-${metric.id}`}>
										{metric.label}
									</FieldLabel>
									{metric.type === "numeric" ? (
										<Input
											id={`${formId}-metric-${metric.id}`}
											type="number"
											step="any"
											value={metricValues[metric.id] ?? ""}
											onChange={(event) =>
												updateMetricValue(metric.id, event.target.value)
											}
											required
										/>
									) : (
										<Select
											value={metricValues[metric.id] ?? ""}
											onValueChange={(value) =>
												updateMetricValue(metric.id, value)
											}
											required
										>
											<SelectTrigger
												id={`${formId}-metric-${metric.id}`}
												className="w-full"
											>
												<SelectValue placeholder="Select an option" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>{metric.label}</SelectLabel>
													{metric.labels.map((label) => (
														<SelectItem
															key={label.id}
															value={label.id.toString()}
														>
															{label.label}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
									)}
								</Field>
							))}
						</FieldGroup>
					</FieldSet>
				</form>
				{error ? (
					<p className="mt-4 text-destructive text-sm">{error}</p>
				) : null}
			</CardContent>
			<CardFooter className="flex gap-2">
				<Button variant="outline" type="button" className="flex-1" asChild>
					<a href={`/activity/${activity.id}`}>Cancel</a>
				</Button>
				<Button
					type="submit"
					form={formId}
					className="flex-1"
					disabled={isPending}
				>
					{isPending ? "Saving..." : "Register Record"}
				</Button>
			</CardFooter>
		</Card>
	);
}

function getDateTimeLocalValue() {
	const now = new Date();
	const timezoneOffset = now.getTimezoneOffset() * 60_000;
	return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}
