import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "./demo.form-context";
import { TextField } from "#/components/forms/TextField";
import { Select } from "#/components/forms/Select";
import { TextArea } from "#/components/forms/TextArea";
import { SubscribeButton } from "#/components/forms/SubmitButton";
import { Slider } from "#/components/ui/slider";
import { Switch } from "#/components/ui/switch";

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
