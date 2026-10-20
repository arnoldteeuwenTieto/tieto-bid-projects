# Dashboard calculations and demo limitations

The `/dashboard` route uses the existing Tieto shell and HashRouter. No independent customer or bid dataset is introduced. `DashboardService.snapshot()` reads the existing service instances concurrently; `analyzeDashboard` is a pure calculation layer with an explicit `today` argument for deterministic testing. The UI obtains today's date in Europe/Oslo, and refresh reloads both services and the date.

## Metric and filter definitions

- Customer, stage and category filters scope bid metrics. A selected period scopes current open bids by **createdDate**, not by record modification or historical stage changes. All time includes records without creation dates; date-limited views exclude them.
- Active/open stages come from `activeBidStages` in `config/bidOptions.ts`: Draft, In progress and Submitted. Won/Lost are separate outcomes. Unknown stages are excluded from these classifications and reported in coverage.
- Pipeline charts show **current stage distribution of the creation cohort**, never a historical funnel or conversion rate. Every chart row is a keyboard-accessible link with a visible count and a descriptive accessible name.
- Open estimated value includes only finite non-negative values with recognized uppercase currency codes. Totals and top-customer rankings are separate per currency. No FX conversion or cross-currency grand total is calculated. Known zero values are valid; no qualifying values yields N/A.
- Weighted pipeline uses only those same valid records with an explicit finite probability in [0, 1]. Zero probability is valid. Coverage/exclusions are displayed. Probabilities are fictional assumptions, not production forecasts.
- Win rate is **won / (won + lost)**. Open bids are excluded; no closed outcomes yields N/A. All time uses all records currently marked Won/Lost, including records missing actualCloseDate. Period views use actualCloseDate within the selected period, independently of createdDate; missing close dates are excluded and reported.
- Customer totals, active status and contact alerts are **current customer snapshots**, affected by the customer filter only. Bid stage/category/period filters do not reinterpret a customer's status or contact history. These different filter/date bases are labelled in the UI.
- Portfolio open/no-open counts are intersections with scoped open bids. A customer with no open bid in this scope is not classified as underutilized. The list links to customer details. Top-value rankings require positive known open value and use only customers present in the customer service.
- Upcoming decision alerts use expectedDecisionDate between today and the configured upcoming horizon inclusive. Overdue next actions are strictly before today. Stalled bids and customer inactivity use explicit activity/contact dates strictly older than their configured thresholds. Invalid/missing/future activity or contact dates are reported as unknown, not assumed stale. Activity is never inferred from modification timestamps.

Thresholds and period choices live in `src/config/dashboard.ts` (initially 30 days upcoming, 45 stalled, 180 inactive). Date fields are optional ISO calendar dates. New demo bids/customers do not receive fabricated financial or engagement assumptions.

## Navigation

Dashboard links preserve customer/stage/category scope and date basis through query parameters inside the hash route. Bids supports `stage`, `category`, `scope=open|closed|valued-open`, `createdFrom/createdTo` and `closedFrom/closedTo`, in addition to the original customerId. Visible badges show dashboard scope; clear filters removes it. Customers supports `status` and optional `scopeCustomerId` table filters. The original customerId parameter still opens a customer details panel. Bid/customer alert and chart links use stable record IDs.

## Production data required

Real estimates and consistent currency codes are needed for values, and an approved FX dataset/policy is needed before any combined-currency amount can be shown. Probability ownership and calibration are needed for forecasting. Reliable created/decision/close/activity/contact dates and ownership mappings are needed for period reporting and attention alerts. Source stage/category mappings, won/lost definitions, thresholds and authority/reconciliation rules need agreement. Stage-transition history is required for historical conversion analysis. CRM/project utilization and capacity data are required before stronger customer-utilization claims. None are inferred from the current mock data.

## Files and validation

Created: `analytics/dashboard.ts`, `services/DashboardService.ts`, `config/dashboard.ts`, `pages/Dashboard.tsx`, `components/DashboardCards.tsx`, `styles/dashboard.css` and this document.

Updated: customer/bid models and their original seed files; dashboard routing; Bids/Customers URL filtering and bid query selection; customer/bid detail metadata; calculation/service tests and the Pages build smoke check. Existing services, IDs, logos, sidebar and workflow remain in place. No new dependency, external integration or deployment is required.

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then `node tests/pages-build.mjs` for local repository-base asset checks. Tests cover empty datasets, no closed bids, zero win rate, closed-date versus creation cohorts, mixed currencies, zero/invalid/missing amounts and probabilities, engagement dates, filter drill-through and shared service updates.
