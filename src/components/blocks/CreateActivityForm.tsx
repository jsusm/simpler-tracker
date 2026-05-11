import { useId } from "react";
import { useAppForm } from "#/hooks/demo.form";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { FieldGroup, FieldSet } from "../ui/field";
import { type CreateActivityDispatcherType, type CreateActivityStepFormStateType } from '#/hooks/useCreateActivityFormState'

export function CreateActivityForm({dispatcher: formDispatcher, formState: activityFormState}: {dispatcher: CreateActivityDispatcherType, formState: CreateActivityStepFormStateType}) {
	const form = useAppForm({
		defaultValues: {
			title: activityFormState.data.title,
			description: activityFormState.data.description,
		},
		async onSubmit({ value }) {
      console.log({value})
      formDispatcher({type: 'setActivityDone', payload: value})
		},
	});
	const formId = useId();
	return (
		<div>
			<Card>
				<CardHeader className="">
					<CardTitle className="text-xl">Create a New Activity</CardTitle>
					<CardDescription>
						First let't give it a name, then define what data you want to track
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
									name="title"
									children={(field) => <field.TextField label="Title" />}
								/>
								<form.AppField
									name="description"
									children={(field) => <field.TextField label="Description" />}
								/>
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
