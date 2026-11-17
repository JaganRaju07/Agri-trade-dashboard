import {
  TradeDataset,
  FilterState,
  CoreAggregates,
  YearAggregate,
  AreaAggregate,
  ItemAggregate,
  QualityAggregate,
  AreaYearCell
} from '../types/data';

export type { AreaYearCell };

// Fast index lookup cache
interface DatasetIndexMap {
  areaMap: Map<string, number>;
  itemMap: Map<string, number>;
  elementExportQty: number;
  elementExportVal: number;
  elementImportQty: number;
  elementImportVal: number;
  qualityOfficial: number;
}

let cachedMap: { dataset: TradeDataset; maps: DatasetIndexMap } | null = null;

export function getIndexMaps(dataset: TradeDataset): DatasetIndexMap {
  if (cachedMap && cachedMap.dataset === dataset) {
    return cachedMap.maps;
  }

  const areaMap = new Map<string, number>();
  dataset.metadata.areas.forEach((a, i) => areaMap.set(a, i));

  const itemMap = new Map<string, number>();
  dataset.metadata.items.forEach((it, i) => itemMap.set(it, i));

  const maps: DatasetIndexMap = {
    areaMap,
    itemMap,
    elementExportQty: dataset.metadata.elements.indexOf('Export quantity'),
    elementExportVal: dataset.metadata.elements.indexOf('Export value'),
    elementImportQty: dataset.metadata.elements.indexOf('Import quantity'),
    elementImportVal: dataset.metadata.elements.indexOf('Import value'),
    qualityOfficial: dataset.metadata.qualities.indexOf('Official'),
  };

  cachedMap = { dataset, maps };
  return maps;
}

/**
 * Filter row indices based on slicers and cross-filters.
 */
export function filterIndices(dataset: TradeDataset, filters: FilterState): number[] {
  const maps = getIndexMaps(dataset);
  const { year, area, item } = dataset.columns;
  const [minYear, maxYear] = filters.yearRange;
  const total = dataset.metadata.rowCount;

  // Resolve target area indices
  let targetAreaIndices: Set<number> | null = null;
  if (filters.crossFilterArea) {
    const idx = maps.areaMap.get(filters.crossFilterArea);
    if (idx !== undefined) targetAreaIndices = new Set([idx]);
  } else if (filters.selectedAreas.length > 0) {
    targetAreaIndices = new Set();
    for (const a of filters.selectedAreas) {
      const idx = maps.areaMap.get(a);
      if (idx !== undefined) targetAreaIndices.add(idx);
    }
  }

  // Resolve target item indices
  let targetItemIndices: Set<number> | null = null;
  if (filters.crossFilterItem) {
    const idx = maps.itemMap.get(filters.crossFilterItem);
    if (idx !== undefined) targetItemIndices = new Set([idx]);
  } else if (filters.selectedItems.length > 0) {
    targetItemIndices = new Set();
    for (const it of filters.selectedItems) {
      const idx = maps.itemMap.get(it);
      if (idx !== undefined) targetItemIndices.add(idx);
    }
  }

  const matches: number[] = [];
  for (let i = 0; i < total; i++) {
    const y = year[i];
    if (y < minYear || y > maxYear) continue;

    if (targetAreaIndices && !targetAreaIndices.has(area[i])) continue;
    if (targetItemIndices && !targetItemIndices.has(item[i])) continue;

    matches.push(i);
  }

  return matches;
}

/**
 * Compute core KPI metrics over filtered indices.
 */
export function computeCoreAggregates(dataset: TradeDataset, indices: number[]): CoreAggregates {
  const maps = getIndexMaps(dataset);
  const { element, value, quality } = dataset.columns;

  let exportValSum = 0;
  let importValSum = 0;
  let exportQtySum = 0;
  let importQtySum = 0;
  let totalValSum = 0;
  let officialValSum = 0;

  const count = indices.length;
  for (let i = 0; i < count; i++) {
    const idx = indices[i];
    const elem = element[idx];
    const val = value[idx];

    if (elem === maps.elementExportVal) {
      exportValSum += val;
      totalValSum += val;
      if (quality[idx] === maps.qualityOfficial) {
        officialValSum += val;
      }
    } else if (elem === maps.elementImportVal) {
      importValSum += val;
      totalValSum += val;
      if (quality[idx] === maps.qualityOfficial) {
        officialValSum += val;
      }
    } else if (elem === maps.elementExportQty) {
      exportQtySum += val;
    } else if (elem === maps.elementImportQty) {
      importQtySum += val;
    }
  }

  const exportValueBn = exportValSum / 1_000_000;
  const importValueBn = importValSum / 1_000_000;
  const tradeBalanceBn = exportValueBn - importValueBn;
  const totalTradeBn = exportValueBn + importValueBn;
  const ratio = importValueBn > 0 ? exportValueBn / importValueBn : null;
  const exportQuantityMt = exportQtySum / 1_000_000;
  const importQuantityMt = importQtySum / 1_000_000;
  const officialDataSharePct = totalValSum > 0 ? (officialValSum / totalValSum) * 100 : 0;

  return {
    exportValueBn,
    importValueBn,
    tradeBalanceBn,
    totalTradeBn,
    ratio,
    exportQuantityMt,
    importQuantityMt,
    officialDataSharePct,
    rowCount: count
  };
}

