"""
FAO Trade Data Preparation Script
Course: Data Visualization Lab (BISL504), The National Institute of Engineering, Mysuru
Prepares compact column-array JSON from raw FAOSTAT CSV for offline client-side aggregation.
"""

import os
import json
import pandas as pd

def prepare_data():
    raw_path = os.path.join('data', 'raw', 'FAOSTAT_Dataset.csv')
    if not os.path.exists(raw_path):
        # check parent or current
        if os.path.exists('FAOSTAT_Dataset.csv'):
            raw_path = 'FAOSTAT_Dataset.csv'
        elif os.path.exists(os.path.join('..', 'FAOSTAT_Dataset.csv')):
            raw_path = os.path.join('..', 'FAOSTAT_Dataset.csv')
        else:
            raise FileNotFoundError(f"Cannot locate FAOSTAT_Dataset.csv at {raw_path}")

    print(f"Reading raw data from: {raw_path}")
    df = pd.read_csv(raw_path)

    # Columns needed: Area, Item, Element, Year, Value, Flag
    required_cols = ['Area', 'Item', 'Element', 'Year', 'Value', 'Flag']
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Clean strings and types
    df['Area'] = df['Area'].astype(str).str.strip()
    df['Item'] = df['Item'].astype(str).str.strip()
    df['Element'] = df['Element'].astype(str).str.strip()
    df['Year'] = df['Year'].astype(int)
    df['Value'] = pd.to_numeric(df['Value'], errors='coerce').fillna(0.0)
    df['Flag'] = df['Flag'].astype(str).str.strip()

    # Flag description cross-check if present
    # A = Official, X = External estimate, E = Estimated, I = Imputed
    quality_map = {
        'A': 'Official',
        'X': 'External estimate',
        'E': 'Estimated',
        'I': 'Imputed'
    }
    df['Data_Quality'] = df['Flag'].map(quality_map).fillna('Official')
    df['Measure_Type'] = df['Element'].apply(lambda x: 'Value' if 'value' in str(x).lower() else 'Quantity')

    # Profile stats
    total_rows = len(df)
    unique_areas = sorted(df['Area'].unique().tolist())
    unique_items = sorted(df['Item'].unique().tolist())
    unique_elements = sorted(df['Element'].unique().tolist())
    unique_qualities = ['Official', 'External estimate', 'Estimated', 'Imputed']
    unique_years = sorted(df['Year'].unique().tolist())

    print("\n" + "="*50)
    print("DATA PROFILE")
    print("="*50)
    print(f"Total Rows: {total_rows:,}")
    print(f"Reporting Areas ({len(unique_areas)}): {', '.join(unique_areas)}")
    print(f"Commodity Items ({len(unique_items)}): {unique_items[:5]} ... (total {len(unique_items)})")
    print(f"Elements ({len(unique_elements)}): {unique_elements}")
    print(f"Years ({len(unique_years)}): {min(unique_years)} to {max(unique_years)} (2004 absent: {2004 not in unique_years})")
    print(f"Flag Distribution: {df['Flag'].value_counts().to_dict()}")

    exp_val = df[df['Element'] == 'Export value']['Value'].sum() / 1e6
    imp_val = df[df['Element'] == 'Import value']['Value'].sum() / 1e6
    bal = exp_val - imp_val
    exp_qty = df[df['Element'] == 'Export quantity']['Value'].sum() / 1e6
    imp_qty = df[df['Element'] == 'Import quantity']['Value'].sum() / 1e6
    val_df = df[df['Measure_Type'] == 'Value']
    official_share_val = (val_df[val_df['Flag'] == 'A']['Value'].sum() / val_df['Value'].sum()) * 100

    print("\nBENCHMARK METRICS (vs Power BI Ground Truth):")
    print(f"  Export Value: {exp_val:,.2f} USD bn (Target: 2,704.07 bn)")
    print(f"  Import Value: {imp_val:,.2f} USD bn (Target: 2,003.42 bn)")
    print(f"  Trade Balance: {bal:,.2f} USD bn (Target: 700.65 bn)")
    print(f"  Export Quantity: {exp_qty:,.2f} Mt (Target: ~6,539 Mt)")
    print(f"  Import Quantity: {imp_qty:,.2f} Mt (Target: ~3,366 Mt)")
    print(f"  Official Value Share: {official_share_val:.2f}% (Target: ~97.9%)")
    print("="*50 + "\n")

    # Map to compact index arrays
    area_idx = {name: i for i, name in enumerate(unique_areas)}
    item_idx = {name: i for i, name in enumerate(unique_items)}
    element_idx = {name: i for i, name in enumerate(unique_elements)}
    quality_idx = {name: i for i, name in enumerate(unique_qualities)}

    output_data = {
        "metadata": {
            "title": "Global Import and Export in Agriculture: FAO Trade Analysis, 2000–2024",
            "source": "FAOSTAT TCL (Crops and livestock products)",
            "rowCount": total_rows,
            "areas": unique_areas,
            "items": unique_items,
            "elements": unique_elements,
            "qualities": unique_qualities,
            "years": unique_years,
        },
        "columns": {
            "year": df['Year'].tolist(),
            "area": [area_idx[a] for a in df['Area']],
            "item": [item_idx[it] for it in df['Item']],
            "element": [element_idx[e] for e in df['Element']],
            "value": [round(float(v), 4) for v in df['Value']],
            "quality": [quality_idx[q] for q in df['Data_Quality']],
        }
    }

    out_dir = os.path.join('public', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'trade.json')

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, separators=(',', ':'))

    size_kb = os.path.getsize(out_file) / 1024
    print(f"Successfully generated {out_file} ({size_kb:.1f} KB)")

if __name__ == '__main__':
    prepare_data()
