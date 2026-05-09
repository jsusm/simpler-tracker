import { useFieldContext } from "#/hooks/demo.form-context";
import { useStore } from "@tanstack/react-form";
import { FieldDescription, FieldError, Field } from "../ui/field";
import * as ShadcnSelect from "../ui/select";

export function Select({
	label,
	values,
	placeholder,
	description,
}: {
	label: string;
	values: Array<{ label: string; value: string }>;
	placeholder?: string;
	description?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field>
			<ShadcnSelect.Select
				name={field.name}
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
			>
				<ShadcnSelect.SelectTrigger className="w-full">
					<ShadcnSelect.SelectValue placeholder={placeholder} />
				</ShadcnSelect.SelectTrigger>
				<ShadcnSelect.SelectContent className="bg-background text-foreground">
					<ShadcnSelect.SelectGroup>
						<ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
						{values.map((value) => (
							<ShadcnSelect.SelectItem
								key={value.value}
								value={value.value}
								className="text-foreground"
							>
								{value.label}
							</ShadcnSelect.SelectItem>
						))}
					</ShadcnSelect.SelectGroup>
				</ShadcnSelect.SelectContent>
			</ShadcnSelect.Select>
			{description && <FieldDescription>{description}</FieldDescription>}
			{field.state.meta.isTouched && <FieldError errors={errors} />}
		</Field>
	);
}
