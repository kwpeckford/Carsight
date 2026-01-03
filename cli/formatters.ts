import { ComparisonOutputV1 } from "../contracts/comparison-output.v1";
import { ModelOutputV1 } from "../contracts/model-output.v1";

export const formatTriplet = (t: { p10: number; p50: number; p90: number }) => `p10: ${t.p10.toFixed(0)}, p50: ${t.p50.toFixed(0)}, p90: ${t.p90.toFixed(0)}`;

export const modelOutputToText = (output: ModelOutputV1): string => {
  const lines: string[] = [];
  lines.push(`# TCO for ${output.scenario.vehicle.make} ${output.scenario.vehicle.model} (${output.scenario.usage.horizon_years}y)`);
  lines.push("\n## Upfront");
  output.upfront.forEach((item) => lines.push(`- ${item.label}: ${item.amount.toFixed(0)} ${output.scenario.location.currency}`));
  if (output.financing.monthly_payment) {
    lines.push(`- financing monthly: ${output.financing.monthly_payment.toFixed(2)} (${output.financing.months} months)`);
    lines.push(`- financing interest: ${output.financing.total_interest?.toFixed(0)}`);
  }
  lines.push("\n## Operating (annual)");
  output.operating_costs.forEach((op) => {
    lines.push(`Year ${op.year}: fuel ${formatTriplet(op.fuel)}, maintenance ${formatTriplet(op.maintenance)}, insurance ${formatTriplet(op.insurance)}, total ${formatTriplet(op.total)}`);
  });
  lines.push("\n## Resale curve");
  output.resale_curve.forEach((r) => lines.push(`Year ${r.year}: ${formatTriplet(r.value)}`));
  lines.push("\n## Cumulative costs");
  output.cumulative_costs.forEach((c) => lines.push(`Year ${c.year}: ${formatTriplet(c.value)}`));
  lines.push(`\nHorizon total: ${formatTriplet(output.horizon_totals)}`);
  lines.push(`Cost per km: ${formatTriplet(output.decision_metrics.cost_per_km)}`);
  lines.push(`Cost per year: ${formatTriplet(output.decision_metrics.cost_per_year)}`);
  if (output.benchmarks) {
    lines.push("\n## Benchmarks");
    lines.push(`Mileage: ${formatTriplet(output.benchmarks.mileage)} (n=${output.benchmarks.mileage.sample_size})`);
    output.benchmarks.prices.forEach((price) => lines.push(`${price.level} ${price.label}: ${formatTriplet(price.price)} (n=${price.sample_size})`));
  }
  return lines.join("\n");
};

export const comparisonToText = (comparison: ComparisonOutputV1): string => {
  const lines: string[] = [];
  lines.push(`# Comparison: ${comparison.subject_a} vs ${comparison.subject_b}`);
  lines.push(`Upfront delta: ${comparison.upfront_delta.toFixed(0)}`);
  lines.push(`Annual operating delta p50: ${comparison.annual_operating_delta_p50.toFixed(0)}`);
  lines.push(`Break-even year (p50): ${comparison.break_even_year_p50 ?? "never"}`);
  lines.push(`Horizon delta: ${formatTriplet(comparison.horizon_delta)}`);
  lines.push("Reasons:");
  comparison.reasons.forEach((reason) => lines.push(`- ${reason.factor}: ${reason.delta.toFixed(0)}${reason.note ? ` (${reason.note})` : ""}`));
  return lines.join("\n");
};

