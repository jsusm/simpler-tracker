import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import {
	activities,
	metrics,
	metricsEnumValues,
	qualitativeMetricLabels,
} from "#/db/schema";
import { db } from "../db/index";

// TODO: Migrate schemas to it's own file
export const metricSchema = z.object({
	label: z.string(),
	type: z.enum(metricsEnumValues),
	qualitativeLabels: z.array(z.string()),
});
const createActivitySchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	metrics: z.array(metricSchema),
});

export const createActivityAndMetricsSF = createServerFn()
	.inputValidator(createActivitySchema)
	.handler(async ({ data }) => {
		try {
			const insertActivityResult = await db
				.insert(activities)
				.values(data)
				.returning({ id: activities.id });

			const activityId = insertActivityResult.at(0)?.id;
			if (activityId === undefined) {
				throw new Error("Could not get the inserted activity id");
			}

			const insertMetricsResult = await db
				.insert(metrics)
				.values(data.metrics.map((m) => ({ label: m.label, type: m.type })))
				.returning({ id: metrics.id });

			if (insertMetricsResult.length !== data.metrics.length) {
				throw new Error(
					"Inserted Metrics and input metrics does not have the same length",
				);
			}
			const qualitativeLabels: (typeof qualitativeMetricLabels.$inferInsert)[] =
				[];
			for (let i = 0; i < insertMetricsResult.length; i++) {
				if (data.metrics[i].type === "qualitative") {
					const insertions = data.metrics[i].qualitativeLabels?.map(
						(l, idx) => ({
							label: l,
							order: idx,
							metricId: insertMetricsResult[i].id,
						}),
					);
					if (!insertions) continue;
					qualitativeLabels.push(...insertions);
				}
			}
			await db.insert(qualitativeMetricLabels).values(qualitativeLabels);
		} catch (_e) {}
	});

export const listActivitiesSF = createServerFn().handler(async () => {
	const activitiesRows = await db.select().from(activities);
	return activitiesRows;
});
