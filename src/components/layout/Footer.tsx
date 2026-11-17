import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--hairline)',
        backgroundColor: 'var(--surface)',
        padding: '16px 24px',
        fontSize: '12px',
        color: 'var(--muted-ink)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
      }}
    >
      <div>
        <strong>Source:</strong> FAOSTAT Trade Crops & Livestock Products (TCL, 2000–2024). Note: Year 2004 absent from source extract.
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <span>
          <strong>Team:</strong> Jagan Raju B (4NI25IS416), Kiran S V (4NI25IS421)
        </span>
        <span>•</span>
        <span>
          <strong>Course:</strong> Data Visualization Lab (BISL504), NIE Mysuru
        </span>
      </div>
    </footer>
  );
};
