import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { useFieldContext } from "#/hooks/demo.form-context";
import type { ActivityMetricLabelFormValue } from "#/hooks/useCreateActivityFormState";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "../ui/input-group";

type QualitativeLabelsInputProps = {
	label: string;
	description: string;
	placeholder?: string;
};

export function QualitativeLabelsInput({
	label,
	description,
	placeholder = "Add a label",
}: QualitativeLabelsInputProps) {
	const field = useFieldContext<ActivityMetricLabelFormValue[]>();
	const [draftLabel, setDraftLabel] = useState("");
	const labels = Array.isArray(field.state.value) ? field.state.value : [];

	function normalizeOrder(nextLabels: ActivityMetricLabelFormValue[]) {
		return nextLabels.map((label, index) => ({ ...label, order: index }));
	}

	function addLabel() {
		const nextLabel = draftLabel.trim();

		if (!nextLabel) {
			return;
		}

		field.handleChange(
			normalizeOrder([...labels, { label: nextLabel, order: labels.length }]),
		);
		setDraftLabel("");
	}

	function renameLabel(index: number, value: string) {
		field.handleChange(
			labels.map((label, currentIndex) =>
				currentIndex === index ? { ...label, label: value } : label,
			),
		);
	}

	function removeLabel(index: number) {
		field.handleChange(
			normalizeOrder(
				labels.filter((_, currentIndex) => currentIndex !== index),
			),
		);
	}

	function moveLabel(index: number, direction: -1 | 1) {
		const nextIndex = index + direction;

		if (nextIndex < 0 || nextIndex >= labels.length) {
			return;
		}

		const nextLabels = [...labels];
		const [label] = nextLabels.splice(index, 1);
		nextLabels.splice(nextIndex, 0, label);
		field.handleChange(normalizeOrder(nextLabels));
	}

	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
			<FieldDescription>{description}</FieldDescription>

			<div className="space-y-3">
				<div className="flex gap-2">
					<Input
						placeholder={placeholder}
						value={draftLabel}
						onChange={(event) => setDraftLabel(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								addLabel();
							}
						}}
					/>
					<Button type="button" variant="outline" onClick={addLabel}>
						<PlusIcon />
						Add
					</Button>
				</div>

				{labels.length ? (
					<div className="space-y-2">
						{labels.map((labelValue, index) => (
							<InputGroup key={labelValue.id ?? `${labelValue.label}-${index}`}>
								<InputGroupInput
									value={labelValue.label}
									onChange={(event) => renameLabel(index, event.target.value)}
								/>
								<InputGroupAddon align={"inline-end"}>
									<InputGroupButton
										type="button"
										variant="ghost"
										size="icon-xs"
										onClick={() => moveLabel(index, -1)}
										aria-label={`Move ${labelValue.label || `label ${index + 1}`} up`}
									>
										<ArrowUpIcon />
									</InputGroupButton>
									<InputGroupButton
										type="button"
										variant="ghost"
										size="icon-xs"
										onClick={() => moveLabel(index, 1)}
										aria-label={`Move ${labelValue.label || `label ${index + 1}`} down`}
									>
										<ArrowDownIcon />
									</InputGroupButton>

									<InputGroupButton
										type="button"
										variant="destructive"
										size="icon-xs"
										onClick={() => removeLabel(index)}
										aria-label={`Delete ${labelValue.label || `label ${index + 1}`}`}
									>
										<Trash2Icon />
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						))}
					</div>
				) : (
					<p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
						Add labels in the order you want them to appear.
					</p>
				)}
			</div>

			<FieldError errors={field.state.meta.errors} />
		</Field>
	);
}