/**
 * Compute aggregates grouped by Year, with YoY calculation vs previous available year.
 */
export function computeYearAggregates(
  dataset: TradeDataset,
  filters: FilterState
): YearAggregate[] {
  const maps = getIndexMaps(dataset);
  const { year, area, item, element, value, quality } = dataset.columns;
  const [minYear, maxYear] = filters.yearRange;
  const total = dataset.metadata.rowCount;

  // Resolve target area & item filters (ignore year range for full series YoY baseline)
  let targetAreaIndices: Set<number> | null = null;
  if (filters.crossFilterArea) {
    const idx = maps.areaMap.get(filters.crossFilterArea);
    if (idx !== undefined) targetAreaIndices = new Set([idx]);
  } else if (filters.selectedAreas.length > 0) {
    targetAreaIndices = new Set();
    for (const a of filters.selectedAreas) {
      const idx = maps.areaMap.get(a);
      if (idx !== undefined) targetAreaIndices.add(idx);
    }
  }

  let targetItemIndices: Set<number> | null = null;
  if (filters.crossFilterItem) {
    const idx = maps.itemMap.get(filters.crossFilterItem);
    if (idx !== undefined) targetItemIndices = new Set([idx]);
  } else if (filters.selectedItems.length > 0) {
    targetItemIndices = new Set();
    for (const it of filters.selectedItems) {
      const idx = maps.itemMap.get(it);
      if (idx !== undefined) targetItemIndices.add(idx);
    }
  }

  // Intermediate year buckets
  interface YearBucket {
    year: number;
    exportVal: number;
    importVal: number;
    exportQty: number;
    importQty: number;
    totalVal: number;
    officialVal: number;
    rowCount: number;
  }

  const allYearBuckets = new Map<number, YearBucket>();
  for (const y of dataset.metadata.years) {
    allYearBuckets.set(y, {
      year: y,
      exportVal: 0,
      importVal: 0,
      exportQty: 0,
      importQty: 0,
      totalVal: 0,
      officialVal: 0,
      rowCount: 0
    });
  }

  for (let i = 0; i < total; i++) {
    if (targetAreaIndices && !targetAreaIndices.has(area[i])) continue;
    if (targetItemIndices && !targetItemIndices.has(item[i])) continue;

    const y = year[i];
    const b = allYearBuckets.get(y);
    if (!b) continue;

    b.rowCount++;
    const elem = element[i];
    const val = value[i];

    if (elem === maps.elementExportVal) {
      b.exportVal += val;
      b.totalVal += val;
      if (quality[i] === maps.qualityOfficial) b.officialVal += val;
    } else if (elem === maps.elementImportVal) {
      b.importVal += val;
      b.totalVal += val;
      if (quality[i] === maps.qualityOfficial) b.officialVal += val;
    } else if (elem === maps.elementExportQty) {
      b.exportQty += val;
    } else if (elem === maps.elementImportQty) {
      b.importQty += val;
    }
  }

  const sortedYears = Array.from(allYearBuckets.keys()).sort((a, b) => a - b);
  const fullYearAggs: YearAggregate[] = [];

  for (let idx = 0; idx < sortedYears.length; idx++) {
    const y = sortedYears[idx];
    const b = allYearBuckets.get(y)!;

    const exportValueBn = b.exportVal / 1_000_000;
    const importValueBn = b.importVal / 1_000_000;
    const tradeBalanceBn = exportValueBn - importValueBn;
    const totalTradeBn = exportValueBn + importValueBn;
    const ratio = importValueBn > 0 ? exportValueBn / importValueBn : null;
    const exportQuantityMt = b.exportQty / 1_000_000;
    const importQuantityMt = b.importQty / 1_000_000;
    const officialDataSharePct = b.totalVal > 0 ? (b.officialVal / b.totalVal) * 100 : 0;

    let exportYoY: number | null = null;
    let importYoY: number | null = null;

    if (idx > 0) {
      const prevY = sortedYears[idx - 1];
      const prevB = allYearBuckets.get(prevY)!;
      const prevExp = prevB.exportVal / 1_000_000;
      const prevImp = prevB.importVal / 1_000_000;

      if (prevExp > 0) {
        exportYoY = ((exportValueBn - prevExp) / prevExp) * 100;
      }
      if (prevImp > 0) {
        importYoY = ((importValueBn - prevImp) / prevImp) * 100;
      }
    }

    fullYearAggs.push({
      year: y,
      exportValueBn,
      importValueBn,
      tradeBalanceBn,
      totalTradeBn,
      ratio,
      exportQuantityMt,
      importQuantityMt,
      exportYoY,
      importYoY,
      officialDataSharePct,
      rowCount: b.rowCount
    });
  }

  // Filter down to the selected year range
  return fullYearAggs.filter((item) => item.year >= minYear && item.year <= maxYear);
}

