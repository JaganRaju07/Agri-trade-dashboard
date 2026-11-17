import React from 'react';
import { AreaAggregate } from '../types/data';
import { ScatterChart, KpiCard, DataTable, ColumnDef } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page09Props {
  areaAggs: AreaAggregate[];
}

export const Page09AreaTradePosition: React.FC<Page09Props> = ({ areaAggs }) => {
  const [filters, store] = useFilters();

  const netExporters = areaAggs.filter((a) => a.tradeBalanceBn >= 0);
  const netImporters = areaAggs.filter((a) => a.tradeBalanceBn < 0);

  const totalExp = areaAggs.reduce((acc, a) => acc + a.exportValueBn, 0);
  const totalImp = areaAggs.reduce((acc, a) => acc + a.importValueBn, 0);

  const findingText = `${netExporters.length} nations occupy net export surplus positions (below parity line), led by the USA and Brazil, while ${netImporters.length} nations operate in net trade deficit, led by China.`;

  const scatterData = areaAggs.map((a) => ({
    id: a.area,
    label: a.area,
    x: a.exportValueBn,
    y: a.importValueBn,
    size: a.totalTradeBn,
  }));

  const columns: ColumnDef<AreaAggregate>[] = [
    {
      key: 'area',
      header: 'Nation',
      render: (r) => r.area,
      sortValue: (r) => r.area,
    },
    {
      key: 'position',
      header: 'Position Quadrant',
      render: (r) => {
        const isSurplus = r.tradeBalanceBn >= 0;
        return (
          <span style={{ color: isSurplus ? 'var(--color-surplus)' : 'var(--color-deficit)', fontWeight: 500 }}>
            {isSurplus ? 'Net Exporter (Surplus)' : 'Net Importer (Deficit)'}
          </span>
        );
      },
      sortValue: (r) => (r.tradeBalanceBn >= 0 ? 1 : 0),
    },
    {
      key: 'export',
      header: 'Export (USD bn)',
      align: 'right',
      render: (r) => r.exportValueBn.toFixed(2),
      sortValue: (r) => r.exportValueBn,
    },
    {
      key: 'import',
      header: 'Import (USD bn)',
      align: 'right',
      render: (r) => r.importValueBn.toFixed(2),
      sortValue: (r) => r.importValueBn,
    },
    {
      key: 'balance',
      header: 'Balance (USD bn)',
      align: 'right',
      render: (r) => `${r.tradeBalanceBn >= 0 ? '+' : ''}${r.tradeBalanceBn.toFixed(2)}`,
      sortValue: (r) => r.tradeBalanceBn,
    },
  ];

  return (
    <div>
      <h1 className="page-title">09 Area Trade Position</h1>
      <p className="page-finding">{findingText}</p>

      <div className="kpi-grid">
        <KpiCard
          label="Net Exporter Nations"
          value={netExporters.length}
          unit="countries"
          subtext="Positioned below parity line (Export > Import)"
          color="var(--color-surplus)"
        />
        <KpiCard
          label="Net Importer Nations"
          value={netImporters.length}
          unit="countries"
          subtext="Positioned above parity line (Import > Export)"
          color="var(--color-deficit)"
        />
        <KpiCard
          label="Total Export Value"
          value={totalExp.toFixed(2)}
          unit="USD bn"
          subtext="X-axis aggregate"
          color="var(--color-export)"
        />
        <KpiCard
          label="Total Import Value"
          value={totalImp.toFixed(2)}
          unit="USD bn"
          subtext="Y-axis aggregate"
          color="var(--color-import)"
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <ScatterChart
          title="National Trade Position Matrix (Export vs Import with Parity Line)"
          data={scatterData}
          unit="USD bn"
          selectedId={filters.crossFilterArea}
          onSelect={(id) => store.setCrossFilterArea(id)}
          height={480}
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <DataTable
          title="National Trade Balance Quadrants"
          data={[...areaAggs].sort((a, b) => b.tradeBalanceBn - a.tradeBalanceBn)}
          columns={columns}
          rowKey={(r) => r.area}
          selectedId={filters.crossFilterArea}
          onSelectRow={(id) => store.setCrossFilterArea(id)}
          maxRows={12}
        />
      </div>
    </div>
  );
};
