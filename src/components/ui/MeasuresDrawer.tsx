import React, { useState } from 'react';
import { MEASURES } from '../../lib/measures';

interface MeasuresDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeasuresDrawer: React.FC<MeasuresDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'measures' | 'notes'>('measures');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Value', 'Quantity', 'Ratio', 'Quality', 'System'];

  const filteredMeasures =
    selectedCategory === 'All'
      ? MEASURES
      : MEASURES.filter((m) => m.category === selectedCategory);

  const handleCopyDax = (id: string, dax: string) => {
    navigator.clipboard.writeText(dax);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(28, 31, 27, 0.4)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '580px',
          maxWidth: '90vw',
          height: '100%',
          backgroundColor: 'var(--surface)',
          borderLeft: '1px solid var(--hairline-dark)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600 }}>
              Technical Reference
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--muted-ink)', marginTop: '2px' }}>
              Power BI DAX Measure Definitions & Data Documentation
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: '18px',
              padding: '4px 8px',
              color: 'var(--muted-ink)',
              borderRadius: '2px',
            }}
            title="Press Escape to close"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--hairline)',
            backgroundColor: 'var(--bg-paper)',
            padding: '0 24px',
          }}
        >
          <button
            onClick={() => setActiveTab('measures')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'measures' ? 600 : 400,
              color: activeTab === 'measures' ? 'var(--color-export)' : 'var(--muted-ink)',
              borderBottom: activeTab === 'measures' ? '2px solid var(--color-export)' : '2px solid transparent',
            }}
          >
            DAX Measures ({MEASURES.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'notes' ? 600 : 400,
              color: activeTab === 'notes' ? 'var(--color-export)' : 'var(--muted-ink)',
              borderBottom: activeTab === 'notes' ? '2px solid var(--color-export)' : '2px solid transparent',
            }}
          >
            Data Notes & Scope
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {activeTab === 'measures' ? (
            <div>
              {/* Category Filter Chips */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      fontSize: '11.5px',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-subtle)',
                      border: '1px solid var(--hairline)',
                      backgroundColor: selectedCategory === cat ? 'var(--color-export)' : 'var(--bg-paper)',
                      color: selectedCategory === cat ? '#FBFAF5' : 'var(--ink)',
                      fontWeight: selectedCategory === cat ? 600 : 400,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Measure Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredMeasures.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      border: '1px solid var(--hairline)',
                      borderRadius: 'var(--radius-subtle)',
                      backgroundColor: 'var(--bg-paper)',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                        {m.name}
                      </span>
                      <span
                        className="mono"
                        style={{
                          fontSize: '11px',
                          color: 'var(--muted-ink)',
                          backgroundColor: 'rgba(0,0,0,0.04)',
                          padding: '1px 6px',
                          borderRadius: '2px',
                        }}
                      >
                        {m.unit}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--muted-ink)', margin: '6px 0 10px 0' }}>
                      {m.description}
                    </p>

                    <div style={{ position: 'relative' }}>
                      <pre
                        className="mono"
                        style={{
                          backgroundColor: '#1C1F1B',
                          color: '#FBFAF5',
                          padding: '10px 12px',
                          borderRadius: '2px',
                          fontSize: '11px',
                          lineHeight: '1.45',
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <code>{m.dax}</code>
                      </pre>
                      <button
                        onClick={() => handleCopyDax(m.id, m.dax)}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          fontSize: '10px',
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          color: '#FBFAF5',
                          padding: '2px 6px',
                          borderRadius: '2px',
                        }}
                      >
                        {copiedId === m.id ? 'Copied ✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--ink)' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '6px' }}>
                  Source Repository & Schema
                </h3>
                <p>
                  Data extracted from the <strong>Food and Agriculture Organization of the United Nations (FAOSTAT)</strong>,
                  domain <em>Trade: Crops and livestock products (TCL)</em>.
                </p>
                <p style={{ marginTop: '6px' }}>
                  The dataset contains <strong>31,571 records</strong> covering <strong>12 reporting countries</strong> and <strong>36 agricultural commodities</strong>.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '6px' }}>
                  Measurement Units & Elements
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>
                    <strong>Trade Value:</strong> Extracted in <em>1,000 USD</em>. Measures divide by <code>1,000,000</code> to express values in <strong>USD billion (USD bn)</strong>.
                  </li>
                  <li>
                    <strong>Trade Quantity:</strong> Extracted in <em>tonnes (t)</em>. Measures divide by <code>1,000,000</code> to express volume in <strong>Million tonnes (Mt)</strong>.
                  </li>
                  <li>
                    <strong>Rule:</strong> Elements are strictly separated; Value and Quantity rows are never summed across Elements.
                  </li>
                </ul>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '6px' }}>
                  Year 2004 Gap & YoY Computation
                </h3>
                <p>
                  Year <strong>2004 is absent</strong> from the FAO source dataset extract. To ensure accurate economic analysis, the <code>YoY %</code> measure dynamically looks up the <em>maximum available prior year</em> (<code>ALLSELECTED(Year) &lt; CurrentYear</code>). Consequently, year <strong>2005 is evaluated against 2003</strong>.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '6px' }}>
                  Data Quality & Certification Flags
                </h3>
                <table className="ledger-table" style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>Flag</th>
                      <th>Quality Mapping</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="mono" style={{ fontWeight: 600 }}>A</td>
                      <td>Official</td>
                      <td>Official value reported by national authorities</td>
                    </tr>
                    <tr>
                      <td className="mono" style={{ fontWeight: 600 }}>X</td>
                      <td>External estimate</td>
                      <td>Value derived from trading partners database</td>
                    </tr>
                    <tr>
                      <td className="mono" style={{ fontWeight: 600 }}>E</td>
                      <td>Estimated</td>
                      <td>Estimated value calculated by FAO statistical models</td>
                    </tr>
                    <tr>
                      <td className="mono" style={{ fontWeight: 600 }}>I</td>
                      <td>Imputed</td>
                      <td>Value imputed by receiving agency methodology</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '6px' }}>
                  Academic Project Credits
                </h3>
                <p>
                  <strong>Course:</strong> Data Visualization Lab (BISL504), The National Institute of Engineering (NIE), Mysuru.<br />
                  <strong>Students:</strong> Jagan Raju B (4NI25IS416), Kiran S V (4NI25IS421)<br />
                  <strong>Faculty Guides:</strong> Ms. Prajakta Madankar, Sri. Rampur Srinath
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
