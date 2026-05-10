import { createFormHook } from "@tanstack/react-form";
import { Select } from "#/components/forms/Select";
import { SubscribeButton } from "#/components/forms/SubmitButton";
import { TextArea } from "#/components/forms/TextArea";
import { TextField } from "#/components/forms/TextField";
import { Slider } from "#/components/ui/slider";
import { Switch } from "#/components/ui/switch";
import { fieldContext, formContext } from "./demo.form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		Select,
		TextArea,
		Slider,
		Switch,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
