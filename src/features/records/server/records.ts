import { createServerFn } from "@tanstack/react-start";
import {
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	inArray,
	isNull,
	lte,
} from "drizzle-orm";
import * as z from "zod";
import { db } from "#/db/index";
import {
	activities,
	activityRecords,
	metricRecordValues,
	metrics,
	qualitativeMetricLabels,
} from "#/db/schema";

const recordValueSchema = z.object({
	metricId: z.coerce.number(),
	numericValue: z.number().optional(),
	qualitativeLabelId: z.coerce.number().optional(),
});

const createRecordSchema = z.object({
	activityId: z.coerce.number(),
	recordedAt: z.coerce.date(),
	values: z.array(recordValueSchema).min(1),
});

const updateRecordSchema = createRecordSchema.extend({
	recordId: z.coerce.number(),
});

const recordIdSchema = z.object({
	recordId: z.coerce.number(),
});

const listRecordsSchema = z.object({
	activityId: z.coerce.number(),
});

async function validateRecordValues({
	activityId,
	values,
}: {
	activityId: number;
	values: z.infer<typeof recordValueSchema>[];
}) {
	const metricIds = values.map((value) => value.metricId);
	if (new Set(metricIds).size !== metricIds.length) {
		throw new Error("A record cannot contain duplicate metric values");
	}

	const activity = await db
		.select({ id: activities.id })
		.from(activities)
		.where(and(eq(activities.id, activityId), isNull(activities.archivedAt)));
	if (!activity.at(0)) {
		throw new Error("Activity not found");
	}

	const activityMetrics = await db
		.select({
			id: metrics.id,
			type: metrics.type,
		})
		.from(metrics)
		.where(and(eq(metrics.activityId, activityId), isNull(metrics.archivedAt)));
	const metricsById = new Map(
		activityMetrics.map((metric) => [metric.id, metric]),
	);

	for (const value of values) {
		const metric = metricsById.get(value.metricId);
		if (!metric) {
			throw new Error("Invalid metric for this activity");
		}

		if (metric.type === "numeric") {
			if (
				value.numericValue === undefined ||
				value.qualitativeLabelId !== undefined
			) {
				throw new Error("Numeric metrics require only a numeric value");
			}
			continue;
		}

		if (
			value.qualitativeLabelId === undefined ||
			value.numericValue !== undefined
		) {
			throw new Error("Qualitative metrics require only a label id");
		}
	}

	const qualitativeLabelIds = values
		.map((value) => value.qualitativeLabelId)
		.filter((id) => id !== undefined);
	if (qualitativeLabelIds.length === 0) {
		return;
	}

	const labels = await db
		.select({
			id: qualitativeMetricLabels.id,
			metricId: qualitativeMetricLabels.metricId,
		})
		.from(qualitativeMetricLabels)
		.where(
			and(
				inArray(qualitativeMetricLabels.id, qualitativeLabelIds),
				isNull(qualitativeMetricLabels.archivedAt),
			),
		);
	const labelsById = new Map(labels.map((label) => [label.id, label]));

	for (const value of values) {
		if (value.qualitativeLabelId === undefined) continue;

		const label = labelsById.get(value.qualitativeLabelId);
		if (!label || label.metricId !== value.metricId) {
			throw new Error("Invalid qualitative label for this metric");
		}
	}
}

export const createRecordSF = createServerFn()
	.inputValidator(createRecordSchema)
	.handler(async ({ data }) => {
		await validateRecordValues(data);

		const insertedRecords = await db
			.insert(activityRecords)
			.values({ activityId: data.activityId, recordedAt: data.recordedAt })
			.returning({ id: activityRecords.id });
		const recordId = insertedRecords.at(0)?.id;
		if (recordId === undefined) {
			throw new Error("Could not get the inserted record id");
		}

		await db.insert(metricRecordValues).values(
			data.values.map((value) => ({
				recordId,
				metricId: value.metricId,
				numericValue: value.numericValue,
				qualitativeLabelId: value.qualitativeLabelId,
			})),
		);

		return { recordId };
	});

export const updateRecordSF = createServerFn()
	.inputValidator(updateRecordSchema)
	.handler(async ({ data }) => {
		const existingRecord = await db
			.select({ id: activityRecords.id })
			.from(activityRecords)
			.where(
				and(
					eq(activityRecords.id, data.recordId),
					eq(activityRecords.activityId, data.activityId),
				),
			);
		if (!existingRecord.at(0)) {
			throw new Error("Record not found");
		}

		await validateRecordValues(data);

		const existingValues = await db
			.select({
				id: metricRecordValues.id,
				metricId: metricRecordValues.metricId,
			})
			.from(metricRecordValues)
			.where(eq(metricRecordValues.recordId, data.recordId));
		const existingValuesByMetricId = new Map(
			existingValues.map((value) => [value.metricId, value]),
		);
		const submittedMetricIds = data.values.map((value) => value.metricId);
		const removedValueIds = existingValues
			.filter((value) => !submittedMetricIds.includes(value.metricId))
			.map((value) => value.id);

		await db
			.update(activityRecords)
			.set({ recordedAt: data.recordedAt })
			.where(eq(activityRecords.id, data.recordId));

		for (const value of data.values) {
			const existingValue = existingValuesByMetricId.get(value.metricId);
			if (!existingValue) {
				await db.insert(metricRecordValues).values({
					recordId: data.recordId,
					metricId: value.metricId,
					numericValue: value.numericValue,
					qualitativeLabelId: value.qualitativeLabelId,
				});
				continue;
			}

			await db
				.update(metricRecordValues)
				.set({
					numericValue: value.numericValue ?? null,
					qualitativeLabelId: value.qualitativeLabelId ?? null,
				})
				.where(eq(metricRecordValues.id, existingValue.id));
		}

		if (removedValueIds.length > 0) {
			await db
				.delete(metricRecordValues)
				.where(inArray(metricRecordValues.id, removedValueIds));
		}
	});

