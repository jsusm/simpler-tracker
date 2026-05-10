import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { activities } from "#/db/schema";
import { db } from "../db/index";

const createActivitySchema = z.object({
	title: z.string(),
	description: z.string().optional(),
});

export const createActivitySF = createServerFn()
	.inputValidator(createActivitySchema)
	.handler(async ({ data }) => {
		try {
			await db.insert(activities).values(data);
		} catch (e) {
			console.log(e);
		}
	});
