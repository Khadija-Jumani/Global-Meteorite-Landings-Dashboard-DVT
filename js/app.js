// Dashboard state
let globalData = [];
let filteredData = [];
let geoData = null;
let selectedClass = null;
let selectedYears = null;

// Tooltip setup
const tooltip = d3.select("#tooltip");

// Color scale for different meteorite classes
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Load data
Promise.all([
    d3.json("data/world.geojson"),
    d3.csv("data/cleaned_meteorites.csv")
]).then(function(files) {
    geoData = files[0];
    
    // Parse numeric data
    globalData = files[1].map(d => ({
        ...d,
        year: +d.year,
        mass: +d.mass,
        lat: +d.lat,
        lng: +d.lng
    })).filter(d => d.lat && d.lng); // ensure valid coordinates

    filteredData = [...globalData];

    initMap();
    initTimeline();
    initDonut();
    
    updateDashboard();
}).catch(err => console.error("Error loading data:", err));


// --- Map Component ---
let mapSvg, projection, path, gMap;

function initMap() {
    const container = d3.select("#map-container");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;

    mapSvg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add zoom functionality
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            gMap.attr("transform", event.transform);
        });
    mapSvg.call(zoom);

    projection = d3.geoMercator()
        .scale(width / 6.5)
        .translate([width / 2, height / 1.5]);
    
    path = d3.geoPath().projection(projection);

    gMap = mapSvg.append("g");

    // Draw countries
    gMap.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path);
}

function updateMap() {
    // Radius scale based on mass
    const rScale = d3.scaleSqrt()
        .domain([0, d3.max(globalData, d => d.mass)])
        .range([2, 20]);

    const circles = gMap.selectAll("circle.meteorite")
        .data(filteredData, d => d.id);

    circles.exit().remove();

    circles.enter()
        .append("circle")
        .attr("class", "meteorite")
        .attr("cx", d => projection([d.lng, d.lat])[0])
        .attr("cy", d => projection([d.lng, d.lat])[1])
        .attr("r", 0)
        .style("fill", d => colorScale(d.recclass))
        .on("mouseover", function(event, d) {
            d3.select(this).style("stroke", "#ffeb3b").style("stroke-width", "2px");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`
                <strong>${d.name}</strong><br>
                Class: ${d.recclass}<br>
                Year: ${d.year}<br>
                Mass: ${d.mass.toLocaleString()} g<br>
                Coords: ${d.lat.toFixed(2)}, ${d.lng.toFixed(2)}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("stroke", "#fff").style("stroke-width", "0.5px");
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .merge(circles)
        .transition().duration(500)
        .attr("r", d => rScale(d.mass));
}

// --- Timeline Component (Brushable) ---
let timelineSvg, xTimeline, yTimeline, timelineXAxis, timelineYAxis;

function initTimeline() {
    const container = d3.select("#timeline-container");
    const width = container.node().getBoundingClientRect().width;
    const height = 250;
    const margin = {top: 20, right: 20, bottom: 30, left: 40};

    timelineSvg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    xTimeline = d3.scaleLinear()
        .domain(d3.extent(globalData, d => d.year))
        .range([margin.left, width - margin.right]);

    yTimeline = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);

    timelineXAxis = timelineSvg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`);

    timelineYAxis = timelineSvg.append("g")
        .attr("transform", `translate(${margin.left},0)`);

    // Add Brush
    const brush = d3.brushX()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("end", brushed);

    timelineSvg.append("g")
        .attr("class", "brush")
        .call(brush);
}

function brushed(event) {
    if (!event.selection) {
        selectedYears = null;
    } else {
        const [x0, x1] = event.selection;
        selectedYears = [xTimeline.invert(x0), xTimeline.invert(x1)];
    }
    applyFilters();
}

function updateTimeline() {
    const height = 250;
    const margin = {top: 20, right: 20, bottom: 30, left: 40};

    // Calculate histogram for the data matching OTHER filters (i.e. donut chart)
    // To show how many items are left per year.
    const dataToBin = selectedClass ? globalData.filter(d => d.recclass === selectedClass) : globalData;

    const bins = d3.bin()
        .value(d => d.year)
        .domain(xTimeline.domain())
        .thresholds(xTimeline.ticks(40))
        (dataToBin);

    yTimeline.domain([0, d3.max(bins, d => d.length)]);

    timelineXAxis.call(d3.axisBottom(xTimeline).tickFormat(d3.format("d")));
    timelineYAxis.transition().duration(500).call(d3.axisLeft(yTimeline).ticks(5));

    const bars = timelineSvg.selectAll("rect.bar")
        .data(bins);

    bars.exit().remove();

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xTimeline(d.x0) + 1)
        .attr("width", d => Math.max(0, xTimeline(d.x1) - xTimeline(d.x0) - 1))
        .attr("y", yTimeline(0))
        .attr("height", 0)
        .merge(bars)
        .transition().duration(500)
        .attr("x", d => xTimeline(d.x0) + 1)
        .attr("width", d => Math.max(0, xTimeline(d.x1) - xTimeline(d.x0) - 1))
        .attr("y", d => yTimeline(d.length))
        .attr("height", d => yTimeline(0) - yTimeline(d.length));
}

