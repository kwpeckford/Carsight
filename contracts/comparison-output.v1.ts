import { Triplet, ValidationIssue, ValidationResult, ensureTriplet } from "./types";

export type ComparisonWhy = {
  factor: string;
  delta: number;
  note?: string;
};

export type ComparisonOutputV1 = {
  schema_version: "1.0";
  scenario_id: string;
  subject_a: string;
  subject_b: string;
  upfront_delta: number;
  annual_operating_delta_p50: number;
  break_even_year_p50: number | null;
  horizon_delta: Triplet;
  reasons: ComparisonWhy[];
};

export const validateComparisonOutputV1 = (input: any): ValidationResult<ComparisonOutputV1> => {
  const errors: ValidationIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: [{ path: "root", message: "expected object" }] };
  }
  if (input.schema_version !== "1.0") {
    errors.push({ path: "schema_version", message: "expected schema_version '1.0'" });
  }
  ["scenario_id", "subject_a", "subject_b"].forEach((field) => {
    if (typeof (input as any)[field] !== "string") {
      errors.push({ path: field, message: "expected string" });
    }
  });
  if (typeof input.upfront_delta !== "number") {
    errors.push({ path: "upfront_delta", message: "expected number" });
  }
  if (typeof input.annual_operating_delta_p50 !== "number") {
    errors.push({ path: "annual_operating_delta_p50", message: "expected number" });
  }
  if (input.break_even_year_p50 !== null && typeof input.break_even_year_p50 !== "number") {
    errors.push({ path: "break_even_year_p50", message: "expected number or null" });
  }
  errors.push(...ensureTriplet(input.horizon_delta, "horizon_delta"));
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: input as ComparisonOutputV1 };
};