export const deleteRecordSF = createServerFn()
	.inputValidator(recordIdSchema)
	.handler(async ({ data }) => {
		await db
			.delete(metricRecordValues)
			.where(eq(metricRecordValues.recordId, data.recordId));
		await db
			.delete(activityRecords)
			.where(eq(activityRecords.id, data.recordId));
	});

export const listRecordsSF = createServerFn()
	.inputValidator(listRecordsSchema)
	.handler(async ({ data }) => {
		const rows = await db
			.select({
				recordId: activityRecords.id,
				recordedAt: activityRecords.recordedAt,
				metricId: metricRecordValues.metricId,
				numericValue: metricRecordValues.numericValue,
				qualitativeLabelId: metricRecordValues.qualitativeLabelId,
			})
			.from(activityRecords)
			.innerJoin(
				metricRecordValues,
				eq(metricRecordValues.recordId, activityRecords.id),
			)
			.where(eq(activityRecords.activityId, data.activityId))
			.orderBy(
				desc(activityRecords.recordedAt),
				asc(metricRecordValues.metricId),
			);

		const records = new Map<
			number,
			{
				id: number;
				recordedAt: Date;
				values: Array<{
					metricId: number;
					numericValue: number | null;
					qualitativeLabelId: number | null;
				}>;
			}
		>();

		for (const row of rows) {
			const record = records.get(row.recordId) ?? {
				id: row.recordId,
				recordedAt: row.recordedAt,
				values: [],
			};

			record.values.push({
				metricId: row.metricId,
				numericValue: row.numericValue,
				qualitativeLabelId: row.qualitativeLabelId,
			});
			records.set(row.recordId, record);
		}

		return Array.from(records.values());
	});

export const listRecordChartDataSF = createServerFn()
	.inputValidator(listRecordsSchema)
	.handler(async ({ data }) => {
		const now = new Date();
		const oneMonthAgo = new Date(now);
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

		const [numericRows, qualitativeRows] = await Promise.all([
			db
				.select({
					metricId: metricRecordValues.metricId,
					recordedAt: activityRecords.recordedAt,
					numericValue: metricRecordValues.numericValue,
				})
				.from(activityRecords)
				.innerJoin(
					metricRecordValues,
					eq(metricRecordValues.recordId, activityRecords.id),
				)
				.innerJoin(metrics, eq(metrics.id, metricRecordValues.metricId))
				.where(
					and(
						eq(activityRecords.activityId, data.activityId),
						eq(metrics.activityId, data.activityId),
						eq(metrics.type, "numeric"),
						isNull(metrics.archivedAt),
						gte(activityRecords.recordedAt, oneMonthAgo),
						lte(activityRecords.recordedAt, now),
					),
				)
				.orderBy(
					asc(metricRecordValues.metricId),
					asc(activityRecords.recordedAt),
				),
			db
				.select({
					metricId: metricRecordValues.metricId,
					qualitativeLabelId: qualitativeMetricLabels.id,
					label: qualitativeMetricLabels.label,
					order: qualitativeMetricLabels.order,
					count: count(),
				})
				.from(activityRecords)
				.innerJoin(
					metricRecordValues,
					eq(metricRecordValues.recordId, activityRecords.id),
				)
				.innerJoin(metrics, eq(metrics.id, metricRecordValues.metricId))
				.innerJoin(
					qualitativeMetricLabels,
					eq(qualitativeMetricLabels.id, metricRecordValues.qualitativeLabelId),
				)
				.where(
					and(
						eq(activityRecords.activityId, data.activityId),
						eq(metrics.activityId, data.activityId),
						eq(metrics.type, "qualitative"),
						isNull(metrics.archivedAt),
						isNull(qualitativeMetricLabels.archivedAt),
						gte(activityRecords.recordedAt, oneMonthAgo),
						lte(activityRecords.recordedAt, now),
					),
				)
				.groupBy(
					metricRecordValues.metricId,
					qualitativeMetricLabels.id,
					qualitativeMetricLabels.label,
					qualitativeMetricLabels.order,
				)
				.orderBy(
					asc(metricRecordValues.metricId),
					asc(qualitativeMetricLabels.order),
				),
		]);

		return {
			numeric: numericRows.flatMap((row) =>
				row.numericValue === null
					? []
					: [
							{
								metricId: row.metricId,
								recordedAt: row.recordedAt,
								numericValue: row.numericValue,
							},
						],
			),
			qualitative: qualitativeRows.map((row) => ({
				metricId: row.metricId,
				qualitativeLabelId: row.qualitativeLabelId,
				label: row.label,
				order: row.order,
				count: row.count,
			})),
		};
	});