// --- Donut Chart Component ---
let donutSvg, donutWidth, donutHeight, radius;
let gDonut;

function initDonut() {
    const container = d3.select("#donut-container");
    donutWidth = container.node().getBoundingClientRect().width;
    donutHeight = 250;
    radius = Math.min(donutWidth, donutHeight) / 2 - 10;

    donutSvg = container.append("svg")
        .attr("width", donutWidth)
        .attr("height", donutHeight);

    gDonut = donutSvg.append("g")
        .attr("transform", `translate(${donutWidth / 2}, ${donutHeight / 2})`);
}

function updateDonut() {
    // Calculate counts for the data matching OTHER filters (timeline)
    const dataToRoll = selectedYears ? globalData.filter(d => d.year >= selectedYears[0] && d.year <= selectedYears[1]) : globalData;

    const classCounts = d3.rollup(dataToRoll, v => v.length, d => d.recclass);
    const chartData = Array.from(classCounts, ([key, value]) => ({key, value}))
                           .sort((a,b) => b.value - a.value).slice(0, 10); // top 10 classes

    const pie = d3.pie().value(d => d.value).sort(null);
    const dataReady = pie(chartData);

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8);

    const arcHover = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.9);

    const paths = gDonut.selectAll("path")
        .data(dataReady, d => d.data.key);

    paths.exit().remove();

    paths.enter()
        .append("path")
        .attr("fill", d => colorScale(d.data.key))
        .attr("stroke", "var(--bg-color)")
        .style("stroke-width", "2px")
        .style("opacity", d => selectedClass === d.data.key || !selectedClass ? 1 : 0.3)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("d", arcHover);
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.data.key}</strong><br>Count: ${d.data.value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("d", arc);
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .on("click", function(event, d) {
            if (selectedClass === d.data.key) {
                selectedClass = null; // deselect
            } else {
                selectedClass = d.data.key;
            }
            applyFilters();
        })
        .merge(paths)
        .transition().duration(500)
        .attr("d", arc)
        .style("opacity", d => selectedClass === d.data.key || !selectedClass ? 1 : 0.3);
}

// --- Filtering Logic ---
function applyFilters() {
    filteredData = globalData.filter(d => {
        let matchClass = selectedClass ? d.recclass === selectedClass : true;
        let matchYear = selectedYears ? (d.year >= selectedYears[0] && d.year <= selectedYears[1]) : true;
        return matchClass && matchYear;
    });

    updateDashboard();
}

function updateDashboard() {
    updateMap();
    updateTimeline();
    updateDonut();
}

// Resize listener
window.addEventListener("resize", () => {
    // Basic responsive implementation. Better handling could re-initialize SVGs.
    d3.select("#map-container svg").remove();
    d3.select("#timeline-container svg").remove();
    d3.select("#donut-container svg").remove();
    
    initMap();
    initTimeline();
    initDonut();
    updateDashboard();
});
