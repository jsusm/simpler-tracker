import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { db } from "#/db";
import {
	metrics,
	metricsEnumValues,
	qualitativeMetricLabels,
} from "#/db/schema";

const createMetricSchema = z.object({
	label: z.string(),
	qualitativeLables: z.array(z.string()).optional(),
	type: z.enum(metricsEnumValues),
});

export const createMetricSF = createServerFn()
	.inputValidator(createMetricSchema)
	.handler(async ({ data }) => {
		await db.transaction(async (tx) => {
			const insertMetricResult = await tx
				.insert(metrics)
				.values({ label: data.label, type: data.type })
				.returning({ id: metrics.id });
			const metricId = insertMetricResult.at(0)?.id;

			if (metricId === undefined) {
				throw new Error("Could not get the inserted metric id");
			}

			if (
				data.type === "qualitative" &&
				data.qualitativeLables &&
				data.qualitativeLables.length !== 0
			) {
				tx.insert(qualitativeMetricLabels).values(
					data.qualitativeLables.map((l, idx) => ({
						label: l,
						order: idx,
						metricId,
					})),
				);
			}
		});
	});
