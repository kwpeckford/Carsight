import { DepreciationPoint } from "../contracts/resolved-metrics.v1";
import { Triplet } from "../contracts/types";

export const buildResaleCurve = (purchase_price: number, depreciation: DepreciationPoint[], horizon_years: number) => {
  const sorted = [...depreciation].sort((a, b) => a.year - b.year);
  const curve: { year: number; value: Triplet }[] = [];
  for (let year = 0; year <= horizon_years; year++) {
    const match = sorted.find((p) => p.year === year);
    const fallback = sorted[sorted.length - 1];
    const point = match ?? fallback;
    curve.push({ year, value: multiplyTriplet(point.retention, purchase_price) });
  }
  return curve;
};

export const buildCumulativeCostCurve = (
  horizon_years: number,
  upfront: number,
  financing_interest: number,
  operating: { year: number; total: Triplet }[],
  resale_curve: { year: number; value: Triplet }[]
) => {
  const cumulative: { year: number; value: Triplet }[] = [];
  let cumulativeP10 = upfront + financing_interest;
  let cumulativeP50 = upfront + financing_interest;
  let cumulativeP90 = upfront + financing_interest;

  for (let year = 1; year <= horizon_years; year++) {
    const op = operating.find((o) => o.year === year) ?? operating[operating.length - 1];
    cumulativeP10 += op.total.p10;
    cumulativeP50 += op.total.p50;
    cumulativeP90 += op.total.p90;
    const resale = resale_curve.find((r) => r.year === year)?.value ?? resale_curve[resale_curve.length - 1].value;
    cumulative.push({
      year,
      value: {
        p10: cumulativeP10 - resale.p10,
        p50: cumulativeP50 - resale.p50,
        p90: cumulativeP90 - resale.p90,
      },
    });
  }
  return cumulative;
};

export const multiplyTriplet = (triplet: Triplet, factor: number): Triplet => ({
  p10: triplet.p10 * factor,
  p50: triplet.p50 * factor,
  p90: triplet.p90 * factor,
});

export const addTriplets = (...triplets: Triplet[]): Triplet => {
  return triplets.reduce<Triplet>(
    (acc, t) => ({ p10: acc.p10 + t.p10, p50: acc.p50 + t.p50, p90: acc.p90 + t.p90 }),
    { p10: 0, p50: 0, p90: 0 }
  );
};

export const scaleTriplet = (triplet: Triplet, factor: number): Triplet => ({
  p10: triplet.p10 * factor,
  p50: triplet.p50 * factor,
  p90: triplet.p90 * factor,
});

