import React from 'react';
import { CoreAggregates, YearAggregate, QualityAggregate } from '../types/data';
import { DonutChart, ColumnChart, KpiCard } from '../components/charts';

interface Page05Props {
  core: CoreAggregates;
  yearAggs: YearAggregate[];
  qualityAggs: QualityAggregate[];
}

export const Page05DataQuality: React.FC<Page05Props> = ({
  core,
  yearAggs,
  qualityAggs,
}) => {
  const findingText = `Official certified records account for ${core.officialDataSharePct.toFixed(2)}% of total agricultural trade valuation across ${core.rowCount.toLocaleString()} active ledger entries.`;

  const donutData = qualityAggs.map((q) => ({
    id: q.quality,
    label: q.quality,
    value: q.rowCount,
    sublabel: `Trade value: USD ${q.valueBn.toFixed(2)} bn (${q.sharePct.toFixed(1)}% of rows)`,
  }));

  const colData = yearAggs.map((y) => ({
    id: y.year,
    label: String(y.year),
    value: y.officialDataSharePct,
    color: 'var(--color-export)',
  }));

  const officialQuality = qualityAggs.find((q) => q.quality === 'Official');
  const nonOfficialCount = core.rowCount - (officialQuality?.rowCount ?? 0);

  return (
    <div>
      <h1 className="page-title">05 Data Quality</h1>
      <p className="page-finding">{findingText}</p>

      {/* Cards: Full numbers, no "32K" */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Row Count"
          value={core.rowCount.toLocaleString()}
          unit="records"
          subtext="Full record count after active slicers"
          color="var(--ink)"
        />
        <KpiCard
          label="Official Data Share"
          value={`${core.officialDataSharePct.toFixed(2)}%`}
          unit="value-weighted"
          subtext="Certified official trade reporting (Flag A)"
          color="var(--color-export)"
        />
        <KpiCard
          label="Official Certified Rows"
          value={(officialQuality?.rowCount ?? 0).toLocaleString()}
          unit="rows"
          subtext={`Share: ${officialQuality ? officialQuality.sharePct.toFixed(1) : 0}% of all rows`}
          color="var(--color-export)"
        />
        <KpiCard
          label="Estimated & Imputed Rows"
          value={nonOfficialCount.toLocaleString()}
          unit="rows"
          subtext="Flags X, E, and I combined"
          color="var(--color-import)"
        />
      </div>

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <DonutChart
            title="Record Breakdown by FAO Quality Flag"
            data={donutData}
            centerLabel="Total Rows"
            centerValue={core.rowCount.toLocaleString()}
            height={320}
          />
        </div>

        <div>
          <ColumnChart
            title="Official Data Share % by Year (Trade Value)"
            data={colData}
            unit="%"
            isPercent
            height={320}
          />
        </div>
      </div>
    </div>
  );
};
