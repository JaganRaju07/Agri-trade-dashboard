import React from 'react';
import { TradeDataset, CoreAggregates, YearAggregate } from '../types/data';
import { KpiCard, LineChart } from '../components/charts';

interface Page01Props {
  dataset: TradeDataset;
  core: CoreAggregates;
  yearAggs: YearAggregate[];
}

export const Page01TradeOverview: React.FC<Page01Props> = ({
  core,
  yearAggs,
}) => {
  const isSurplus = core.tradeBalanceBn >= 0;
  const balanceColor = isSurplus ? 'var(--color-surplus)' : 'var(--color-deficit)';

  // Finding sentence
  const findingText = isSurplus
    ? `Exports exceeded imports by USD ${core.tradeBalanceBn.toFixed(2)} bn with an Export-Import Ratio of ${(core.ratio ?? 0).toFixed(2)} across the active selection.`
    : `Imports exceeded exports by USD ${Math.abs(core.tradeBalanceBn).toFixed(2)} bn resulting in a net trade deficit across the active selection.`;

  const sparklineExport = yearAggs.map((d) => d.exportValueBn);
  const sparklineImport = yearAggs.map((d) => d.importValueBn);
  const sparklineBalance = yearAggs.map((d) => d.tradeBalanceBn);
  const sparklineRatio = yearAggs.map((d) => d.ratio ?? 0);

  const lineData = yearAggs.map((d) => ({
    x: d.year,
    y: d.exportValueBn,
  }));

  return (
    <div>
      <h1 className="page-title">01 Trade Overview</h1>
      <p className="page-finding">{findingText}</p>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <KpiCard
          label="Export Value"
          value={core.exportValueBn.toFixed(2)}
          unit="USD bn"
          subtext="Total agricultural outbound shipments"
          sparklineData={sparklineExport}
          color="var(--color-export)"
        />
        <KpiCard
          label="Import Value"
          value={core.importValueBn.toFixed(2)}
          unit="USD bn"
          subtext="Total agricultural inbound receipts"
          sparklineData={sparklineImport}
          color="var(--color-import)"
        />
        <KpiCard
          label="Trade Balance"
          value={`${isSurplus ? '+' : ''}${core.tradeBalanceBn.toFixed(2)}`}
          unit="USD bn"
          subtext={isSurplus ? 'Net export surplus' : 'Net import deficit'}
          sparklineData={sparklineBalance}
          color={balanceColor}
        />
        <KpiCard
          label="Export-Import Ratio"
          value={core.ratio ? core.ratio.toFixed(2) : '—'}
          unit="ratio"
          subtext={core.ratio && core.ratio >= 1 ? 'Net exporter (> 1.00)' : 'Net importer (< 1.00)'}
          sparklineData={sparklineRatio}
          color="var(--ink)"
        />
      </div>

      {/* Primary Chart: Export by Year */}
      <div style={{ marginTop: '24px' }}>
        <LineChart
          title="Export Value Trajectory by Year (2000–2024)"
          data={lineData}
          series1Name="Export Value"
          series1Color="var(--color-export)"
          unit="USD bn"
          height={380}
        />
      </div>
    </div>
  );
};
