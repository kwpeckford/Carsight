import fs from "fs";
import path from "path";
import { computeModelOutput } from "../core/model";
import { validateScenarioInputV1 } from "../contracts/scenario.v1";
import { validateResolvedMetricsV1 } from "../contracts/resolved-metrics.v1";
import { compareModelOutputs } from "../core/compare";
import { comparisonToText } from "./formatters";

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  return undefined;
};

const scenarioPath = getArg("--scenario");
const metricsAPath = getArg("--metricsA");
const metricsBPath = getArg("--metricsB");
const labelA = getArg("--labelA") ?? "A";
const labelB = getArg("--labelB") ?? "B";
const outputFormat = getArg("--format") ?? "text";

if (!scenarioPath || !metricsAPath || !metricsBPath) {
  console.error(
    "Usage: ts-node cli/compare.ts --scenario path --metricsA path --metricsB path [--labelA name] [--labelB name] [--format text|json]"
  );
  process.exit(1);
}

const scenario = JSON.parse(fs.readFileSync(path.resolve(scenarioPath), "utf-8"));
const metricsA = JSON.parse(fs.readFileSync(path.resolve(metricsAPath), "utf-8"));
const metricsB = JSON.parse(fs.readFileSync(path.resolve(metricsBPath), "utf-8"));

const scenarioValidation = validateScenarioInputV1(scenario);
if (!scenarioValidation.ok) {
  throw new Error(`Invalid scenario: ${JSON.stringify(scenarioValidation.errors, null, 2)}`);
}
const metricsValidationA = validateResolvedMetricsV1(metricsA);
const metricsValidationB = validateResolvedMetricsV1(metricsB);
if (!metricsValidationA.ok || !metricsValidationB.ok) {
  throw new Error(`Invalid metrics: ${JSON.stringify({ A: metricsValidationA, B: metricsValidationB }, null, 2)}`);
}

const outputA = computeModelOutput(scenarioValidation.value, metricsValidationA.value);
const outputB = computeModelOutput(scenarioValidation.value, metricsValidationB.value);
const comparison = compareModelOutputs(scenarioValidation.value.scenario_id, { label: labelA, output: outputA }, { label: labelB, output: outputB });

if (outputFormat === "json") {
  console.log(JSON.stringify(comparison, null, 2));
} else {
  console.log(comparisonToText(comparison));
}

