# Plan Review: Vehicle TCO System (v1)

## Overall takeaways
- The staged approach is sound but currently lacks explicit acceptance criteria per stage, which risks scope creep and misalignment on when to advance.
- The plan leans heavily on data architecture (Scenario/Evidence/Resolved/Result), which is good for modularity; however, no threat model or privacy stance is defined for handling VIN/location inputs.
- Testing and reproducibility are mentioned late (steps 7–9); earlier scaffolding for fixtures and deterministic runs would reduce rework.

## Strengths
- **Clear data backbone:** The Scenario/Evidence/Resolved/Result schema gives a strong contract for connectors and modeling.
- **Iterative integration:** Adding one source at a time with normalization/tests reduces coupling and simplifies debugging.
- **Explainability focus:** Explicit outputs (range, breakdown, drivers, assumptions) build trust for an MVP.

## Potential issues & mitigation suggestions
1. **Undefined success gates per phase**  
   - Mitigation: Add "exit criteria" to each step (e.g., Step 4 = deterministic CLI with seeded sample scenarios; Step 5 = confidence scoring rubric documented and unit-tested).

2. **Uncertainty representation left open-ended**  
   - Mitigation: Choose a simple default (triangular or P10/P50/P90 ranges) now, and require connectors to return that shape plus confidence score; document merge rules.

3. **Evidence provenance and auditing**  
   - Mitigation: Standardize evidence metadata (source URL, fetch time, normalization rules applied, schema version). Include a lightweight receipt log per run to support reproducibility.

4. **Data quality guardrails**  
   - Mitigation: Add per-metric validation (e.g., fuel efficiency bounds by powertrain) and anomaly handling (drop/flag/ask for manual confirmation). Bake into connector contract.

5. **Caching and idempotency timing**  
   - Mitigation: Introduce a simple cache abstraction early (in-memory + disk) so connectors can opt-in; later swap for Redis without API changes.

6. **Risk of overfitting to Canada-only inputs**  
   - Mitigation: Keep location model normalized (country/province/city) and avoid hard-coding CAD-only assumptions; isolate currency/units in a utilities module.

7. **Operational concerns deferred**  
   - Mitigation: Define an error taxonomy and retries per connector now (e.g., transient, permanent, data-gap). Capture in telemetry logs even in CLI mode.

## Quick wins to add before building
- Document the canonical schemas (Scenario, Evidence, ResolvedMetric, Result) in code as data classes plus a schema.md reference.
- Prepare 3–5 sample scenarios (e.g., ICE vs. hybrid vs. EV; urban vs. rural) to anchor testing and sanity-check ranges.
- Add a `tests/fixtures` folder with placeholder connector responses to enable pure-model tests in Step 4.
- Define a simple sensitivity method (e.g., finite differences on key metrics) so "what mattered most" has a consistent definition.
- Create a minimal CLI (`tco run --scenario samples/toronto_ev.yml`) that works offline using fixtures; this becomes the demo harness.

## Proposed acceptance checkpoints
- **Step 4 complete:** Deterministic offline CLI that takes a scenario YAML/JSON and outputs TCO range + breakdown using hardcoded/fixture metrics; unit tests for the math.
- **Step 5 complete:** Evidence object supports uncertainty, confidence score, provenance metadata; merge rules covered by tests.
- **Step 6 complete:** Connector interface defined with contracts for caching, validation, error taxonomy; one mock connector implemented with fixture data.
- **Step 7 complete:** First real source integrated (fuel price, Canada) with normalization, fixture, retry/backoff, and golden tests.

## Open questions to align with strategy
- How sensitive must the MVP be (P10/P50/P90 vs. best/mid/worst)?
- Are we comfortable shipping with Canada-only data, or do we need early multi-region abstraction?
- What is the minimum acceptable "confidence" explanation for stakeholders (numeric score, badges, or textual rationale)?
- Do we need a privacy statement for VIN/location inputs at this stage?
