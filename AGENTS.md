# Simpler Tracker Context

## Product

Simpler Tracker is a web app for tracking any kind of recurring activity: blood pressure, habits, exercise, mood, medication, sleep, or other personal data. The main product bet is reducing the friction of data entry. Users should be able to describe what they did in natural language, and the app should understand the text, map it to the correct activity and metrics, and insert the corresponding records.

The core data model is intentionally simple:

- An `activity` is something the user wants to track.
- An activity has one or more `metrics`.
- A metric can be `numeric` or `qualitative`.
- Qualitative metrics have ordered labels, such as `yes/no`, `happy/meh/sad`, or similar options.
- Users add `records` for an activity, with values for that activity's metrics and a timestamp for when the record happened.
- Statistics are calculated from metric records.

Current roadmap priorities:

- Calculate statistics from recorded data.
- Add authentication.
- Add AI integration for natural-language record creation.

## Tech Stack

- Framework: TanStack Start with TanStack Router file-based routes in `src/routes`.
- UI: React 19, Tailwind CSS v4, shadcn-style components in `src/components/ui`.
- Forms: TanStack Form, wrapped by `src/hooks/demo.form.ts` and custom field components in `src/components/forms`.
- Data fetching/state: TanStack Query, configured through `src/integrations/tanstack-query/root-provider.tsx` and SSR integration in `src/router.tsx`.
- Database: Drizzle ORM with Neon Postgres. Schema lives in `src/db/schema.ts`; database client lives in `src/db/index.ts`.
- Server logic: TanStack Start server functions colocated by feature under `src/features/*/server`.
- Deployment target: Cloudflare Workers via `@cloudflare/vite-plugin` and `wrangler.jsonc`.
- Formatting/linting: Biome. Use `npm run check`, `npm run lint`, and `npm run format`.
- Build/test commands: `npm run build`, `npm run test`.

## Current App State

Implemented app functionality:

- `src/routes/activities/index.tsx` lists activities using `listActivitiesSF`.
- `src/routes/activity/$activityId/index.tsx` shows activity detail, title, description, active metrics, and existing records. It links to update, delete, and record creation actions.
- `src/routes/activities/create.tsx` implements a multi-step client-side creation flow using the shared activity wizard UI with `variant="create"`.
- `src/routes/activity/$activityId/update.tsx` implements the update flow using the same wizard UI with `variant="update"`, populated from `getActivitySF`.
- `src/routes/activity/$activityId/records/create.tsx` renders the record creation form for an activity.
- `src/features/activities/components/ActivityForm.tsx` captures activity title and description for create/update.
- `src/features/activities/components/MetricForm.tsx` captures metrics and qualitative labels. Persisted metric type is immutable in the UI.
- `src/features/activities/components/ActivityFormCheckout.tsx` reviews and submits the activity. It calls create or update server functions based on the `variant` prop.
- `src/features/activities/components/TrackingCard.tsx` displays the metrics configured for an activity.
- `src/features/records/components/RecordsTableCard.tsx` displays a basic records table with one timestamp column and one column per metric. It uses `src/components/ui/table.tsx`, not TanStack Table.
- `src/features/records/components/CreateRecordForm.tsx` registers a new record with one input per active metric: numeric metrics use number inputs and qualitative metrics use select inputs populated from metric labels.
- `src/components/forms/QualitativeLabelsInput.tsx` edits qualitative labels while preserving optional label IDs and order.
- `src/features/activities/hooks/useActivityWizardState.ts` owns the reducer, step history, session storage persistence for create, and shared form state shape for the activity wizard.
- `src/features/activities/server/activities.ts` gets one activity, creates an activity with metrics, updates an activity and metrics, deletes/archives activities, and lists activities.
- `src/features/records/server/records.ts` creates, updates, deletes, and lists records.
- `src/server/metrics.ts` contains an older standalone metric creation server function.

Current database schema:

- `activities`: `id`, `title`, `description`, `createdAt`, `archivedAt`.
- `metrics`: `id`, `label`, `type`, `createdAt`, `activityId`, `archivedAt`.
- `qualitativeMetricLabels`: `id`, `label`, `order`, `metricId`, `createdAt`, `archivedAt`.
- `activityRecords`: `id`, `activityId`, `recordedAt`, `createdAt`.
- `metricRecordValues`: `id`, `recordId`, `metricId`, `numericValue`, `qualitativeLabelId`, `createdAt`.

