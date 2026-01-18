import { ensureNumber, ensureString, ValidationIssue, ValidationResult } from "./types";

export type VehicleIdentity = {
  vin?: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
};

export type FinancingDetails = {
  apr_percent: number;
  term_months: number;
  down_payment: number;
};

export type Location = {
  country: string;
  province: string;
  city: string;
  currency: string;
  unit_system: "metric" | "imperial";
};

export type UsageProfile = {
  annual_km: number;
  horizon_years: number;
};

export type ScenarioInputV1 = {
  schema_version: "1.0";
  scenario_id: string;
  vehicle: VehicleIdentity & {
    purchase_price: number;
    fees: number;
    financing?: FinancingDetails;
  };
  location: Location;
  usage: UsageProfile;
  assumptions?: {
    include_insurance?: boolean;
    include_maintenance?: boolean;
  };
};

const validateFinancing = (financing: any, basePath: string): ValidationIssue[] => {
  if (financing === undefined) return [];
  if (typeof financing !== "object") return [{ path: basePath, message: "expected financing object" }];
  return [
    ...ensureNumber(financing.apr_percent, `${basePath}.apr_percent`),
    ...ensureNumber(financing.term_months, `${basePath}.term_months`),
    ...ensureNumber(financing.down_payment, `${basePath}.down_payment`),
  ];
};

export const validateScenarioInputV1 = (input: any): ValidationResult<ScenarioInputV1> => {
  const errors: ValidationIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: [{ path: "root", message: "expected object" }] };
  }
  if (input.schema_version !== "1.0") {
    errors.push({ path: "schema_version", message: "expected schema_version '1.0'" });
  }
  errors.push(...ensureString(input.scenario_id, "scenario_id"));
  const vehicle = input.vehicle;
  if (!vehicle || typeof vehicle !== "object") {
    errors.push({ path: "vehicle", message: "expected vehicle object" });
  } else {
    errors.push(
      ...ensureString(vehicle.make, "vehicle.make"),
      ...ensureString(vehicle.model, "vehicle.model"),
      ...ensureNumber(vehicle.year, "vehicle.year"),
      ...ensureNumber(vehicle.purchase_price, "vehicle.purchase_price"),
      ...ensureNumber(vehicle.fees, "vehicle.fees"),
      ...validateFinancing(vehicle.financing, "vehicle.financing")
    );
  }
  const location = input.location;
  if (!location || typeof location !== "object") {
    errors.push({ path: "location", message: "expected location object" });
  } else {
    errors.push(
      ...ensureString(location.country, "location.country"),
      ...ensureString(location.province, "location.province"),
      ...ensureString(location.city, "location.city"),
      ...ensureString(location.currency, "location.currency")
    );
    if (location.unit_system !== "metric" && location.unit_system !== "imperial") {
      errors.push({ path: "location.unit_system", message: "expected 'metric' or 'imperial'" });
    }
  }
  const usage = input.usage;
  if (!usage || typeof usage !== "object") {
    errors.push({ path: "usage", message: "expected usage object" });
  } else {
    errors.push(...ensureNumber(usage.annual_km, "usage.annual_km"), ...ensureNumber(usage.horizon_years, "usage.horizon_years"));
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: input as ScenarioInputV1 };
};

