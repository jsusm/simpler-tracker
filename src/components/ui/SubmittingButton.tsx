import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";
import { Button } from "./button";
import { Spinner } from "./spinner";

export function SubmittingButton({
	isSubmitting,
	children,
	...props
}: ComponentProps<typeof Button> & { isSubmitting: boolean }) {
	return (
		<Button
			{...props}
			className={cn({ "gap-0": !isSubmitting }, props.className)}
			type="submit"
			disabled={isSubmitting}
		>
			{children}
			<Spinner
				className={cn("transition-all", { "opacity-0 w-0": !isSubmitting })}
			/>
		</Button>
	);
}
