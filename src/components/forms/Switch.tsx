import { useFieldContext } from "#/hooks/demo.form-context";
import { useStore } from "@tanstack/react-form";
import { Field, FieldError, } from "../ui/field";
import { Switch as ShadcnSwitch } from "#/components/ui/switch";
import { Label } from "../ui/label";

export function Switch({ label }: { label: string }) {
	const field = useFieldContext<boolean>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field>
			<div className="flex items-center gap-2">
				<ShadcnSwitch
					id={label}
					onBlur={field.handleBlur}
					checked={field.state.value}
					onCheckedChange={(checked) => field.handleChange(checked)}
				/>
				<Label htmlFor={label}>{label}</Label>
			</div>
			{field.state.meta.isTouched && <FieldError errors={errors} />}
		</Field>
	);
}
