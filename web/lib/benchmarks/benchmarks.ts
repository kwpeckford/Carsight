import fs from "fs";
import path from "path";
import { Triplet, ValidationIssue, ensureTriplet, ValidationResult } from "../contracts/types";

export type PriceBenchmark = {
  level: "model" | "variant";
  label: string;
  price: Triplet;
  sample_size: number;
  last_updated: string;
};

export type BenchmarksV1 = {
  schema_version: "1.0";
  vehicle_key: string;
  region: string;
  mileage: Triplet & { sample_size: number; last_updated: string };
  prices: PriceBenchmark[];
};

const ensureString = (value: any, path: string): ValidationIssue[] =>
  typeof value === "string" ? [] : [{ path, message: "expected string" }];

export const validateBenchmarksV1 = (input: any): ValidationResult<BenchmarksV1> => {
  const errors: ValidationIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: [{ path: "root", message: "expected object" }] };
  }
  if (input.schema_version !== "1.0") {
    errors.push({ path: "schema_version", message: "expected schema_version '1.0'" });
  }
  errors.push(...ensureString(input.vehicle_key, "vehicle_key"));
  errors.push(...ensureString(input.region, "region"));
  errors.push(...ensureTriplet(input.mileage, "mileage"));
  if (typeof input.mileage?.sample_size !== "number") {
    errors.push({ path: "mileage.sample_size", message: "expected number" });
  }
  if (typeof input.mileage?.last_updated !== "string") {
    errors.push({ path: "mileage.last_updated", message: "expected string" });
  }
  if (!Array.isArray(input.prices)) {
    errors.push({ path: "prices", message: "expected prices array" });
  } else {
    input.prices.forEach((price: any, idx: number) => {
      const base = `prices[${idx}]`;
      if (price.level !== "model" && price.level !== "variant") {
        errors.push({ path: `${base}.level`, message: "expected 'model' or 'variant'" });
      }
      errors.push(...ensureString(price.label, `${base}.label`));
      errors.push(...ensureTriplet(price.price, `${base}.price`));
      if (typeof price.sample_size !== "number") {
        errors.push({ path: `${base}.sample_size`, message: "expected number" });
      }
      errors.push(...ensureString(price.last_updated, `${base}.last_updated`));
    });
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: input as BenchmarksV1 };
};

export const loadBenchmarkFixture = (filePath: string): BenchmarksV1 => {
  const fullPath = path.resolve(filePath);
  const parsed = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  const validation = validateBenchmarksV1(parsed);
  if (!validation.ok) {
    const issueSummary = validation.errors.map((e) => `${e.path}: ${e.message}`).join("; ");
    throw new Error(`Invalid benchmark fixture ${fullPath}: ${issueSummary}`);
  }
  return validation.value;
};

