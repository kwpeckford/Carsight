'use client';

import { useEffect, useState } from 'react';
import { computeModelOutput } from '@/lib/core/model';
import { compareModelOutputs } from '@/lib/core/compare';
import type { ScenarioInputV1 } from '@/lib/contracts/scenario.v1';
import type { ResolvedMetricsV1 } from '@/lib/contracts/resolved-metrics.v1';
import type { ModelOutputV1 } from '@/lib/contracts/model-output.v1';
import type { ComparisonOutputV1 } from '@/lib/contracts/comparison-output.v1';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ComparePage() {
  const [comparison, setComparison] = useState<ComparisonOutputV1 | null>(null);
  const [modelA, setModelA] = useState<ModelOutputV1 | null>(null);
  const [modelB, setModelB] = useState<ModelOutputV1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndCompare() {
      try {
        // Load test data
        const scenario = await fetch('/fixtures/scenarios/sample_sedan.json').then(r => r.json()) as ScenarioInputV1;
        const metricsRegular = await fetch('/fixtures/resolved_metrics/mazda3_regular.json').then(r => r.json()) as ResolvedMetricsV1;
        const metricsHybrid = await fetch('/fixtures/resolved_metrics/mazda3_hybridish.json').then(r => r.json()) as ResolvedMetricsV1;

        // Compute TCO for both vehicles
        const outputRegular = computeModelOutput(scenario, metricsRegular);
        const outputHybrid = computeModelOutput(scenario, metricsHybrid);

        // Compare them
        const comparisonResult = compareModelOutputs(
          scenario.scenario_id,
          { label: 'Mazda3 Regular', output: outputRegular },
          { label: 'Mazda3 Hybrid', output: outputHybrid }
        );

        setModelA(outputRegular);
        setModelB(outputHybrid);
        setComparison(comparisonResult);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comparison');
        setLoading(false);
      }
    }

    loadAndCompare();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating total cost of ownership...</p>
        </div>
      </div>
    );
  }

  if (error || !comparison || !modelA || !modelB) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Comparison</h2>
          <p className="text-red-600">{error || 'Failed to load comparison data'}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = modelA.cumulative_costs.map((point, idx) => ({
    year: point.year,
    regular: Math.round(point.value.p50),
    hybrid: Math.round(modelB.cumulative_costs[idx].value.p50)
  }));

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatTriplet = (t: { p10: number; p50: number; p90: number }) =>
    `$${t.p50.toLocaleString()} ($${t.p10.toLocaleString()} - $${t.p90.toLocaleString()})`;

  const upfrontA = modelA.upfront.reduce((sum, item) => sum + item.amount, 0);
  const upfrontB = modelB.upfront.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vehicle Comparison</h1>
          <p className="text-gray-600">5-year Total Cost of Ownership Analysis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{comparison.subject_a}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Upfront Cost</p>
                <p className="text-xl font-semibold">{formatCurrency(upfrontA)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">5-Year Total Cost</p>
                <p className="text-xl font-semibold">{formatTriplet(modelA.horizon_totals)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cost per km</p>
                <p className="text-xl font-semibold">{formatTriplet(modelA.decision_metrics.cost_per_km)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{comparison.subject_b}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Upfront Cost</p>
                <p className="text-xl font-semibold">{formatCurrency(upfrontB)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">5-Year Total Cost</p>
                <p className="text-xl font-semibold">{formatTriplet(modelB.horizon_totals)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cost per km</p>
                <p className="text-xl font-semibold">{formatTriplet(modelB.decision_metrics.cost_per_km)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Break-even Analysis */}
        {comparison.break_even_year_p50 !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Break-Even Analysis</h3>
            <p className="text-blue-800">
              <span className="font-semibold">{comparison.subject_b}</span> breaks even in year{' '}
              <span className="font-bold text-2xl">{comparison.break_even_year_p50}</span>
            </p>
            <p className="text-blue-700 mt-2 text-sm">
              After this point, {comparison.subject_b} becomes the more economical choice.
            </p>
          </div>
        )}

        {/* Cumulative Cost Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Cumulative Cost Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: 'Total Cost', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
              <Legend />
              <Line
                type="monotone"
                dataKey="regular"
                stroke="#ef4444"
                strokeWidth={2}
                name={comparison.subject_a}
              />
              <Line
                type="monotone"
                dataKey="hybrid"
                stroke="#10b981"
                strokeWidth={2}
                name={comparison.subject_b}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Cost Breakdown Comparison</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-right py-3 px-4">{comparison.subject_a}</th>
                  <th className="text-right py-3 px-4">{comparison.subject_b}</th>
                  <th className="text-right py-3 px-4">Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Upfront Cost</td>
                  <td className="text-right py-3 px-4">{formatCurrency(upfrontA)}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(upfrontB)}</td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(upfrontB - upfrontA)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Total Fuel Cost (5 years)</td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(modelA.operating_costs.reduce((sum, y) => sum + y.fuel.p50, 0))}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(modelB.operating_costs.reduce((sum, y) => sum + y.fuel.p50, 0))}
                  </td>
                  <td className="text-right py-3 px-4 text-green-600 font-semibold">
                    {formatCurrency(
                      modelB.operating_costs.reduce((sum, y) => sum + y.fuel.p50, 0) -
                      modelA.operating_costs.reduce((sum, y) => sum + y.fuel.p50, 0)
                    )}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Total Maintenance (5 years)</td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(modelA.operating_costs.reduce((sum, y) => sum + y.maintenance.p50, 0))}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(modelB.operating_costs.reduce((sum, y) => sum + y.maintenance.p50, 0))}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(
                      modelB.operating_costs.reduce((sum, y) => sum + y.maintenance.p50, 0) -
                      modelA.operating_costs.reduce((sum, y) => sum + y.maintenance.p50, 0)
                    )}
                  </td>
                </tr>
                <tr className="border-b font-semibold">
                  <td className="py-3 px-4">5-Year Total</td>
                  <td className="text-right py-3 px-4">{formatCurrency(modelA.horizon_totals.p50)}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(modelB.horizon_totals.p50)}</td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(modelB.horizon_totals.p50 - modelA.horizon_totals.p50)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* The Truth Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">The Truth</h3>
          <p className="text-lg mb-4">
            Despite the hybrid costing more upfront, it saves you money through lower fuel costs.
            The numbers don't lie - you'll break even in year {comparison.break_even_year_p50}.
          </p>
          <p className="text-blue-100">
            This is what "value" really means - not marketing claims about reliability,
            but actual dollars and cents over your ownership period.
          </p>
        </div>
      </div>
    </div>
  );
}
