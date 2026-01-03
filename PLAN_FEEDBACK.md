# Plan Alignment: Vehicle TCO System (v1)

## Updated principles
- **Prioritize clarity and determinism over completeness:** v1 is a decision engine under uncertainty, not a full data platform. If a feature adds complexity without improving reasoning or explainability, defer it.
- **Keep the backbone modular:** Scenario → Evidence → Resolved Metrics → Result remains the core contract that connectors and the model share.
- **Canada-first, globally shaped:** Initial scope is Canada-only, but schemas should carry country/province/city plus unit and currency isolation to avoid hard-coding CAD-only assumptions.

## Phase gates (must be observable via CLI + tests)
- **Step 4 – pure model:** Deterministic offline CLI takes a scenario file and returns TCO range + breakdown using fixtures/hardcoded metrics; unit tests cover the math and sensitivity routine.
- **Step 5 – evidence/resolution:** Evidence objects carry P10/P50/P90 (low/mid/high) plus a confidence score, provenance (source id/URL, fetch timestamp, normalization/schema version), and notes; merge rules and confidence scoring rubric are unit-tested.
- **Step 6 – connector framework:** Connector interface defined with contracts for caching hooks, per-metric validation, and error taxonomy (transient/permanent/data-gap). One mock connector ships with fixtures and validation examples.
- **Step 7 – first live source:** Fuel price (Canada) connector integrated with normalization, fixtures for golden tests, retry/backoff, and validation that downgrades confidence on bounds violations instead of hard-failing.

## Decisions on uncertainty, evidence, and guardrails
- **Uncertainty shape:** Lock v1 to a 3-point range (P10/P50/P90 or low/mid/high). All connectors must emit this plus a confidence score; the model must handle ranges deterministically (no Monte Carlo in v1).
- **Evidence receipts:** Each Evidence item must include source identifier, fetch timestamp, normalization/schema version, and free-form notes to keep runs reproducible without heavy lineage.
- **Data quality:** Add lightweight sanity bounds per metric (e.g., fuel efficiency by powertrain, depreciation bounds). Violations flag and downgrade confidence; they do not halt the run.

## Caching and idempotency
- Implement a simple cache abstraction early (in-memory + disk) for deterministic runs and fixture parity. Avoid advanced semantics or external services in v1; design the interface so Redis/others can drop in later without contract changes.

## Operational stance
- Define and log an error taxonomy now (transient, permanent, data-gap). Enforcement/retries remain minimal; the goal is consistent logging even in offline CLI mode.
- Basic privacy hygiene: do not persist raw VINs by default; inputs live only for the run unless explicitly cached. No third-party sharing in v1.

## Quick wins to keep velocity
- Codify the canonical schemas as data classes plus a short `schema.md` or `contract.md` reference.
- Prepare 3–5 sample scenarios (ICE vs. hybrid vs. EV; urban vs. rural) for sanity checks and repeatable tests.
- Add `tests/fixtures/` with placeholder connector responses to enable pure-model tests in Step 4.
- Define a simple sensitivity method (finite differences on key metrics) so "what mattered most" is consistent and testable.
- Build an offline CLI (`tco run --scenario samples/toronto_ev.yml`) as the demo harness for every phase gate.

## Open alignment items
- Confirm the preferred labels for the 3-point range (P10/P50/P90 vs. low/mid/high) in outputs.
- Agree on the minimum acceptable confidence explanation (numeric score, badges, or short rationale) for stakeholders.
