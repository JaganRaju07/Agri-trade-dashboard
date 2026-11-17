import fs from 'fs';
import path from 'path';
import { TradeDataset, FilterState } from '../src/types/data';
import {
  filterIndices,
  computeCoreAggregates,
  computeAreaAggregates
} from '../src/lib/aggregation';

function assertTolerance(
  name: string,
  actual: number,
  expected: number,
  tolerancePct: number = 0.5
): boolean {
  const diffPct = Math.abs((actual - expected) / expected) * 100;
  const passed = diffPct <= tolerancePct;
  const status = passed ? 'PASS' : 'FAIL';
  console.log(
    `[${status}] ${name.padEnd(30)}: Actual = ${actual.toFixed(2)}, Expected = ${expected.toFixed(2)} (diff: ${diffPct.toFixed(3)}%, max allowed: ${tolerancePct}%)`
  );
  return passed;
}

function verify(): void {
  console.log('='.repeat(80));
  console.log('AGRI TRADE DASHBOARD — POWER BI BENCHMARK VERIFICATION');
  console.log('='.repeat(80));

  const jsonPath = path.resolve(process.cwd(), 'public/data/trade.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`ERROR: Cannot find ${jsonPath}. Run python/prepare_data.py first.`);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const dataset: TradeDataset = JSON.parse(raw);

  const defaultFilters: FilterState = {
    yearRange: [2000, 2024],
    selectedAreas: [],
    selectedItems: [],
    crossFilterArea: null,
    crossFilterItem: null
  };

  const indices = filterIndices(dataset, defaultFilters);
  const core = computeCoreAggregates(dataset, indices);
  const areas = computeAreaAggregates(dataset, indices, core.exportValueBn);

  const usa = areas.find((a) => a.area.includes('United States'));
  const brazil = areas.find((a) => a.area === 'Brazil');
  const china = areas.find((a) => a.area === 'China');

  let allPassed = true;

  // 1. Row count (exact 31,571)
  const rowPass = core.rowCount === 31571;
  console.log(
    `[${rowPass ? 'PASS' : 'FAIL'}] ${'Row Count'.padEnd(30)}: Actual = ${core.rowCount}, Expected = 31571`
  );
  if (!rowPass) allPassed = false;

  // 2. Export Value: 2,704.07 bn
  allPassed = assertTolerance('Export Value (USD bn)', core.exportValueBn, 2704.07) && allPassed;

  // 3. Import Value: 2,003.42 bn
  allPassed = assertTolerance('Import Value (USD bn)', core.importValueBn, 2003.42) && allPassed;

  // 4. Trade Balance: 700.65 bn
  allPassed = assertTolerance('Trade Balance (USD bn)', core.tradeBalanceBn, 700.65) && allPassed;

  // 5. Export Quantity: ~6,539 Mt
  allPassed = assertTolerance('Export Quantity (Mt)', core.exportQuantityMt, 6539, 0.5) && allPassed;

  // 6. Import Quantity: ~3,366 Mt
  allPassed = assertTolerance('Import Quantity (Mt)', core.importQuantityMt, 3366, 0.5) && allPassed;

  // 7. USA exports: ~1,073 bn
  allPassed = assertTolerance('USA Exports (USD bn)', usa?.exportValueBn ?? 0, 1073, 0.5) && allPassed;

  // 8. Brazil exports: ~655 bn
  allPassed = assertTolerance('Brazil Exports (USD bn)', brazil?.exportValueBn ?? 0, 655, 0.5) && allPassed;

  // 9. China imports: ~1,045 bn
  allPassed = assertTolerance('China Imports (USD bn)', china?.importValueBn ?? 0, 1045, 0.5) && allPassed;

  // 10. China net deficit: about 853 bn (abs of net = 852.57)
  const chinaDeficit = Math.abs(china?.tradeBalanceBn ?? 0);
  allPassed = assertTolerance('China Net Deficit (USD bn)', chinaDeficit, 853, 0.5) && allPassed;

  // 11. Official share of value data: about 97.9%
  allPassed = assertTolerance('Official Data Share %', core.officialDataSharePct, 97.9, 0.5) && allPassed;

  console.log('='.repeat(80));
  if (allPassed) {
    console.log('VERIFICATION RESULT: ALL 11 POWER BI BENCHMARK ASSERTIONS PASSED!');
    console.log('='.repeat(80));
  } else {
    console.error('VERIFICATION RESULT: ONE OR MORE ASSERTIONS FAILED.');
    console.log('='.repeat(80));
    process.exit(1);
  }
}

verify();
