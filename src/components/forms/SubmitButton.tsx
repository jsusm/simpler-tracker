import type { ComponentProps } from "react";
import { useFormContext } from "#/hooks/demo.form-context";
import { cn } from "#/lib/utils";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export function SubscribeButton({
	label,
	...props
}: ComponentProps<typeof Button> & { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					{...props}
					className={cn({ "gap-0": !isSubmitting }, props.className)}
					type="submit"
					disabled={isSubmitting}
				>
					<span>{label}</span>
					<Spinner
						className={cn("transition-all", { "opacity-0 w-0": !isSubmitting })}
					/>
				</Button>
			)}
		</form.Subscribe>
	);
}
