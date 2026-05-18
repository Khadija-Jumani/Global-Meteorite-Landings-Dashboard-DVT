# Presentation and Viva Outline (10 Minutes)

## Slide 1: Introduction (1 min)
- **Title:** Global Meteorite Landings Visualization System.
- **Objective:** To explore the spatial and temporal distribution of meteorite impacts across the earth.
- **Dataset:** Sourced to simulate NASA's Open Data portal. Distinct and highly multidimensional (geospatial, temporal, categorical, and quantitative).

## Slide 2: Data Preprocessing & EDA (2 mins)
- Discuss how the data was prepared (refer to the Jupyter Notebook).
- Addressed missing variables (dropped null coordinates and invalid years).
- **Key EDA insight:** Huge spike in recorded landings in the 20th century due to scientific observation advancements, heavily skewed geographically toward populated/surveyed continents.

## Slide 3: Visualization Choices & Justification (3 mins)
- Explain **Marks and Channels**:
  - **Map:** Points (Marks) with Spatial Position (Latitude/Longitude), Size (Mass of the meteorite), and Color (Meteorite Class).
  - **Timeline:** Line/Area (Histogram) showing the trend of impacts over the years.
  - **Donut Chart:** Slices representing the frequency of the top meteorite classes.
- Mention why D3.js was used (flexibility, fine DOM control, custom SVGs).

## Slide 4: Live Demo - Interactivity (3 mins)
- *Action:* Open the web app and demonstrate.
- **Zoom & Pan:** Zoom into the USA or Europe to see clusters.
- **Tooltips:** Hover over a massive point to show exactly what a tooltip reveals (details on demand).
- **Brushing:** Drag the cursor across the timeline (e.g., from 1950 to 2000). Show how the map and donut chart instantly update.
- **Cross-Filtering:** Click on the "L6" class in the donut chart. Show how the map points filter to only L6 meteorites.

## Slide 5: Challenges & Conclusion (1 min)
- **Challenges:** Rendering performance for large SVG datasets and managing the state logic for complex brushing and cross-filtering.
- **Conclusion:** The project successfully applies Bloom's Taxonomy (Creating) by synthesizing raw data into an actionable, interactive dashboard that facilitates real discovery.

## Viva Preparation (Anticipated Questions)
1. **Why did you choose a Donut Chart instead of a Bar Chart for classes?**
   *Answer:* It emphasizes part-to-whole relationships for the top classes while leaving vertical/horizontal axes free for the timeline.
2. **How does brushing work in D3.js?**
   *Answer:* D3's `d3.brushX()` creates an overlay. When the user drags, it returns pixel coordinates (`selection`). We use `scale.invert()` to map those pixels back to data values (Years), then filter the raw data array.
3. **What is graphical integrity? How did you maintain it?**
   *Answer:* Graphical integrity ensures visualizations don't lie. I mapped the mass of meteorites using a `d3.scaleSqrt()` instead of a linear scale. If I used a linear scale for radius, the area (which the eye perceives) would scale quadratically, distorting the actual data values.
