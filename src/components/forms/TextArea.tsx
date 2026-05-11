import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "#/hooks/demo.form-context";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";

export function TextArea({
	label,
	rows = 3,
	description,
}: {
	label: string;
	rows?: number;
	description?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field>
			<FieldLabel htmlFor={label}>{label}</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}
			<Textarea
				id={label}
				value={field.state.value}
				onBlur={field.handleBlur}
				rows={rows}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <FieldError errors={errors} />}
		</Field>
	);
}
