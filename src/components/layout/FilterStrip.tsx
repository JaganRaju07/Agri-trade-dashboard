import React, { useState, useRef, useEffect } from 'react';
import { useFilters } from '../../lib/filterStore';
import { TradeDataset } from '../../types/data';

interface FilterStripProps {
  dataset: TradeDataset;
}

export const FilterStrip: React.FC<FilterStripProps> = ({ dataset }) => {
  const [filters, store] = useFilters();
  const [areaOpen, setAreaOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  const areaRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) {
        setAreaOpen(false);
      }
      if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
        setItemOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allAreas = dataset.metadata.areas;
  const allItems = dataset.metadata.items;
  const minYear = 2000;
  const maxYear = 2024;

  const filteredItems = itemSearch.trim()
    ? allItems.filter((it) => it.toLowerCase().includes(itemSearch.toLowerCase()))
    : allItems;

  const isFiltered =
    filters.yearRange[0] !== minYear ||
    filters.yearRange[1] !== maxYear ||
    filters.selectedAreas.length > 0 ||
    filters.selectedItems.length > 0 ||
    filters.crossFilterArea !== null ||
    filters.crossFilterItem !== null;

  return (
    <div
      style={{
        position: 'sticky',
        top: 'var(--header-height)',
        zIndex: 40,
        backgroundColor: 'var(--bg-paper)',
        borderBottom: '1px solid var(--hairline)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 'var(--filter-strip-height)',
        gap: '16px',
        flexWrap: 'nowrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'nowrap' }}>
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--muted-ink)',
            fontWeight: 600,
          }}
        >
          Filters
        </span>

        {/* Year Range Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted-ink)' }}>Years:</span>
          <span className="mono" style={{ fontSize: '12px', fontWeight: 500, minWidth: '36px' }}>
            {filters.yearRange[0]}
          </span>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={filters.yearRange[0]}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val <= filters.yearRange[1]) {
                store.setYearRange([val, filters.yearRange[1]]);
              }
            }}
            style={{ width: '80px', accentColor: 'var(--color-export)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>–</span>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={filters.yearRange[1]}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val >= filters.yearRange[0]) {
                store.setYearRange([filters.yearRange[0], val]);
              }
            }}
            style={{ width: '80px', accentColor: 'var(--color-export)', cursor: 'pointer' }}
          />
          <span className="mono" style={{ fontSize: '12px', fontWeight: 500, minWidth: '36px' }}>
            {filters.yearRange[1]}
          </span>
        </div>

        {/* Area Multi-select Dropdown */}
        <div ref={areaRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setAreaOpen(!areaOpen)}
            style={{
              padding: '4px 10px',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-subtle)',
              backgroundColor: 'var(--surface)',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Area:</span>
            <span className="mono" style={{ fontWeight: 500 }}>
              {filters.selectedAreas.length === 0
                ? 'All (12)'
                : `${filters.selectedAreas.length} selected`}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--muted-ink)' }}>▼</span>
          </button>

          {areaOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '260px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--hairline-dark)',
                borderRadius: 'var(--radius-subtle)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                zIndex: 100,
                maxHeight: '320px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--hairline)',
                  fontSize: '11px',
                }}
              >
                <button
                  onClick={() => store.setSelectedAreas([])}
                  style={{ color: 'var(--color-export)', fontWeight: 500 }}
                >
                  Select All
                </button>
                <button
                  onClick={() => store.setSelectedAreas(allAreas.slice(0, 1))}
                  style={{ color: 'var(--muted-ink)' }}
                >
                  Clear to 1
                </button>
              </div>
              <div style={{ overflowY: 'auto', padding: '6px 0', flex: 1 }}>
                {allAreas.map((a) => {
                  const checked =
                    filters.selectedAreas.length === 0 ||
                    filters.selectedAreas.includes(a);
                  return (
                    <label
                      key={a}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: checked ? 'rgba(47, 93, 69, 0.04)' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => store.toggleArea(a)}
                        style={{ accentColor: 'var(--color-export)' }}
                      />
                      <span>{a}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Item Multi-select Dropdown (Searchable) */}
        <div ref={itemRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setItemOpen(!itemOpen)}
            style={{
              padding: '4px 10px',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-subtle)',
              backgroundColor: 'var(--surface)',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Product:</span>
            <span className="mono" style={{ fontWeight: 500 }}>
              {filters.selectedItems.length === 0
                ? 'All (36)'
                : `${filters.selectedItems.length} selected`}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--muted-ink)' }}>▼</span>
          </button>

          {itemOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '320px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--hairline-dark)',
                borderRadius: 'var(--radius-subtle)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                zIndex: 100,
                maxHeight: '360px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--hairline)' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid var(--hairline)',
                    borderRadius: '2px',
                    backgroundColor: 'var(--bg-paper)',
                  }}
                  autoFocus
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--hairline)',
                  fontSize: '11px',
                }}
              >
                <button
                  onClick={() => store.setSelectedItems([])}
                  style={{ color: 'var(--color-export)', fontWeight: 500 }}
                >
                  Select All
                </button>
                <button
                  onClick={() => store.setSelectedItems(allItems.slice(0, 1))}
                  style={{ color: 'var(--muted-ink)' }}
                >
                  Clear to 1
                </button>
              </div>
              <div style={{ overflowY: 'auto', padding: '6px 0', flex: 1 }}>
                {filteredItems.map((it) => {
                  const checked =
                    filters.selectedItems.length === 0 ||
                    filters.selectedItems.includes(it);
                  return (
                    <label
                      key={it}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: checked ? 'rgba(47, 93, 69, 0.04)' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => store.toggleItem(it)}
                        style={{ accentColor: 'var(--color-export)' }}
                      />
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {it}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Cross Filter Indicators */}
        {filters.crossFilterArea && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              backgroundColor: 'rgba(47, 93, 69, 0.1)',
              padding: '2px 8px',
              borderRadius: '2px',
              border: '1px solid var(--color-export)',
            }}
          >
            <span>Area: <strong>{filters.crossFilterArea}</strong></span>
            <button
              onClick={() => store.setCrossFilterArea(null)}
              style={{ fontSize: '13px', lineHeight: 1, color: 'var(--color-export)' }}
              title="Clear mark filter"
            >
              ✕
            </button>
          </div>
        )}

        {filters.crossFilterItem && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              backgroundColor: 'rgba(181, 83, 45, 0.1)',
              padding: '2px 8px',
              borderRadius: '2px',
              border: '1px solid var(--color-import)',
            }}
          >
            <span>Product: <strong>{filters.crossFilterItem}</strong></span>
            <button
              onClick={() => store.setCrossFilterItem(null)}
              style={{ fontSize: '13px', lineHeight: 1, color: 'var(--color-import)' }}
              title="Clear mark filter"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Reset button */}
      <div>
        {isFiltered && (
          <button
            onClick={() => store.resetFilters()}
            style={{
              fontSize: '12px',
              color: 'var(--muted-ink)',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '4px 6px',
            }}
            title="Press 'R' to reset filters"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
};