The `metrics.activityId` relationship is now present. Active metrics and labels are represented by `archivedAt === null`. Archived metrics/labels should remain in the database because future records will reference those IDs.

Record behavior:

- `activityRecords` stores one row per activity entry and has the timestamp in `recordedAt`.
- `metricRecordValues` stores one row per metric value for a record.
- Numeric metric values use `numericValue`; qualitative metric values use `qualitativeLabelId`.
- `metricRecordValues` has a unique constraint on `(recordId, metricId)` so a record can only contain one value per metric.
- Record writes validate that metric IDs belong to the activity, are active, and receive the correct value shape for their metric type.
- Qualitative record writes validate that the selected label belongs to the submitted metric.
- Record listing intentionally does not join qualitative labels. The activity page already has metric labels from `getActivitySF`, so the client resolves qualitative label IDs from that data.
- Historical record display should continue to preserve references to metric IDs and qualitative label IDs, including archived definitions when needed.

Activity update behavior:

- `updateActivityAndMetricsSF` uses a diff-and-preserve strategy instead of replacing all metrics.
- Existing metrics are updated in place by ID.
- Removed metrics are archived by setting `metrics.archivedAt`.
- Existing qualitative labels are updated in place by ID.
- Removed qualitative labels are archived by setting `qualitativeMetricLabels.archivedAt`.
- New metrics and labels are inserted.
- Metric `type` is immutable after creation and the server rejects attempts to change it.
- `neon-http` does not support transactions. Validate as much as possible before writes, avoid destructive operations, and prefer archiving over deleting.

Other known caveats:

- `createActivityAndMetricsSF` catches and ignores all errors. Prefer surfacing errors to the caller.
- Activity creation inserts activity and metrics outside a transaction. Because `neon-http` does not support transactions, prefer validation before writes and non-destructive updates.
- `qualitativeMetricLabels` table name is currently misspelled as `quialitative_metric_labels`; changing it requires a migration decision.
- `MetricsEnumValuesType` is currently `keyof typeof metricsEnumValues`, which produces array keys rather than the union of values. Prefer `(typeof metricsEnumValues)[number]`.
- `src/server/metrics.ts` uses `qualitativeLables` with a typo and does not await the qualitative label insertion. It is legacy and has not been moved into a feature folder yet.
- Demo routes still break full type/build checks: `src/routes/demo/neon.tsx` imports missing `getClient`, `src/routes/demo/drizzle.tsx` imports missing `todos`, and `src/routes/index.tsx` has an unused `value` parameter.
- Full `npm run check` also reports existing unrelated Biome issues in demo/UI files. Targeted checks on the activity update files pass.

## Architecture Notes

Use these conventions when extending the app:

- Add routes as files under `src/routes`; TanStack Router generates `src/routeTree.gen.ts`.
- Keep route files thin: route definitions, loaders, mutations/navigation wiring, and page composition only.
- Keep app-specific code in `src/features/<feature>` with `components`, `hooks`, and `server` subfolders as needed.
- Keep server-only database work in feature server functions under `src/features/*/server`.
- Import app modules through `#/...` where possible; `package.json` maps `#/*` to `src/*`.
- Keep reusable UI primitives in `src/components/ui` and app-specific composed sections in feature folders.
- Keep form field adapters in `src/components/forms` and register them in `src/hooks/demo.form.ts`.
- Prefer loaders for route-level data requirements and TanStack Query mutations for client-triggered writes.
- Preserve the existing shadcn/Tailwind visual language unless a design task explicitly asks for a new direction.
- React Compiler is configured in `vite.config.ts`; do not add `useMemo` or `useCallback` by default unless there is a concrete need or existing local pattern.

## Suggested Next Implementation Path

For the next product step, build on the records foundation:

- Add record editing UI, likely under `/activity/$activityId/records/$recordId/update`.
- Decide whether record deletion should remain hard delete or become archived/non-destructive like activities and metrics.
- Add statistics after record insertion/listing is stable.
- Consider extracting shared activity/metric/record DTO types if components and routes start repeating type definitions.

For AI integration later:

- Treat natural-language input as a command that resolves to an activity, a record timestamp, and metric values.
- Validate AI output against server-side schemas before inserting records.
- Keep a confirmation/review step for ambiguous or low-confidence parses.
