import React, { useState, useEffect } from 'react';
import './styles/global.css';
import { TradeDataset } from './types/data';
import { AppShell } from './components/layout/AppShell';

export default function App(): React.ReactElement {
  const [dataset, setDataset] = useState<TradeDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AppShell
      dataset={dataset}
      loading={loading}
      error={error}
      onOpenMeasures={() => console.log('Open measures')}
    >
      {(activePageId) => (
        <div>
          <h1 className="page-title">Page {activePageId}</h1>
          <p className="page-finding">Overview of agricultural trade data.</p>
        </div>
      )}
    </AppShell>
  );
}
