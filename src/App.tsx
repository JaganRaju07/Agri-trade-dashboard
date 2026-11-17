import React, { useState, useEffect, useMemo } from 'react';
import './styles/global.css';
import { TradeDataset } from './types/data';
import { AppShell } from './components/layout/AppShell';
import { useFilters } from './lib/filterStore';
import {
  filterIndices,
  computeCoreAggregates,
  computeYearAggregates,
  computeAreaAggregates,
  computeItemAggregates,
  computeQualityAggregates
} from './lib/aggregation';
import { Page01TradeOverview } from './pages/Page01TradeOverview';
import { Page02AreaAnalysis } from './pages/Page02AreaAnalysis';
import { Page03ProductAnalysis } from './pages/Page03ProductAnalysis';
import { Page04TradeBalance } from './pages/Page04TradeBalance';
import { Page05DataQuality } from './pages/Page05DataQuality';
import { Page06QuantityAnalysis } from './pages/Page06QuantityAnalysis';

export default function App(): React.ReactElement {
  const [dataset, setDataset] = useState<TradeDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useFilters();

  useEffect(() => {
    fetch('/data/trade.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data: TradeDataset) => {
        setDataset(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Aggregated data memoised on filter changes
  const activeIndices = useMemo(() => {
    if (!dataset) return [];
    return filterIndices(dataset, filters);
  }, [dataset, filters]);

  const core = useMemo(() => {
    if (!dataset) return null;
    return computeCoreAggregates(dataset, activeIndices);
  }, [dataset, activeIndices]);

  const yearAggs = useMemo(() => {
    if (!dataset) return [];
    return computeYearAggregates(dataset, filters);
  }, [dataset, filters]);

  const areaAggs = useMemo(() => {
    if (!dataset || !core) return [];
    return computeAreaAggregates(dataset, activeIndices, core.exportValueBn);
  }, [dataset, activeIndices, core]);

  const itemAggs = useMemo(() => {
    if (!dataset || !core) return [];
    return computeItemAggregates(dataset, activeIndices, core.exportValueBn, filters);
  }, [dataset, activeIndices, core, filters]);

  const qualityAggs = useMemo(() => {
    if (!dataset) return [];
    return computeQualityAggregates(dataset, activeIndices);
  }, [dataset, activeIndices]);

  const renderPage = (activePageId: string) => {
    if (!dataset || !core) return null;

    if (activeIndices.length === 0) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted-ink)' }}>
          <p style={{ fontSize: '16px', fontFamily: 'var(--font-serif)' }}>
            No records matched the selected filter combination.
          </p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Adjust the year range, country, or commodity selection to view data.
          </p>
        </div>
      );
    }

    switch (activePageId) {
      case '01':
        return <Page01TradeOverview dataset={dataset} core={core} yearAggs={yearAggs} />;
      case '02':
        return <Page02AreaAnalysis areaAggs={areaAggs} />;
      case '03':
        return <Page03ProductAnalysis itemAggs={itemAggs} />;
      case '04':
        return <Page04TradeBalance yearAggs={yearAggs} areaAggs={areaAggs} />;
      case '05':
        return <Page05DataQuality core={core} yearAggs={yearAggs} qualityAggs={qualityAggs} />;
      case '06':
        return <Page06QuantityAnalysis core={core} yearAggs={yearAggs} itemAggs={itemAggs} />;
      default:
        return (
          <div>
            <h1 className="page-title">Page {activePageId}</h1>
            <p className="page-finding">Overview of agricultural trade data.</p>
          </div>
        );
    }
  };

  return (
    <AppShell
      dataset={dataset}
      loading={loading}
      error={error}
      onOpenMeasures={() => console.log('Open measures')}
    >
      {(activePageId) => renderPage(activePageId)}
    </AppShell>
  );
}
