import { ScenarioInputV1 } from "./scenario.v1";
import { ResolvedMetricsV1 } from "./resolved-metrics.v1";
import { Triplet, ValidationResult, ValidationIssue, ensureTriplet } from "./types";
import { BenchmarksV1 } from "../benchmarks/benchmarks";

export type LineItem = {
  label: string;
  amount: number;
};

export type OperatingYear = {
  year: number;
  fuel: Triplet;
  maintenance: Triplet;
  insurance: Triplet;
  total: Triplet;
};

export type CurvePoint = {
  year: number;
  value: Triplet;
};

export type DecisionMetrics = {
  cost_per_km: Triplet;
  cost_per_year: Triplet;
  uncertainty_width: number;
};

export type ModelOutputV1 = {
  schema_version: "1.0";
  scenario: ScenarioInputV1;
  resolved_metrics: ResolvedMetricsV1;
  upfront: LineItem[];
  financing: {
    monthly_payment?: number;
    total_interest?: number;
    total_paid?: number;
    months?: number;
  };
  operating_costs: OperatingYear[];
  resale_curve: CurvePoint[];
  cumulative_costs: CurvePoint[];
  horizon_totals: Triplet;
  decision_metrics: DecisionMetrics;
  benchmarks?: BenchmarksV1;
};

export const validateModelOutputV1 = (input: any): ValidationResult<ModelOutputV1> => {
  const errors: ValidationIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: [{ path: "root", message: "expected object" }] };
  }
  if (input.schema_version !== "1.0") {
    errors.push({ path: "schema_version", message: "expected schema_version '1.0'" });
  }
  if (!Array.isArray(input.upfront)) {
    errors.push({ path: "upfront", message: "expected upfront line items" });
  }
  if (!Array.isArray(input.operating_costs)) {
    errors.push({ path: "operating_costs", message: "expected operating_costs array" });
  } else {
    input.operating_costs.forEach((year: any, idx: number) => {
      const base = `operating_costs[${idx}]`;
      errors.push(
        ...ensureTriplet(year.fuel, `${base}.fuel`),
        ...ensureTriplet(year.maintenance, `${base}.maintenance`),
        ...ensureTriplet(year.insurance, `${base}.insurance`),
        ...ensureTriplet(year.total, `${base}.total`)
      );
    });
  }
  if (!Array.isArray(input.resale_curve)) {
    errors.push({ path: "resale_curve", message: "expected resale_curve array" });
  }
  if (!Array.isArray(input.cumulative_costs)) {
    errors.push({ path: "cumulative_costs", message: "expected cumulative_costs array" });
  }
  errors.push(...ensureTriplet(input.horizon_totals, "horizon_totals"));
  if (typeof input.decision_metrics?.uncertainty_width !== "number") {
    errors.push({ path: "decision_metrics.uncertainty_width", message: "expected number" });
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: input as ModelOutputV1 };
};

