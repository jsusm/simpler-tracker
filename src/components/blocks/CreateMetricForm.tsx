import { useId } from "react";
import { useAppForm } from "#/hooks/demo.form";
import {
	type CreateActivityDispatcherType,
	type CreateActivityStepFormStateType,
	getDefaultActivityMetricValuesFromState,
} from "#/hooks/useCreateActivityFormState";
import { metricSchema } from "#/server/activities";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { FieldGroup, FieldSet } from "../ui/field";

export function CreateMetricForm({
	dispatcher: formDispatcher,
	formState: activityFormState,
}: {
	dispatcher: CreateActivityDispatcherType;
	formState: CreateActivityStepFormStateType;
}) {
	const form = useAppForm({
		defaultValues: getDefaultActivityMetricValuesFromState(activityFormState),
		onSubmit({ value }) {
			const payload = metricSchema.parse(value);
			formDispatcher({ type: "addMetricDone", payload });
		},
	});

	const formId = useId();

	return (
		<div>
			<Card>
				<CardHeader className="">
					<CardTitle className="text-xl">
						<form.Subscribe
							selector={(state) => state.values.label}
							children={(label) =>
								`${activityFormState.data.title} Activity - ${label ? label : "New"} Metric`
							}
						/>
					</CardTitle>
					<CardDescription className="">
						You can choose between a numeric metric like units, hours, or
						kilometers, or qualitative as yes or no, or happy, meh or sad.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						id={formId}
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<FieldSet>
							<FieldGroup>
								<form.AppField
									name="label"
									children={(field) => (
										<field.TextField
											placeholder="time spended, distance, how i feel, how good..."
											label="Metric Label"
										/>
									)}
								/>
								<form.AppField
									name="type"
									children={(field) => (
										<field.Select
											placeholder="Type"
											label="Type"
											values={[
												{ label: "Numeric", value: "numeric" },
												{ label: "Qualitative", value: "qualitative" },
											]}
										/>
									)}
								/>
								<form.Subscribe
									selector={(state) => state.values.type}
									children={(type) =>
										type === "qualitative" ? (
											<form.AppField
												name="qualitativeLabels"
												children={(field) => (
													<field.QualitativeLabelsInput
														label="Metric Options"
														description="Write a label in the input below and click add, then sort them out."
													/>
												)}
											/>
										) : null
									}
								></form.Subscribe>
							</FieldGroup>
						</FieldSet>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					{activityFormState.stepState.updateMetricIdx !== undefined ? (
						<Button
							variant="destructive"
							className="w-full"
							onClick={(_) => formDispatcher({ type: "removeMetricDone" })}
						>
							Discart Metric
						</Button>
					) : null}
					<div className="flex gap-2 items-center justify-stretch w-full">
						<Button
							variant="outline"
							onClick={(_) => formDispatcher({ type: "goBack" })}
						>
							Go Back
						</Button>
						<form.AppForm>
							<form.SubscribeButton
								label="Next"
								className="w-full flex-1"
								form={formId}
							/>
						</form.AppForm>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
