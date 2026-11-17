import React from 'react';
import { ItemAggregate } from '../types/data';
import { BarChart, DataTable, ColumnDef } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page03Props {
  itemAggs: ItemAggregate[];
}

export const Page03ProductAnalysis: React.FC<Page03Props> = ({ itemAggs }) => {
  const [filters, store] = useFilters();

  const sortedItems = [...itemAggs].sort((a, b) => b.exportValueBn - a.exportValueBn);
  const topProduct = sortedItems[0];

  const findingText = topProduct
    ? `${topProduct.item} ranks as the primary commodity with USD ${topProduct.exportValueBn.toFixed(2)} bn in exports (${topProduct.productSharePct.toFixed(1)}% product share).`
    : 'No commodity trade records found for current criteria.';

  const barData = sortedItems.slice(0, 15).map((it) => ({
    id: it.item,
    label: it.item,
    value: it.exportValueBn,
    color: 'var(--color-export)',
    sublabel: `Share: ${it.productSharePct.toFixed(1)}% | YoY: ${it.exportYoY !== null ? (it.exportYoY >= 0 ? '+' : '') + it.exportYoY.toFixed(1) + '%' : 'N/A'}`,
  }));

  const maxShare = Math.max(...sortedItems.map((d) => d.productSharePct), 1);

  const columns: ColumnDef<ItemAggregate>[] = [
    {
      key: 'item',
      header: 'Commodity Item',
      render: (r) => r.item,
      sortValue: (r) => r.item,
    },
    {
      key: 'exportValue',
      header: 'Export (USD bn)',
      align: 'right',
      render: (r) => r.exportValueBn.toFixed(2),
      sortValue: (r) => r.exportValueBn,
    },
    {
      key: 'exportYoY',
      header: 'Export YoY %',
      align: 'right',
      render: (r) => {
        if (r.exportYoY === null) return <span style={{ color: 'var(--muted-ink)' }}>—</span>;
        const isPos = r.exportYoY >= 0;
        return (
          <span style={{ color: isPos ? 'var(--color-export)' : 'var(--color-import)', fontWeight: 500 }}>
            {isPos ? '+' : ''}{r.exportYoY.toFixed(1)}%
          </span>
        );
      },
      sortValue: (r) => r.exportYoY ?? -9999,
    },
    {
      key: 'productShare',
      header: 'Product Share %',
      align: 'right',
      render: (r) => `${r.productSharePct.toFixed(1)}%`,
      sortValue: (r) => r.productSharePct,
      inlineBarPct: (r) => (r.productSharePct / maxShare) * 100,
      barColor: 'rgba(47, 93, 69, 0.18)',
    },
  ];

  return (
    <div>
      <h1 className="page-title">03 Product Analysis</h1>
      <p className="page-finding">{findingText}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <BarChart
            title="Top 15 Commodities by Export Value"
            data={barData}
            unit="USD bn"
            selectedId={filters.crossFilterItem}
            onSelect={(id) => store.setCrossFilterItem(id)}
            height={500}
            maxBars={15}
          />
        </div>

        <div>
          <DataTable
            title="Commodity Ledger & Share"
            data={sortedItems}
            columns={columns}
            rowKey={(r) => r.item}
            selectedId={filters.crossFilterItem}
            onSelectRow={(id) => store.setCrossFilterItem(id)}
            maxRows={36}
          />
        </div>
      </div>
    </div>
  );
};
