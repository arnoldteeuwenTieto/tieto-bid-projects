# Customer adapter boundary

`src/models/Customer.ts` is the canonical application contract. The existing 15 fictional records retain IDs `1` through `15`; those are application IDs, not SharePoint item IDs. `fromLegacyCustomer` keeps the original mock shape compatible. Newly created records receive UUIDs.

All customer reads and writes in the directory, details panel and creation form use the injected `CustomerService`. The default implementation is selected in `src/services/customers.ts`. The mock adapter keeps changes in memory, including across local navigation, and resets when the page reloads. Related bids are read from the shared BidService; related projects remain separate, explicitly fictional typed fixtures keyed by canonical customer ID.

## Future backend adapter

Implement `CustomerService` with a backend/API client and replace the composition-root instance. Keep transport, authentication and credentials outside UI components; secrets belong on the backend. The UI accepts a service prop for adapter substitution and loading/error testing. No external integration is currently implemented.

Maintain a durable backend identity registry linking canonical application IDs to `(sourceSystem, externalId)` pairs. Never derive canonical IDs from SharePoint item IDs, organization numbers or names. Multiple source records can map to one canonical customer through that registry; the current record-level source fields describe provenance and do not choose an authoritative system. Authority, reconciliation and write routing must be agreed before connecting either source.

`mapPowerAppsCustomer` maps `CustomerName`, `NormalisedName`, `Organisasjonsnummer` and `ForretningsadressePoststed`. The caller must separately supply canonical identity, external identity, country and status; missing values are not inferred from a source item ID. It preserves a supplied normalized name and computes a normalized fallback when absent. The mapping helper performs no I/O.

Service contract: list returns a snapshot, get returns null if absent, create/update resolve the saved canonical record and reject on validation or transport failures. Update is a partial update to editable business fields; identity and provenance are not editable through this interface. The mock additionally rejects duplicate organization numbers as demo validation; backend uniqueness and concurrency policy must be agreed for a real adapter.

Library URLs must come from explicit data, never customer names. `validateLibraryUrl` allows only absolute HTTPS URLs without credentials and an exact configured origin. Its default allowlist is empty, so all current library actions are disabled. Approved origins must be configured after the actual library hosts are known; backend authorization and URL validation are also required when integration is implemented. No SharePoint URL is synthesized.

Bid and project routes retain `customerId` in the query string and record IDs in the path. Bids now has working local create/edit/detail screens; projects remain navigation placeholders. See `bid-architecture.md`.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. Tests cover mock identity preservation, copy isolation, CRUD validation, original field mapping, relationship keys and the URL trust policy. No additional test dependencies are required.

