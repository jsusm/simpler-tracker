import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";
import {
	activities,
	metrics,
	metricsEnumValues,
	qualitativeMetricLabels,
} from "#/db/schema";
import { db } from "../db/index";

export const getActivitySF = createServerFn()
	.inputValidator(z.object({ activityId: z.coerce.number() }))
	.handler(async ({ data }) => {
		const activity = await db
			.select()
			.from(activities)
			.where(eq(activities.id, data.activityId));

		const metricsRows = await db
			.select()
			.from(metrics)
			.where(eq(metrics.activityId, data.activityId))
			.leftJoin(
				qualitativeMetricLabels,
				eq(metrics.id, qualitativeMetricLabels.metricId),
			);

		// metricsRows returns an items for every metric and every quialitative_metric_labels
		// so there's duplicated metric values
		// 2. Extract just the values (remove the id labels)
		const groupedMetrics = Object.values(
			// 1. We group them for metric id
			Object.groupBy(metricsRows, ({ metrics }) => {
				return metrics.id;
			}),
		).map((v) => {
			// 3. We extract just the first metric information and then labels
			// we extract the labels in a list
			if (!v) return null;
			const metric = v[0].metrics;
			const labels = v
				.map((m) => m.quialitative_metric_labels)
				.filter((l) => l != null);
			return { ...metric, labels };
		});

		return { activity, metrics: groupedMetrics };
	});

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
				.values(
					data.metrics.map((m) => ({
						label: m.label,
						type: m.type,
						activityId,
					})),
				)
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
