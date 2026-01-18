import { ComparisonOutputV1, ComparisonWhy } from "../contracts/comparison-output.v1";
import { ModelOutputV1 } from "../contracts/model-output.v1";

export const compareModelOutputs = (
  scenario_id: string,
  subject_a: { label: string; output: ModelOutputV1 },
  subject_b: { label: string; output: ModelOutputV1 }
): ComparisonOutputV1 => {
  const upfrontDelta = subject_b.output.upfront.reduce((sum, item) => sum + item.amount, 0) -
    subject_a.output.upfront.reduce((sum, item) => sum + item.amount, 0);

  const opA = subject_a.output.operating_costs[0]?.total.p50 ?? 0;
  const opB = subject_b.output.operating_costs[0]?.total.p50 ?? 0;
  const annualOperatingDeltaP50 = opB - opA;

  const cumulativeA = subject_a.output.cumulative_costs.map((c) => ({ year: c.year, value: c.value.p50 }));
  const cumulativeB = subject_b.output.cumulative_costs.map((c) => ({ year: c.year, value: c.value.p50 }));
  const breakEven = findBreakEvenYear(cumulativeA, cumulativeB);

  const horizonDelta = {
    p10: subject_b.output.horizon_totals.p10 - subject_a.output.horizon_totals.p10,
    p50: subject_b.output.horizon_totals.p50 - subject_a.output.horizon_totals.p50,
    p90: subject_b.output.horizon_totals.p90 - subject_a.output.horizon_totals.p90,
  };

  const reasons: ComparisonWhy[] = [
    { factor: "upfront", delta: upfrontDelta },
    { factor: "operating_p50", delta: annualOperatingDeltaP50 },
    { factor: "resale_p50", delta: subject_b.output.resale_curve.slice(-1)[0].value.p50 - subject_a.output.resale_curve.slice(-1)[0].value.p50 },
  ];

  return {
    schema_version: "1.0",
    scenario_id,
    subject_a: subject_a.label,
    subject_b: subject_b.label,
    upfront_delta: upfrontDelta,
    annual_operating_delta_p50: annualOperatingDeltaP50,
    break_even_year_p50: breakEven,
    horizon_delta: horizonDelta,
    reasons,
  };
};

const findBreakEvenYear = (
  a: { year: number; value: number }[],
  b: { year: number; value: number }[]
): number | null => {
  const maxYear = Math.min(a.length, b.length);
  for (let i = 0; i < maxYear; i++) {
    const delta = b[i].value - a[i].value;
    if (delta <= 0) return b[i].year;
  }
  return null;
};

