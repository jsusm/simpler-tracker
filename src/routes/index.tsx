import {
	FieldGroup,
	FieldSet,
} from "#/components/ui/field";
import { useAppForm } from "#/hooks/demo.form";
import { createActivitySF } from "#/server/activities";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
		},
    async onSubmit({value, formApi}) {
      await createActivitySF({ data: value })
      formApi.reset()
    }
	});
	return (
		<main>
			<h1>Create activity form</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
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
        <form.AppForm>
        <form.SubscribeButton label="Submit" />
        </form.AppForm>
			</form>
		</main>
	);
}
