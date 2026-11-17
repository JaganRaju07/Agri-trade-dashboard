import React from 'react';
import { AreaAggregate, ItemAggregate } from '../types/data';
import { FunnelChart, WaterfallChart, DataTable, ColumnDef } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page12Props {
  areaAggs: AreaAggregate[];
  itemAggs: ItemAggregate[];
}

export const Page12ProductDeepDive: React.FC<Page12Props> = ({ areaAggs, itemAggs }) => {
  const [filters, store] = useFilters();

  const sortedItems = [...itemAggs].sort((a, b) => b.exportValueBn - a.exportValueBn);
  const top10Items = sortedItems.slice(0, 10);

  const funnelData = top10Items.map((it) => ({
    id: it.item,
    label: it.item,
    value: it.exportValueBn,
  }));

  // Waterfall data: Trade Balance by Area (sorted from largest surplus to largest deficit)
  const sortedAreas = [...areaAggs].sort((a, b) => b.tradeBalanceBn - a.tradeBalanceBn);
  const waterfallData = sortedAreas.map((a) => ({
    id: a.area,
    label: a.area,
    value: a.tradeBalanceBn,
  }));

  const findingText = `The top 10 agricultural commodities account for USD ${top10Items.reduce((acc, it) => acc + it.exportValueBn, 0).toFixed(2)} bn in exports, accompanied by the national trade balance waterfall showing structural surplus and deficit drivers.`;

  // Table columns: Item with Export, Import, Balance
  const columns: ColumnDef<ItemAggregate>[] = [
    {
      key: 'item',
      header: 'Commodity Item',
      render: (r) => r.item,
      sortValue: (r) => r.item,
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
      render: (r) => {
        const isPos = r.tradeBalanceBn >= 0;
        return (
          <span style={{ color: isPos ? 'var(--color-surplus)' : 'var(--color-deficit)', fontWeight: 600 }}>
            {isPos ? '+' : ''}{r.tradeBalanceBn.toFixed(2)}
          </span>
        );
      },
      sortValue: (r) => r.tradeBalanceBn,
    },
  ];

  return (
    <div>
      <h1 className="page-title">12 Product Deep Dive</h1>
      <p className="page-finding">{findingText}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <FunnelChart
            title="Top 10 Export Commodities Funnel"
            data={funnelData}
            unit="USD bn"
            selectedId={filters.crossFilterItem}
            onSelect={(id) => store.setCrossFilterItem(id)}
            height={440}
          />
        </div>

        <div>
          <WaterfallChart
            title="Trade Balance Waterfall by Reporting Nation"
            data={waterfallData}
            unit="USD bn"
            selectedId={filters.crossFilterArea}
            onSelect={(id) => store.setCrossFilterArea(id)}
            height={440}
          />
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <DataTable
          title="Commodity Trade Balance Register"
          data={sortedItems}
          columns={columns}
          rowKey={(r) => r.item}
          selectedId={filters.crossFilterItem}
          onSelectRow={(id) => store.setCrossFilterItem(id)}
          maxRows={36}
        />
      </div>
    </div>
  );
};
