export interface TradeDataset {
  metadata: {
    title: string;
    source: string;
    rowCount: number;
    areas: string[];
    items: string[];
    elements: string[];
    qualities: string[];
    years: number[];
  };
  columns: {
    year: number[];
    area: number[];
    item: number[];
    element: number[];
    value: number[];
    quality: number[];
  };
}

export interface FilterState {
  yearRange: [number, number];
  selectedAreas: string[];
  selectedItems: string[];
  crossFilterArea: string | null;
  crossFilterItem: string | null;
}

export interface MeasureDefinition {
  id: string;
  name: string;
  dax: string;
  description: string;
  unit: string;
  category: 'Value' | 'Quantity' | 'Ratio' | 'Quality' | 'System';
}

export interface CoreAggregates {
  exportValueBn: number;
  importValueBn: number;
  tradeBalanceBn: number;
  totalTradeBn: number;
  ratio: number | null;
  exportQuantityMt: number;
  importQuantityMt: number;
  officialDataSharePct: number;
  rowCount: number;
}

export interface YearAggregate {
  year: number;
  exportValueBn: number;
  importValueBn: number;
  tradeBalanceBn: number;
  totalTradeBn: number;
  ratio: number | null;
  exportQuantityMt: number;
  importQuantityMt: number;
  exportYoY: number | null;
  importYoY: number | null;
  officialDataSharePct: number;
  rowCount: number;
}

export interface AreaAggregate {
  area: string;
  exportValueBn: number;
  importValueBn: number;
  tradeBalanceBn: number;
  totalTradeBn: number;
  ratio: number | null;
  exportQuantityMt: number;
  importQuantityMt: number;
  countrySharePct: number;
  officialDataSharePct: number;
  rowCount: number;
}

export interface ItemAggregate {
  item: string;
  exportValueBn: number;
  importValueBn: number;
  tradeBalanceBn: number;
  totalTradeBn: number;
  ratio: number | null;
  exportQuantityMt: number;
  importQuantityMt: number;
  productSharePct: number;
  exportYoY: number | null;
  rowCount: number;
}

export interface QualityAggregate {
  quality: string;
  rowCount: number;
  valueBn: number;
  sharePct: number;
}
export interface AreaYearCell {
  area: string;
  year: number;
  exportValueBn: number;
  importValueBn: number;
  tradeBalanceBn: number;
}
