import fs from "fs";
import path from "path";
import { computeModelOutput } from "../core/model";
import { validateScenarioInputV1 } from "../contracts/scenario.v1";
import { validateResolvedMetricsV1 } from "../contracts/resolved-metrics.v1";
import { loadBenchmarkFixture } from "../benchmarks/benchmarks";
import { modelOutputToText } from "./formatters";

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  return undefined;
};

const scenarioPath = getArg("--scenario");
const metricsPath = getArg("--metrics");
const benchmarkPath = getArg("--benchmarks");
const outputFormat = getArg("--format") ?? "text";

if (!scenarioPath || !metricsPath) {
  console.error("Usage: ts-node cli/run.ts --scenario path --metrics path [--benchmarks path] [--format text|json]");
  process.exit(1);
}

const scenario = JSON.parse(fs.readFileSync(path.resolve(scenarioPath), "utf-8"));
const metrics = JSON.parse(fs.readFileSync(path.resolve(metricsPath), "utf-8"));
const scenarioValidation = validateScenarioInputV1(scenario);
if (!scenarioValidation.ok) {
  throw new Error(`Invalid scenario: ${JSON.stringify(scenarioValidation.errors, null, 2)}`);
}
const metricsValidation = validateResolvedMetricsV1(metrics);
if (!metricsValidation.ok) {
  throw new Error(`Invalid metrics: ${JSON.stringify(metricsValidation.errors, null, 2)}`);
}
const benchmarks = benchmarkPath ? loadBenchmarkFixture(benchmarkPath) : undefined;
const output = computeModelOutput(scenarioValidation.value, metricsValidation.value, benchmarks);

if (outputFormat === "json") {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(modelOutputToText(output));
}

