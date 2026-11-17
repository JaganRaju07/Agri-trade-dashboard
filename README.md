# Global Import and Export in Agriculture: FAO Trade Analysis, 2000–2024

**Course:** Data Visualization Lab (`BISL504`), 5th Semester  
**Institution:** The National Institute of Engineering (NIE), Mysuru  
**Department:** Information Science & Engineering  
**Students:** Jagan Raju B (`4NI25IS416`), Kiran S V (`4NI25IS421`)  
**Faculty Guides:** Ms. Prajakta Madankar (Assistant Professor), Sri. Rampur Srinath (Associate Professor)  

---

## 1. Overview

**Agri Trade Ledger** is an offline-capable, high-performance web dashboard that reproduces the project's Power BI counterpart (`DV_Agri_Trade.pbix`) **1:1 in content**, covering all 12 analytical pages, DAX measures, global synced slicers, and interactive cross-filtering.

Designed with an **editorial trade ledger** aesthetic reminiscent of statistical yearbooks, the interface avoids template-like SaaS conventions in favor of a warm paper palette, serif typography, strict semantic data coloring (Forest Green for exports, Terracotta for imports), and bespoke hand-crafted SVG visualizations built with D3 primitives.

### Key Capabilities
- **Complete Offline Capability:** Zero runtime external CDN links; all typography (`Newsreader`, `IBM Plex Sans`, `IBM Plex Mono`) and datasets are self-hosted.
- **Client-Side Live Aggregation:** All filtering, cross-filtering, and DAX metric recomputations run in-browser across 31,571 records in under 2ms.
- **Bespoke D3 Visualizations:** Line charts, diverging horizontal bars, column charts, area curves, donuts, pies, squarified treemaps, parity scatter plots, bump ribbon charts, funnel hierarchies, waterfall step charts, and heatmaps.
- **Power BI DAX Verification:** Includes an automated assertion suite (`npm run verify`) checking all 11 core KPIs against the Power BI ground truth to within 0.5% tolerance.

---

## 2. Page-by-Page Mapping to Power BI

| Page # | Dashboard Page Name | Power BI Report Equivalent | Key Visualizations & Elements |
|---|---|---|---|
| **01** | **Trade Overview** | Page 1: Overview | 4 Core Cards (Export, Import, Balance, Ratio) + Export Value by Year Line Chart |
| **02** | **Area Analysis** | Page 2: Country Exports | Clustered/Ranked Bar Chart (Export by Area) + Leading Nation KPI Cards |
| **03** | **Product Analysis** | Page 3: Commodity Matrix | Commodity Ledger Table with Inline Share Bars + Export by Item Bar Chart |
| **04** | **Trade Balance** | Page 4: Balance & Net Position | Diverging Balance by Year Column Chart + National Ledger + Diverging Bar Chart |
| **05** | **Data Quality** | Page 5: Quality Assurance | FAO Quality Flag Donut Chart + Official Share % Column Chart + Exact Count Cards |
| **06** | **Quantity Analysis** | Page 6: Physical Volumes | Export vs Import Volume (Mt) Line Chart + Commodity Quantity Bar Chart + Volume Cards |
| **07** | **Growth and Share** | Page 7: Turnover & Dynamics | Gross Turnover Card + Area × Year Heatmap Matrix + Country Share Bar + YoY Lines + Treemap |
| **08** | **Trade Composition** | Page 8: Export Shares | Export by Area Pie Chart with Direct Callouts + National Composition Table |
| **09** | **Area Trade Position** | Page 9: Trade Parity Matrix | Export vs Import Scatter Plot with Diagonal Parity Line ($x = y$) + Quadrant Register |
| **10** | **Import Analysis** | Page 10: Inbound Trade | Commodity Import Allocation Treemap + Import by Area Bar + Import Trajectory Line + Cards |
| **11** | **Area Trends** | Page 11: Multi-Decade Trends | Gross Trade Area Chart + National Export Rank Ribbon Bump Chart (`curveBumpX`) + Year Columns |
| **12** | **Product Deep Dive** | Page 12: Funnel & Waterfall | Top 10 Commodity Funnel + National Trade Balance Waterfall + Full Commodity Register |

---

## 3. Data Model & Methodology

- **Source:** FAOSTAT Trade: Crops and livestock products (`TCL`), 2000–2024.
- **Scope:** 12 reporting nations, 36 commodities, 31,571 records.
- **Year 2004 Gap:** Year 2004 is absent from the FAO extraction; all Year-over-Year measures (`YoY %`) dynamically compare 2005 against 2003.
- **Units:** Value records are reported in 1,000 USD (converted to USD bn via $\div 1,000,000$). Quantity records are reported in tonnes (converted to Mt via $\div 1,000,000$). Elements are never summed together.
- **Quality Flags:**
  - `A`: Official value reported by national authorities (97.93% of trade value).
  - `X`: Value from external trading partners database.
  - `E`: Estimated value modeled by FAO.
  - `I`: Value imputed by receiving agency methodology.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.9+ with `pandas`)

### Installation Steps

1. **Install Python dependencies:**
   ```bash
   pip install pandas
   ```

2. **Generate compact browser dataset:**
   ```bash
   python python/prepare_data.py
   ```
   *Reads `data/raw/FAOSTAT_Dataset.csv` and outputs `public/data/trade.json` (646 KB compact column arrays).*

3. **Install frontend dependencies:**
   ```bash
   npm install
   ```

4. **Run benchmark verification:**
   ```bash
   npm run verify
   ```
   *Executes `scripts/verify.ts` and asserts all metrics against the Power BI ground truth.*

5. **Start local development server:**
   ```bash
   npm run dev
   ```
   *Opens the ledger at `http://localhost:3000`.*

### Windows Quick-Start
Double-click `start-dashboard.bat` to automatically verify data generation, install packages, and launch the dashboard in your default browser.

---

## 5. Keyboard Navigation

- `[` / `]`: Switch to Previous / Next page
- `1` – `9`: Jump directly to Pages 01 through 09
- `R`: Reset all slicers and cross-filters to default
- `M`: Toggle the **Measures & DAX Drawer**
- `Escape`: Close open drawers and modals

---

## 6. Screenshots & Visual Assets

Screenshots and exports of all 12 dashboard pages are stored in the [`screenshots/`](./screenshots/) directory.
