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

- Create the activity detail route.
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
- `src/routes/activities/create.tsx` implements a multi-step client-side creation flow.
- `src/components/blocks/CreateActivityForm.tsx` captures activity title and description.
- `src/components/blocks/CreateMetricForm.tsx` captures metrics and qualitative labels.
- `src/components/blocks/ActivityFormCheckout.tsx` reviews and submits the activity and its metrics.
- `src/hooks/useCreateActivityFormState.ts` owns the reducer, step history, session storage persistence, and form state shape for the activity creation wizard.
- `src/server/activities.ts` creates an activity and related metrics/labels, and lists activities.
- `src/server/metrics.ts` contains an older standalone metric creation server function.

Current database schema:

- `activities`: `id`, `title`, `description`, `createdAt`.
- `metrics`: `id`, `label`, `type`, `createdAt`.
- `qualitativeMetricLabels`: `id`, `label`, `order`, `metricId`, `createdAt`.

Important schema caveat: metrics are not currently linked to activities in `src/db/schema.ts`, even though the product model requires activity-owned metrics. Fix this before building records or activity detail behavior.

Other known caveats:

- `createActivityAndMetricsSF` catches and ignores all errors. Prefer surfacing errors to the caller.
- Activity creation inserts activity and metrics outside a transaction. Prefer one transaction once the schema relationships are corrected.
- `qualitativeMetricLabels` table name is currently misspelled as `quialitative_metric_labels`; changing it requires a migration decision.
- `MetricsEnumValuesType` is currently `keyof typeof metricsEnumValues`, which produces array keys rather than the union of values. Prefer `(typeof metricsEnumValues)[number]`.
- `src/server/metrics.ts` uses `qualitativeLables` with a typo and does not await the qualitative label insertion.
- `ActivityFormCheckout` navigates to `/` after activity creation, while activities are listed at `/activities/`.
- The activities list currently renders each activity as `<a href="#">`; the activity detail route has not been created yet.

## Architecture Notes

Use these conventions when extending the app:

- Add routes as files under `src/routes`; TanStack Router generates `src/routeTree.gen.ts`.
- Keep server-only database work in `src/server` server functions.
- Import app modules through `#/...` where possible; `package.json` maps `#/*` to `src/*`.
- Keep reusable UI primitives in `src/components/ui` and app-specific composed sections in `src/components/blocks`.
- Keep form field adapters in `src/components/forms` and register them in `src/hooks/demo.form.ts`.
- Prefer loaders for route-level data requirements and TanStack Query mutations for client-triggered writes.
- Preserve the existing shadcn/Tailwind visual language unless a design task explicitly asks for a new direction.
- React Compiler is configured in `vite.config.ts`; do not add `useMemo` or `useCallback` by default unless there is a concrete need or existing local pattern.

## Suggested Next Implementation Path

For the next product step, update the data model first:

- Add an `activityId` foreign key to `metrics`, or introduce an explicit join table only if metrics must be reusable across activities.
- Add records tables after the metric relationship is clear. A practical first version is one activity record row with timestamp plus child metric value rows.
- Model numeric and qualitative record values carefully. Numeric values can be stored as a number/decimal. Qualitative values should reference `qualitativeMetricLabels.id` so labels can be ordered and validated.
- Build `/activities/$activityId` to show activity details, metrics, record form, and later statistics.
- Update `/activities/` cards to link to the activity detail route.

For AI integration later:

- Treat natural-language input as a command that resolves to an activity, a record timestamp, and metric values.
- Validate AI output against server-side schemas before inserting records.
- Keep a confirmation/review step for ambiguous or low-confidence parses.