/**
 * Compute aggregates grouped by Area.
 */
export function computeAreaAggregates(
  dataset: TradeDataset,
  indices: number[],
  totalExportValueBn: number
): AreaAggregate[] {
  const maps = getIndexMaps(dataset);
  const { area, element, value, quality } = dataset.columns;
  const numAreas = dataset.metadata.areas.length;

  interface AreaBucket {
    exportVal: number;
    importVal: number;
    exportQty: number;
    importQty: number;
    totalVal: number;
    officialVal: number;
    rowCount: number;
  }

  const buckets: AreaBucket[] = Array.from({ length: numAreas }, () => ({
    exportVal: 0,
    importVal: 0,
    exportQty: 0,
    importQty: 0,
    totalVal: 0,
    officialVal: 0,
    rowCount: 0
  }));

  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    const a = area[idx];
    const b = buckets[a];
    b.rowCount++;

    const elem = element[idx];
    const val = value[idx];

    if (elem === maps.elementExportVal) {
      b.exportVal += val;
      b.totalVal += val;
      if (quality[idx] === maps.qualityOfficial) b.officialVal += val;
    } else if (elem === maps.elementImportVal) {
      b.importVal += val;
      b.totalVal += val;
      if (quality[idx] === maps.qualityOfficial) b.officialVal += val;
    } else if (elem === maps.elementExportQty) {
      b.exportQty += val;
    } else if (elem === maps.elementImportQty) {
      b.importQty += val;
    }
  }

  return dataset.metadata.areas.map((areaName, a) => {
    const b = buckets[a];
    const exportValueBn = b.exportVal / 1_000_000;
    const importValueBn = b.importVal / 1_000_000;
    const tradeBalanceBn = exportValueBn - importValueBn;
    const totalTradeBn = exportValueBn + importValueBn;
    const ratio = importValueBn > 0 ? exportValueBn / importValueBn : null;
    const exportQuantityMt = b.exportQty / 1_000_000;
    const importQuantityMt = b.importQty / 1_000_000;
    const countrySharePct =
      totalExportValueBn > 0 ? (exportValueBn / totalExportValueBn) * 100 : 0;
    const officialDataSharePct = b.totalVal > 0 ? (b.officialVal / b.totalVal) * 100 : 0;

    return {
      area: areaName,
      exportValueBn,
      importValueBn,
      tradeBalanceBn,
      totalTradeBn,
      ratio,
      exportQuantityMt,
      importQuantityMt,
      countrySharePct,
      officialDataSharePct,
      rowCount: b.rowCount
    };
  });
}

/**
 * Compute aggregates grouped by Item.
 */
