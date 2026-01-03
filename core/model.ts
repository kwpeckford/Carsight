import { ScenarioInputV1 } from "../contracts/scenario.v1";
import { ResolvedMetricsV1 } from "../contracts/resolved-metrics.v1";
import { Triplet } from "../contracts/types";
import { BenchmarksV1 } from "../benchmarks/benchmarks";
import { calculateLoan } from "./finance";
import { addTriplets, buildCumulativeCostCurve, buildResaleCurve, multiplyTriplet, scaleTriplet } from "./curves";
import { ModelOutputV1 } from "../contracts/model-output.v1";

const annualFuelCost = (usageKm: number, efficiency: Triplet, fuelPrice: Triplet): Triplet => {
  const factor = usageKm / 100;
  return {
    p10: factor * efficiency.p10 * fuelPrice.p10,
    p50: factor * efficiency.p50 * fuelPrice.p50,
    p90: factor * efficiency.p90 * fuelPrice.p90,
  };
};

export const computeModelOutput = (
  scenario: ScenarioInputV1,
  metrics: ResolvedMetricsV1,
  benchmarks?: BenchmarksV1
): ModelOutputV1 => {
  const basePrice = scenario.vehicle.purchase_price + scenario.vehicle.fees;
  const financing = scenario.vehicle.financing
    ? calculateLoan(Math.max(basePrice - scenario.vehicle.financing.down_payment, 0), scenario.vehicle.financing.apr_percent, scenario.vehicle.financing.term_months)
    : { monthly_payment: 0, total_interest: 0, total_paid: 0, months: 0 };
  const upfrontItems = [
    { label: "purchase_price", amount: scenario.vehicle.purchase_price },
    { label: "fees", amount: scenario.vehicle.fees },
    { label: "down_payment", amount: scenario.vehicle.financing?.down_payment ?? 0 },
  ];
  const upfrontTotal = scenario.vehicle.purchase_price + scenario.vehicle.fees + (scenario.vehicle.financing?.down_payment ?? 0);
  const annualFuel = annualFuelCost(scenario.usage.annual_km, metrics.fuel_efficiency_l_per_100km, metrics.fuel_price_per_liter);
  const annualMaintenance = scenario.assumptions?.include_maintenance === false ? { p10: 0, p50: 0, p90: 0 } : metrics.maintenance_per_year ?? { p10: 0, p50: 0, p90: 0 };
  const annualInsurance = scenario.assumptions?.include_insurance === false ? { p10: 0, p50: 0, p90: 0 } : metrics.insurance_per_year ?? { p10: 0, p50: 0, p90: 0 };

  const operatingCost: { year: number; fuel: Triplet; maintenance: Triplet; insurance: Triplet; total: Triplet }[] = [];
  for (let year = 1; year <= scenario.usage.horizon_years; year++) {
    const total = addTriplets(annualFuel, annualMaintenance, annualInsurance);
    operatingCost.push({ year, fuel: annualFuel, maintenance: annualMaintenance, insurance: annualInsurance, total });
  }

  const resale = buildResaleCurve(basePrice, metrics.depreciation, scenario.usage.horizon_years);
  const cumulative = buildCumulativeCostCurve(
    scenario.usage.horizon_years,
    upfrontTotal,
    financing.total_interest,
    operatingCost.map((o) => ({ year: o.year, total: o.total })),
    resale
  );

  const horizonTotals = cumulative[cumulative.length - 1].value;
  const totalKm = scenario.usage.annual_km * scenario.usage.horizon_years;
  const decision_metrics = {
    cost_per_km: scaleTriplet(horizonTotals, 1 / totalKm),
    cost_per_year: scaleTriplet(horizonTotals, 1 / scenario.usage.horizon_years),
    uncertainty_width: (horizonTotals.p90 - horizonTotals.p10) / Math.max(horizonTotals.p50, 1),
  };

  return {
    schema_version: "1.0",
    scenario,
    resolved_metrics: metrics,
    upfront: upfrontItems,
    financing,
    operating_costs: operatingCost,
    resale_curve: resale,
    cumulative_costs: cumulative,
    horizon_totals: horizonTotals,
    decision_metrics,
    benchmarks,
  };
};

export const formatOperatingYear = (op: { year: number; fuel: Triplet; maintenance: Triplet; insurance: Triplet; total: Triplet }) => ({
  year: op.year,
  fuel: op.fuel,
  maintenance: op.maintenance,
  insurance: op.insurance,
  total: op.total,
});

