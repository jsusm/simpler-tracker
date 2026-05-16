import { type PropsWithChildren, useId } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { FieldGroup, FieldSet } from "#/components/ui/field";
import type {
	CreateActivityDispatcherType,
	CreateActivityStepFormStateType,
} from "#/features/activities/hooks/useActivityWizardState";
import { useAppForm } from "#/hooks/demo.form";

export function ActivityForm({
	dispatcher: formDispatcher,
	formState: activityFormState,
	variant,
}: PropsWithChildren & {
	dispatcher: CreateActivityDispatcherType;
	formState: CreateActivityStepFormStateType;
	variant: "create" | "update";
}) {
	const form = useAppForm({
		defaultValues: {
			title: activityFormState.data.title,
			description: activityFormState.data.description,
		},
		async onSubmit({ value }) {
			formDispatcher({ type: "setActivityDone", payload: value });
		},
	});
	const formId = useId();
	return (
		<div>
			<Card>
				<CardHeader className="">
					{variant === "create" ? (
						<>
							<CardTitle className="text-xl">Create a New Activity</CardTitle>
							<CardDescription>
								First let't give it a name, then define what data you want to
								track
							</CardDescription>
						</>
					) : (
						<>
							<CardTitle className="text-xl">
								Update {activityFormState.data.title}
							</CardTitle>
							<CardDescription>
								Give it a name, then define what data you want to track.
							</CardDescription>
						</>
					)}
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
								<form.AppField name="title">
									{(field) => <field.TextField label="Title" />}
								</form.AppField>
								<form.AppField name="description">
									{(field) => <field.TextField label="Description" />}
								</form.AppField>
							</FieldGroup>
						</FieldSet>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col">
					<form.AppForm>
						<form.SubscribeButton
							label="Next"
							className="w-full"
							form={formId}
						/>
					</form.AppForm>
				</CardFooter>
			</Card>
		</div>
	);
}
