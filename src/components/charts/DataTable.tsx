import React, { useState } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
  inlineBarPct?: (row: T) => number; // 0 to 100 for inline bar
  barColor?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  title?: string;
  selectedId?: string | null;
  onSelectRow?: (id: string) => void;
  maxRows?: number;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  title,
  selectedId = null,
  onSelectRow,
  maxRows = 25,
}: DataTableProps<T>): React.ReactElement {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  let sortedData = [...data];
  if (sortKey) {
    const col = columns.find((c) => c.key === sortKey);
    if (col && col.sortValue) {
      sortedData.sort((a, b) => {
        const valA = col.sortValue!(a);
        const valB = col.sortValue!(b);
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
  }

  const displayData = sortedData.slice(0, maxRows);

  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(col.key);
      setSortAsc(false);
    }
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {title && (
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>
            Showing top {displayData.length} of {data.length} records
          </span>
        </div>
      )}

      <div style={{ overflowX: 'auto', width: '100%', maxHeight: '420px' }}>
        <table className="ledger-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={col.align === 'right' ? 'num' : ''}
                    style={{
                      cursor: col.sortValue ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => handleHeaderClick(col)}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {col.header}
                      {isSorted && (
                        <span style={{ fontSize: '10px', color: 'var(--color-export)' }}>
                          {sortAsc ? '▲' : '▼'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row) => {
              const id = rowKey(row);
              const isSelected = selectedId === id;
              const hasSelection = selectedId !== null;
              const opacity = hasSelection ? (isSelected ? 1 : 0.4) : 1;

              return (
                <tr
                  key={id}
                  style={{
                    cursor: onSelectRow ? 'pointer' : 'default',
                    backgroundColor: isSelected ? 'rgba(47, 93, 69, 0.08)' : 'transparent',
                    fontWeight: isSelected ? 600 : 400,
                    opacity,
                  }}
                  onClick={() => onSelectRow && onSelectRow(id)}
                >
                  {columns.map((col) => {
                    const inlinePct = col.inlineBarPct ? col.inlineBarPct(row) : null;
                    return (
                      <td
                        key={col.key}
                        className={col.align === 'right' ? 'num' : ''}
                        style={{
                          textAlign: col.align || 'left',
                          position: 'relative',
                        }}
                      >
                        {inlinePct !== null && inlinePct !== undefined && inlinePct > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '2px',
                              bottom: '2px',
                              right: '4px',
                              width: `${Math.min(inlinePct, 100)}%`,
                              backgroundColor: col.barColor || 'rgba(47, 93, 69, 0.15)',
                              pointerEvents: 'none',
                              borderRadius: '1px',
                            }}
                          />
                        )}
                        <span style={{ position: 'relative', zIndex: 1 }}>{col.render(row)}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
