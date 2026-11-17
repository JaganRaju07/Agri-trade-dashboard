import { MeasureDefinition } from '../types/data';

export const MEASURES: MeasureDefinition[] = [
  {
    id: 'export-value',
    name: 'Export Value (USD bn)',
    unit: 'USD bn',
    category: 'Value',
    description: 'Total value of agricultural commodities exported, converted from 1,000 USD to billions.',
    dax: `Export Value (USD bn) = 
DIVIDE(
    CALCULATE(
        SUM(FAO_Trade[Value]),
        FAO_Trade[Element] = "Export value"
    ),
    1000000
)`
  },
  {
    id: 'import-value',
    name: 'Import Value (USD bn)',
    unit: 'USD bn',
    category: 'Value',
    description: 'Total value of agricultural commodities imported, converted from 1,000 USD to billions.',
    dax: `Import Value (USD bn) = 
DIVIDE(
    CALCULATE(
        SUM(FAO_Trade[Value]),
        FAO_Trade[Element] = "Import value"
    ),
    1000000
)`
  },
  {
    id: 'trade-balance',
    name: 'Trade Balance (USD bn)',
    unit: 'USD bn',
    category: 'Value',
    description: 'Net trade balance calculated as total export value minus total import value.',
    dax: `Trade Balance (USD bn) = 
[Export Value (USD bn)] - [Import Value (USD bn)]`
  },
  {
    id: 'total-trade-value',
    name: 'Total Trade Value (USD bn)',
    unit: 'USD bn',
    category: 'Value',
    description: 'Gross agricultural trade turnover (sum of exports and imports).',
    dax: `Total Trade Value (USD bn) = 
[Export Value (USD bn)] + [Import Value (USD bn)]`
  },
  {
    id: 'export-import-ratio',
    name: 'Export-Import Ratio',
    unit: 'ratio',
    category: 'Ratio',
    description: 'Ratio of exports to imports. Values above 1 indicate a net exporter; below 1 indicates net importer.',
    dax: `Export-Import Ratio = 
DIVIDE(
    [Export Value (USD bn)],
    [Import Value (USD bn)],
    BLANK()
)`
  },
  {
    id: 'export-quantity',
    name: 'Export Quantity (Mt)',
    unit: 'Mt',
    category: 'Quantity',
    description: 'Total physical volume of exported agricultural products in Million tonnes.',
    dax: `Export Quantity (Mt) = 
DIVIDE(
    CALCULATE(
        SUM(FAO_Trade[Value]),
        FAO_Trade[Element] = "Export quantity"
    ),
    1000000
)`
  },
  {
    id: 'import-quantity',
    name: 'Import Quantity (Mt)',
    unit: 'Mt',
    category: 'Quantity',
    description: 'Total physical volume of imported agricultural products in Million tonnes.',
    dax: `Import Quantity (Mt) = 
DIVIDE(
    CALCULATE(
        SUM(FAO_Trade[Value]),
        FAO_Trade[Element] = "Import quantity"
    ),
    1000000
)`
  },
  {
    id: 'export-yoy',
    name: 'Export YoY %',
    unit: '%',
    category: 'Ratio',
    description: 'Percentage change in export value compared to the previous available year (e.g. 2005 vs 2003 due to 2004 gap).',
    dax: `Export YoY % = 
VAR CurrentYear = MAX(FAO_Trade[Year])
VAR PreviousYear = 
    CALCULATE(
        MAX(FAO_Trade[Year]),
        FILTER(ALLSELECTED(FAO_Trade[Year]), FAO_Trade[Year] < CurrentYear)
    )
VAR CurrentVal = [Export Value (USD bn)]
VAR PreviousVal = 
    CALCULATE(
        [Export Value (USD bn)],
        FAO_Trade[Year] = PreviousYear
    )
RETURN
    DIVIDE(CurrentVal - PreviousVal, PreviousVal) * 100`
  },
  {
    id: 'import-yoy',
    name: 'Import YoY %',
    unit: '%',
    category: 'Ratio',
    description: 'Percentage change in import value compared to the previous available year.',
    dax: `Import YoY % = 
VAR CurrentYear = MAX(FAO_Trade[Year])
VAR PreviousYear = 
    CALCULATE(
        MAX(FAO_Trade[Year]),
        FILTER(ALLSELECTED(FAO_Trade[Year]), FAO_Trade[Year] < CurrentYear)
    )
VAR CurrentVal = [Import Value (USD bn)]
VAR PreviousVal = 
    CALCULATE(
        [Import Value (USD bn)],
        FAO_Trade[Year] = PreviousYear
    )
RETURN
    DIVIDE(CurrentVal - PreviousVal, PreviousVal) * 100`
  },
  {
    id: 'product-share',
    name: 'Product Share of Exports %',
    unit: '%',
    category: 'Ratio',
    description: 'Contribution of a specific agricultural commodity to total exports among currently selected items.',
    dax: `Product Share of Exports % = 
DIVIDE(
    [Export Value (USD bn)],
    CALCULATE([Export Value (USD bn)], ALLSELECTED(FAO_Trade[Item]))
) * 100`
  },
  {
    id: 'country-share',
    name: 'Country Share of Exports %',
    unit: '%',
    category: 'Ratio',
    description: 'Contribution of a reporting nation to total exports among currently selected countries.',
    dax: `Country Share of Exports % = 
DIVIDE(
    [Export Value (USD bn)],
    CALCULATE([Export Value (USD bn)], ALLSELECTED(FAO_Trade[Area]))
) * 100`
  },
  {
    id: 'official-share',
    name: 'Official Data Share %',
    unit: '%',
    category: 'Quality',
    description: 'Percentage of total trade value certified by national reporting agencies (Flag A: Official).',
    dax: `Official Data Share % = 
DIVIDE(
    CALCULATE(
        SUM(FAO_Trade[Value]),
        FAO_Trade[Data Quality] = "Official",
        FAO_Trade[Measure Type] = "Value"
    ),
    CALCULATE(
        SUM(FAO_Trade[Value]),
        FAO_Trade[Measure Type] = "Value"
    )
) * 100`
  },
  {
    id: 'row-count',
    name: 'Row Count',
    unit: 'count',
    category: 'System',
    description: 'Total number of active records in the filtered dataset.',
    dax: `Row Count = COUNTROWS(FAO_Trade)`
  }
];
