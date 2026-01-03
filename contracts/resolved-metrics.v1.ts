import { ensureNumber, ensureTriplet, ValidationIssue, ValidationResult, Triplet } from "./types";

export type DepreciationPoint = {
  year: number;
  retention: Triplet; // fraction of purchase price retained
};

export type ResolvedMetricsV1 = {
  schema_version: "1.0";
  vehicle_id: string;
  fuel_price_per_liter: Triplet;
  fuel_efficiency_l_per_100km: Triplet;
  depreciation: DepreciationPoint[];
  maintenance_per_year?: Triplet;
  insurance_per_year?: Triplet;
};

const validateDepreciation = (points: any, path: string): ValidationIssue[] => {
  if (!Array.isArray(points) || points.length === 0) {
    return [{ path, message: "expected non-empty depreciation array" }];
  }
  const errors: ValidationIssue[] = [];
  points.forEach((p, idx) => {
    const base = `${path}[${idx}]`;
    errors.push(...ensureNumber(p.year, `${base}.year`), ...ensureTriplet(p.retention, `${base}.retention`));
  });
  return errors;
};

export const validateResolvedMetricsV1 = (input: any): ValidationResult<ResolvedMetricsV1> => {
  const errors: ValidationIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: [{ path: "root", message: "expected object" }] };
  }
  if (input.schema_version !== "1.0") {
    errors.push({ path: "schema_version", message: "expected schema_version '1.0'" });
  }
  errors.push(...ensureString(input.vehicle_id, "vehicle_id"));
  errors.push(...ensureTriplet(input.fuel_price_per_liter, "fuel_price_per_liter"));
  errors.push(...ensureTriplet(input.fuel_efficiency_l_per_100km, "fuel_efficiency_l_per_100km"));
  errors.push(...validateDepreciation(input.depreciation, "depreciation"));
  if (input.maintenance_per_year) {
    errors.push(...ensureTriplet(input.maintenance_per_year, "maintenance_per_year"));
  }
  if (input.insurance_per_year) {
    errors.push(...ensureTriplet(input.insurance_per_year, "insurance_per_year"));
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: input as ResolvedMetricsV1 };
};

function ensureString(value: any, path: string): ValidationIssue[] {
  return typeof value === "string" ? [] : [{ path, message: "expected string" }];
}

