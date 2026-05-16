# Simpler Tracker Context

## Product

Simpler Tracker is a web app for tracking any kind of recurring activity: blood pressure, habits, exercise, mood, medication, sleep, or other personal data. The main product bet is reducing the friction of data entry. Users should be able to describe what they did in natural language, and the app should understand the text, map it to the correct activity and metrics, and insert the corresponding records.

The core data model is intentionally simple:

- An `activity` is something the user wants to track.
- An activity has one or more `metrics`.
- A metric can be `numeric` or `qualitative`.
- Qualitative metrics have ordered labels, such as `yes/no`, `happy/meh/sad`, or similar options.
- Users will eventually add `records` for an activity, with values for that activity's metrics.
- Statistics are calculated from metric records.

Current roadmap priorities:

- Create the records model.
- Create a form to register records for an activity.
- Calculate statistics from recorded data.
- Add authentication.
- Add AI integration for natural-language record creation.

## Tech Stack

- Framework: TanStack Start with TanStack Router file-based routes in `src/routes`.
- UI: React 19, Tailwind CSS v4, shadcn-style components in `src/components/ui`.
- Forms: TanStack Form, wrapped by `src/hooks/demo.form.ts` and custom field components in `src/components/forms`.
- Data fetching/state: TanStack Query, configured through `src/integrations/tanstack-query/root-provider.tsx` and SSR integration in `src/router.tsx`.
- Database: Drizzle ORM with Neon Postgres. Schema lives in `src/db/schema.ts`; database client lives in `src/db/index.ts`.
- Server logic: TanStack Start server functions in `src/server`.
- Deployment target: Cloudflare Workers via `@cloudflare/vite-plugin` and `wrangler.jsonc`.
- Formatting/linting: Biome. Use `npm run check`, `npm run lint`, and `npm run format`.
- Build/test commands: `npm run build`, `npm run test`.

## Current App State

Implemented app functionality:

- `src/routes/activities/index.tsx` lists activities using `listActivitiesSF`.
- `src/routes/activity/$activityId.tsx` shows activity detail, title, description, and active metrics. It links to the update route and renders an `Outlet` for nested routes such as `/activity/$activityId/update`.
- `src/routes/activities/create.tsx` implements a multi-step client-side creation flow using the shared activity wizard UI with `variant="create"`.
- `src/routes/activity/$activityId/update.tsx` implements the update flow using the same wizard UI with `variant="update"`, populated from `getActivitySF`.
- `src/components/blocks/ActivityForm.tsx` captures activity title and description for create/update.
- `src/components/blocks/MetricForm.tsx` captures metrics and qualitative labels. Persisted metric type is immutable in the UI.
- `src/components/blocks/ActivityFormCheckout.tsx` reviews and submits the activity. It calls create or update server functions based on the `variant` prop.
- `src/components/forms/QualitativeLabelsInput.tsx` edits qualitative labels while preserving optional label IDs and order.
- `src/hooks/useCreateActivityFormState.ts` owns the reducer, step history, session storage persistence for create, and shared form state shape for the activity wizard.
- `src/server/activities.ts` gets one activity, creates an activity with metrics, updates an activity and metrics, and lists activities.
- `src/server/metrics.ts` contains an older standalone metric creation server function.

Current database schema:

- `activities`: `id`, `title`, `description`, `createdAt`.
- `metrics`: `id`, `label`, `type`, `createdAt`, `activityId`, `archivedAt`.
- `qualitativeMetricLabels`: `id`, `label`, `order`, `metricId`, `createdAt`, `archivedAt`.

The `metrics.activityId` relationship is now present. Active metrics and labels are represented by `archivedAt === null`. Archived metrics/labels should remain in the database because future records will reference those IDs.

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
- `src/server/metrics.ts` uses `qualitativeLables` with a typo and does not await the qualitative label insertion.
- Demo routes still break full type/build checks: `src/routes/demo/neon.tsx` imports missing `getClient`, `src/routes/demo/drizzle.tsx` imports missing `todos`, and `src/routes/index.tsx` has an unused `value` parameter.
- Full `npm run check` also reports existing unrelated Biome issues in demo/UI files. Targeted checks on the activity update files pass.

## Architecture Notes

Use these conventions when extending the app:

- Add routes as files under `src/routes`; TanStack Router generates `src/routeTree.gen.ts`.
- When adding nested TanStack Router routes, ensure the parent renders an `Outlet`; `src/routes/activity/$activityId.tsx` does this for `/activity/$activityId/update`.
- Keep server-only database work in `src/server` server functions.
- Import app modules through `#/...` where possible; `package.json` maps `#/*` to `src/*`.
- Keep reusable UI primitives in `src/components/ui` and app-specific composed sections in `src/components/blocks`.
- Keep form field adapters in `src/components/forms` and register them in `src/hooks/demo.form.ts`.
- Prefer loaders for route-level data requirements and TanStack Query mutations for client-triggered writes.
- Preserve the existing shadcn/Tailwind visual language unless a design task explicitly asks for a new direction.
- React Compiler is configured in `vite.config.ts`; do not add `useMemo` or `useCallback` by default unless there is a concrete need or existing local pattern.

## Suggested Next Implementation Path

For the next product step, update the data model first:

- Add records tables after the metric relationship is clear. A practical first version is one activity record row with timestamp plus child metric value rows.
- Model numeric and qualitative record values carefully. Numeric values can be stored as a number/decimal. Qualitative values should reference `qualitativeMetricLabels.id` so labels can be ordered and validated.
- Records should reference metric and qualitative label IDs, including archived IDs for historical data.
- Build record creation UI on `/activity/$activityId` or a nested route using only non-archived metrics/labels for new records.
- Add statistics after record insertion exists.

For AI integration later:

- Treat natural-language input as a command that resolves to an activity, a record timestamp, and metric values.
- Validate AI output against server-side schemas before inserting records.
- Keep a confirmation/review step for ambiguous or low-confidence parses.
