# Bids demo architecture

`Bid` uses stable application IDs and references canonical `Customer.id` values. `externalId` is source metadata only. All bid reads/writes go through `BidService`; the shared instance is selected in `src/services/bids.ts` and can later be replaced with a backend/API adapter. No transport, authentication or source authority is assumed.

`src/data/bids.ts` is the only bid seed dataset. The first three bid IDs, titles, stages and customer links retain the original relationship fixtures. Additional fictional records exercise the overview and pagination. Customer details reads the same shared service, so newly created/reassigned/edited bids remain consistent across navigation. `src/data/relationships.ts` now contains only project fixtures.

Stage/category/co-owner choices and the active-stage definition are provisional and live in `src/config/bidOptions.ts`. No production SharePoint choices are implied. The mock validates required fields, options and customer references; an actual backend adapter will need agreed validation, identity, authorization and concurrency policies.

The overview supports title/customer search, sortable columns, combined customer/stage/category filters and pagination. Statistics reflect the selected customer scope, independently of the text/stage/category filters. Active means Draft, In progress or Submitted in this demo.

Routes:

- `/bids?customerId=...` scopes the directory to one canonical customer.
- `/bids/new?customerId=...` preselects that customer in the create form.
- `/bids/:recordId?customerId=...` opens the bid details panel, preserving the customer scope.
- `/customers?customerId=...` opens the matching customer details panel, even if the customer is on another table page.

Create/edit forms save only through the mock service. Existing source IDs and external URLs are preserved by edits and are not editable in the demo form. Mock changes survive local navigation and reset on browser refresh. Refreshing a newly generated bid ID will show a not-found state.

Teams and library actions require explicit URLs and exact approved HTTPS origins. Library validation uses the existing shared policy; Teams has a separate empty allowlist. Both fail closed by default. No URLs are generated from titles or customer names.

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Local tests cover identity, relationships, mutation validation, search/filter/sort and trusted URL policy. No extra dependencies were installed.
