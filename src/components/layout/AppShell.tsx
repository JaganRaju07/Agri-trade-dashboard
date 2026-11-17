import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { LeftRail, PAGES } from './LeftRail';
import { FilterStrip } from './FilterStrip';
import { Footer } from './Footer';
import { TradeDataset } from '../../types/data';
import { useFilters } from '../../lib/filterStore';

interface AppShellProps {
  dataset: TradeDataset | null;
  loading: boolean;
  error: string | null;
  onOpenMeasures: () => void;
  children: (activePageId: string) => React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  dataset,
  loading,
  error,
  onOpenMeasures,
  children
}) => {
  const [activePageId, setActivePageId] = useState<string>('01');
  const [, store] = useFilters();

  // Hash routing listener (#/01 - #/12)
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace('#/', '');
      const matched = PAGES.find((p) => p.id === hash);
      if (matched) {
        setActivePageId(matched.id);
      } else if (!window.location.hash || window.location.hash === '#/') {
        window.location.hash = '#/01';
      }
    }

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectPage = (id: string) => {
    window.location.hash = `#/${id}`;
    setActivePageId(id);
  };

  // Global Keyboard shortcuts: [ / ] switch pages, 1-9 jump, R resets filters, M opens Measures
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const currentIndex = PAGES.findIndex((p) => p.id === activePageId);

      if (e.key === ']') {
        const nextIndex = (currentIndex + 1) % PAGES.length;
        handleSelectPage(PAGES[nextIndex].id);
      } else if (e.key === '[') {
        const prevIndex = (currentIndex - 1 + PAGES.length) % PAGES.length;
        handleSelectPage(PAGES[prevIndex].id);
      } else if (e.key >= '1' && e.key <= '9') {
        const targetPage = PAGES[parseInt(e.key, 10) - 1];
        if (targetPage) handleSelectPage(targetPage.id);
      } else if (e.key.toLowerCase() === 'r') {
        store.resetFilters();
      } else if (e.key.toLowerCase() === 'm') {
        onOpenMeasures();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageId, onOpenMeasures, store]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-paper)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-serif)',
          fontSize: '20px',
        }}
      >
        Loading agricultural trade ledger...
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--color-import)',
          backgroundColor: 'var(--bg-paper)',
        }}
      >
        <h2>Failed to load dataset</h2>
        <p style={{ marginTop: '12px' }}>{error || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onOpenMeasures={onOpenMeasures} />
      <FilterStrip dataset={dataset} />

      <div style={{ display: 'flex', flex: 1 }}>
        <LeftRail activePageId={activePageId} onSelectPage={handleSelectPage} />
        <main
          style={{
            flex: 1,
            padding: '28px 36px 40px 36px',
            backgroundColor: 'var(--bg-paper)',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
          }}
        >
          {children(activePageId)}
        </main>
      </div>

      <Footer />
    </div>
  );
};
