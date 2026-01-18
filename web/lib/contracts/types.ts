export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: ValidationIssue[] };

export type Triplet = {
  p10: number;
  p50: number;
  p90: number;
};

export const ensureTriplet = (value: any, path: string): ValidationIssue[] => {
  if (value === undefined || value === null || typeof value !== "object") {
    return [{ path, message: "expected triplet object" }];
  }
  const keys: (keyof Triplet)[] = ["p10", "p50", "p90"];
  const issues: ValidationIssue[] = [];
  keys.forEach((key) => {
    if (typeof (value as any)[key] !== "number") {
      issues.push({ path: `${path}.${key}`, message: "expected number" });
    }
  });
  return issues;
};

export const ensureNumber = (value: any, path: string): ValidationIssue[] =>
  typeof value === "number" ? [] : [{ path, message: "expected number" }];

export const ensureString = (value: any, path: string): ValidationIssue[] =>
  typeof value === "string" ? [] : [{ path, message: "expected string" }];

export const ensureBoolean = (value: any, path: string): ValidationIssue[] =>
  typeof value === "boolean" ? [] : [{ path, message: "expected boolean" }];