export function computeItemAggregates(
  dataset: TradeDataset,
  indices: number[],
  totalExportValueBn: number,
  filters: FilterState
): ItemAggregate[] {
  const maps = getIndexMaps(dataset);
  const { item, element, value, year } = dataset.columns;
  const numItems = dataset.metadata.items.length;

  interface ItemBucket {
    exportVal: number;
    importVal: number;
    exportQty: number;
    importQty: number;
    rowCount: number;
    // Map year -> exportVal for item YoY
    yearExportVals: Map<number, number>;
  }

  const buckets: ItemBucket[] = Array.from({ length: numItems }, () => ({
    exportVal: 0,
    importVal: 0,
    exportQty: 0,
    importQty: 0,
    rowCount: 0,
    yearExportVals: new Map<number, number>()
  }));

  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    const it = item[idx];
    const b = buckets[it];
    b.rowCount++;

    const elem = element[idx];
    const val = value[idx];
    const y = year[idx];

    if (elem === maps.elementExportVal) {
      b.exportVal += val;
      const currentVal = b.yearExportVals.get(y) || 0;
      b.yearExportVals.set(y, currentVal + val);
    } else if (elem === maps.elementImportVal) {
      b.importVal += val;
    } else if (elem === maps.elementExportQty) {
      b.exportQty += val;
    } else if (elem === maps.elementImportQty) {
      b.importQty += val;
    }
  }

  const [, maxYear] = filters.yearRange;

  return dataset.metadata.items.map((itemName, it) => {
    const b = buckets[it];
    const exportValueBn = b.exportVal / 1_000_000;
    const importValueBn = b.importVal / 1_000_000;
    const tradeBalanceBn = exportValueBn - importValueBn;
    const totalTradeBn = exportValueBn + importValueBn;
    const ratio = importValueBn > 0 ? exportValueBn / importValueBn : null;
    const exportQuantityMt = b.exportQty / 1_000_000;
    const importQuantityMt = b.importQty / 1_000_000;
    const productSharePct =
      totalExportValueBn > 0 ? (exportValueBn / totalExportValueBn) * 100 : 0;

    // Item YoY for the latest selected year vs previous available
    let exportYoY: number | null = null;
    const yearsPresent = Array.from(b.yearExportVals.keys()).sort((a, b) => a - b);
    if (yearsPresent.length >= 2) {
      // Find latest year <= maxYear
      const validYears = yearsPresent.filter((y) => y <= maxYear);
      if (validYears.length >= 2) {
        const curY = validYears[validYears.length - 1];
        const prevY = validYears[validYears.length - 2];
        const curV = b.yearExportVals.get(curY)!;
        const prevV = b.yearExportVals.get(prevY)!;
        if (prevV > 0) {
          exportYoY = ((curV - prevV) / prevV) * 100;
        }
      }
    }

    return {
      item: itemName,
      exportValueBn,
      importValueBn,
      tradeBalanceBn,
      totalTradeBn,
      ratio,
      exportQuantityMt,
      importQuantityMt,
      productSharePct,
      exportYoY,
      rowCount: b.rowCount
    };
  });
}

/**
 * Compute Quality distribution breakdown.
 */
export function computeQualityAggregates(
  dataset: TradeDataset,
  indices: number[]
): QualityAggregate[] {
  const maps = getIndexMaps(dataset);
  const { quality, value, element } = dataset.columns;
  const numQualities = dataset.metadata.qualities.length;

  const counts = new Array(numQualities).fill(0);
  const values = new Array(numQualities).fill(0);
  let totalRows = 0;

  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    const q = quality[idx];
    counts[q]++;
    totalRows++;

    const elem = element[idx];
    if (elem === maps.elementExportVal || elem === maps.elementImportVal) {
      values[q] += value[idx];
    }
  }

  return dataset.metadata.qualities.map((qName, q) => ({
    quality: qName,
    rowCount: counts[q],
    valueBn: values[q] / 1_000_000,
    sharePct: totalRows > 0 ? (counts[q] / totalRows) * 100 : 0
  }));
}

/**
 * Compute Area × Year matrix for heatmaps and ribbon charts.
 */
export function computeAreaYearMatrix(
  dataset: TradeDataset,
  indices: number[]
): AreaYearCell[] {
  const maps = getIndexMaps(dataset);
  const { area, year, element, value } = dataset.columns;

  // Key: areaIdx_year
  const map = new Map<string, { exp: number; imp: number }>();

  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    const a = area[idx];
    const y = year[idx];
    const key = `${a}_${y}`;
    let item = map.get(key);
    if (!item) {
      item = { exp: 0, imp: 0 };
      map.set(key, item);
    }

    const elem = element[idx];
    if (elem === maps.elementExportVal) {
      item.exp += value[idx];
    } else if (elem === maps.elementImportVal) {
      item.imp += value[idx];
    }
  }

  const result: AreaYearCell[] = [];
  map.forEach((vals, key) => {
    const [aStr, yStr] = key.split('_');
    const aIdx = parseInt(aStr, 10);
    const y = parseInt(yStr, 10);
    const expBn = vals.exp / 1_000_000;
    const impBn = vals.imp / 1_000_000;
    result.push({
      area: dataset.metadata.areas[aIdx],
      year: y,
      exportValueBn: expBn,
      importValueBn: impBn,
      tradeBalanceBn: expBn - impBn
    });
  });

  return result;
}
