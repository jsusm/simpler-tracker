import { useFieldContext } from "#/hooks/demo.form-context";
import { useStore } from "@tanstack/react-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export function TextField({
	label,
	placeholder,
	description,
}: {
	label: string;
	placeholder?: string;
	description?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field>
			<FieldLabel htmlFor={label}>{label}</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}
			<Input
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <FieldError errors={errors} />}
		</Field>
	);
}
