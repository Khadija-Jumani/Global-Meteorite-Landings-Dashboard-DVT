# Global Meteorite Landings Visualization System

## Overview
This project is a web-based, interactive visualization system built with **D3.js**. It visualizes the historical impacts of meteorites across the globe, allowing users to explore the data geographically, temporally, and categorically.

This project was developed for the Data Visualization Techniques (DSC327) course.

## Features
- **Interactive Map:** A world map plotting meteorite impacts. Supports zooming, panning, and detailed tooltips.
- **Cross-Filtering:** 
  - **Timeline Brushing:** Click and drag on the timeline to filter the map by a specific range of years.
  - **Donut Chart Filtering:** Click a meteorite class slice in the donut chart to filter the map and timeline.
- **Responsive Data:** All charts are dynamically linked and update smoothly when filters are applied.

## How to Run

Because this project loads local files (`data/world.geojson` and `data/cleaned_meteorites.csv`) using the Javascript `fetch`/`Promise` API, opening `index.html` directly in the browser via `file://` will cause **CORS (Cross-Origin Resource Sharing)** errors.

To run the application, you must use a local web server.

### Using Python (Recommended)
If you have Python installed, open your terminal/command prompt, navigate to the folder containing this `README.md`, and run:
```bash
python -m http.server 8000
```
Then, open your web browser and go to: `http://localhost:8000`

### Using Node.js
If you have Node.js installed, you can use `http-server`:
```bash
npx http-server
```
Then follow the link provided in the console (usually `http://localhost:8080`).

## File Structure
- `index.html`: The main web page.
- `css/style.css`: Stylesheet with dark theme aesthetics.
- `js/app.js`: Core D3.js logic for rendering and interactivity.
- `data/`: Contains the GeoJSON world map and the CSV meteorite dataset.
- `EDA_and_Preprocessing.ipynb`: Jupyter notebook containing the Exploratory Data Analysis.
- `Design_Documentation_Report.md`: Full documentation of the design and development process.
