import { useFieldContext } from "#/hooks/demo.form-context";
import { useStore } from "@tanstack/react-form";
import { FieldDescription, FieldError, Field, FieldLabel } from "../ui/field";
import { Slider as ShadcnSlider } from "#/components/ui/slider";

export function Slider({
	label,
	description,
}: {
	label: string;
	description?: string;
}) {
	const field = useFieldContext<number>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field>
			<FieldLabel htmlFor={label}>{label}</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}
			<ShadcnSlider
				id={label}
				onBlur={field.handleBlur}
				value={[field.state.value]}
				onValueChange={(value) => field.handleChange(value[0])}
			/>
			{field.state.meta.isTouched && <FieldError errors={errors} />}
		</Field>
	);
}
