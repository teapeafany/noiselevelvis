// Data
const rawData = [
    { time: "10:51:00 AM", location: "Blue Donkey", decibel: 60.1 },
    { time: "10:51:00 AM", location: "PG3", decibel: 60.1 },
    { time: "1:47:00 PM", location: "Skiles", decibel: 61.1 },
    { time: "3:27:00 PM", location: "PG3", decibel: 63.2 },
    { time: "6:04:00 AM", location: "Student Center", decibel: 60.2 },
    { time: "6:37:00 PM", location: "Skiles Courtyard", decibel: 58.8 },
    { time: "4:36:00 PM", location: "Kaldis", decibel: 70.4 },
    { time: "12:05:00 PM", location: "Skiles Walkway", decibel: 59.8 },
    { time: "2:36:00 PM", location: "Kaldis", decibel: 66.3 },
    { time: "2:44:00 PM", location: "Blue Donkey", decibel: 64.5 },
    { time: "12:52:00 PM", location: "Kaldis", decibel: 63.6 },
    { time: "12:54:00 PM", location: "Blue Donkey", decibel: 68 },
    { time: "12:58:00 PM", location: "PG3", decibel: 51 },
    { time: "1:21:00 PM", location: "PG3", decibel: 57.7 },
    { time: "1:24:00 PM", location: "Blue Donkey", decibel: 62.4 },
    { time: "1:27:00 PM", location: "Kaldis", decibel: 84.7 },
    { time: "3:06:00 PM", location: "Kaldis", decibel: 68.4 },
    { time: "3:10:00 PM", location: "PG3", decibel: 50.2 },
    { time: "3:14:00 PM", location: "Blue Donkey", decibel: 62.2 },
    { time: "4:03:00 PM", location: "Kaldis", decibel: 71 },
    { time: "4:06:00 PM", location: "Blue Donkey", decibel: 58 },
    { time: "4:07:00 PM", location: "PG3", decibel: 59.9 },
    { time: "11:30:00 AM", location: "Kaldis", decibel: 61.9 },
    { time: "11:30:00 AM", location: "Blue Donkey", decibel: 59.8 },
    { time: "11:30:00 AM", location: "PG3", decibel: 59.1 },
    { time: "12:30:00 PM", location: "Kaldis", decibel: 57.2 },
    { time: "12:30:00 PM", location: "Blue Donkey", decibel: 49 },
    { time: "12:30:00 PM", location: "PG3", decibel: 48 }
];

// Parse time and convert to Date object for today
function parseTime(timeStr) {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date();
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 = hours + 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    date.setHours(hour24, minutes, seconds || 0, 0);
    return date;
}

// Filter data to only include Blue Donkey, Kaldis, and PG3
const filteredRawData = rawData.filter(d => 
    d.location === "Blue Donkey" || 
    d.location === "Kaldis" || 
    d.location === "PG3"
);

// Process data
const processedData = filteredRawData.map(d => ({
    time: parseTime(d.time),
    location: d.location,
    decibel: d.decibel,
    timeStr: d.time
}));

// Get unique locations (should only be Blue Donkey, Kaldis, PG3)
const locations = [...new Set(processedData.map(d => d.location))].sort();

// Color scale for locations - inspired by warm library palette
// Colors: warm wood brown, sky blue, golden sunlight
const colorScale = d3.scaleOrdinal()
    .domain(locations)
    .range(["#8B6F47", "#4A90E2", "#D4A574"]); // Warm brown, sky blue, golden

// Group data by location
const dataByLocation = d3.group(processedData, d => d.location);

// Setup dimensions
const margin = { top: 40, right: 80, bottom: 60, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Parse time extent
const timeExtent = d3.extent(processedData, d => d.time);
const decibelExtent = d3.extent(processedData, d => d.decibel);
const decibelRange = [Math.floor(decibelExtent[0] / 5) * 5, Math.ceil(decibelExtent[1] / 5) * 5];

// Track visibility
let visibleLocations = new Set(locations);
let brushedTimeRange = null;

// Create main chart
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
let xScale = d3.scaleTime()
    .domain(timeExtent)
    .range([0, width]);

let yScale = d3.scaleLinear()
    .domain(decibelRange)
    .nice()
    .range([height, 0]);

// Line generator
const line = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.decibel))
    .curve(d3.curveMonotoneX);

// Create tooltip
const tooltip = d3.select("#tooltip");

// Grid lines
const gridLinesY = g.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(yScale.ticks(8))
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d));

// X Axis
const xAxis = g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.timeFormat("%I:%M %p")));

// Y Axis
const yAxis = g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(yScale).ticks(8));

// Axis labels
g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Decibel Level (dB)");

g.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
    .style("text-anchor", "middle")
    .text("Time");

// Draw lines
const linePaths = g.append("g")
    .attr("class", "lines");

// Draw points
const pointsGroup = g.append("g")
    .attr("class", "points");

// Function to update chart
function updateChart() {
    // Filter data based on visible locations and time range
    let filteredData = processedData;
    if (brushedTimeRange) {
        filteredData = filteredData.filter(d => 
            d.time >= brushedTimeRange[0] && d.time <= brushedTimeRange[1]
        );
    }
    
    // Update scales if time range changed
    if (brushedTimeRange) {
        xScale.domain(brushedTimeRange);
    } else {
        xScale.domain(timeExtent);
    }
    
    // Update axes
    xAxis.transition().duration(300).call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.timeFormat("%I:%M %p")));
    
    // Update lines
    const lines = linePaths.selectAll(".line-path")
        .data(locations.filter(loc => visibleLocations.has(loc)));
    
    lines.exit().remove();
    
    const linesEnter = lines.enter()
        .append("path")
        .attr("class", "line-path")
        .attr("fill", "none")
        .attr("stroke-width", 3)
        .attr("opacity", 0.8);
    
    linesEnter.merge(lines)
        .attr("stroke", d => colorScale(d))
        .attr("d", d => {
            const locationData = filteredData
                .filter(item => item.location === d)
                .sort((a, b) => a.time - b.time);
            return line(locationData);
        });
    
    // Update points
    const points = pointsGroup.selectAll(".point")
        .data(filteredData.filter(d => visibleLocations.has(d.location)), d => `${d.time.getTime()}-${d.location}`);
    
    points.exit().remove();
    
    const pointsEnter = points.enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 5)
        .attr("fill", d => colorScale(d.location))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("cursor", "pointer");
    
    pointsEnter.merge(points)
        .attr("cx", d => xScale(d.time))
        .attr("cy", d => yScale(d.decibel))
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("r", 7)
                .attr("stroke-width", 3);
            
            tooltip
                .html(`<strong>${d.location}</strong><br/>
                       Time: ${d.timeStr}<br/>
                       Decibel Level: ${d.decibel} dB`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .classed("visible", true);
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("r", 5)
                .attr("stroke-width", 2);
            
            tooltip.classed("visible", false);
        });
}

// Create legend
const legend = d3.select("#legend");

locations.forEach(location => {
    const legendItem = legend.append("div")
        .attr("class", "legend-item active")
        .datum(location)
        .on("click", function() {
            const isActive = d3.select(this).classed("active");
            if (isActive) {
                visibleLocations.delete(location);
                d3.select(this).classed("active", false).classed("hidden", true);
            } else {
                visibleLocations.add(location);
                d3.select(this).classed("active", true).classed("hidden", false);
            }
            updateChart();
        });
    
    legendItem.append("div")
        .attr("class", "legend-color")
        .style("background-color", colorScale(location));
    
    legendItem.append("span")
        .attr("class", "legend-label")
        .text(location);
});

// Brush chart setup
const brushMargin = { top: 20, right: 80, bottom: 40, left: 60 };
const brushWidth = width - brushMargin.left - brushMargin.right;
const brushHeight = 100 - brushMargin.top - brushMargin.bottom;

const brushSvg = d3.select("#brush-chart")
    .append("svg")
    .attr("width", brushWidth + brushMargin.left + brushMargin.right)
    .attr("height", brushHeight + brushMargin.top + brushMargin.bottom);

const brushG = brushSvg.append("g")
    .attr("transform", `translate(${brushMargin.left},${brushMargin.top})`);

const brushXScale = d3.scaleTime()
    .domain(timeExtent)
    .range([0, brushWidth]);

const brushYScale = d3.scaleLinear()
    .domain(decibelRange)
    .range([brushHeight, 0]);

// Draw brush chart lines
locations.forEach(location => {
    const locationData = processedData
        .filter(d => d.location === location)
        .sort((a, b) => a.time - b.time);
    
    brushG.append("path")
        .datum(locationData)
        .attr("fill", "none")
        .attr("stroke", colorScale(location))
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6)
        .attr("d", d3.line()
            .x(d => brushXScale(d.time))
            .y(d => brushYScale(d.decibel))
            .curve(d3.curveMonotoneX));
});

// Brush axes
brushG.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${brushHeight})`)
    .call(d3.axisBottom(brushXScale).ticks(6).tickFormat(d3.timeFormat("%I:%M %p")));

brushG.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(brushYScale).ticks(4));

// Create brush
const brush = d3.brushX()
    .extent([[0, 0], [brushWidth, brushHeight]])
    .on("brush end", function(event) {
        if (!event.selection) {
            brushedTimeRange = null;
        } else {
            const [x0, x1] = event.selection.map(brushXScale.invert, brushXScale);
            brushedTimeRange = [x0, x1];
        }
        updateChart();
    });

brushG.append("g")
    .attr("class", "brush")
    .call(brush);

// Initial chart render
updateChart();

// ==========================================
// BUBBLE CHART VISUALIZATION
// ==========================================

// Bubble chart dimensions
const bubbleMargin = { top: 60, right: 80, bottom: 80, left: 100 };
const bubbleWidth = 1200 - bubbleMargin.left - bubbleMargin.right;
const bubbleHeight = 500 - bubbleMargin.top - bubbleMargin.bottom;

// Create bubble chart SVG
const bubbleSvg = d3.select("#bubble-chart")
    .append("svg")
    .attr("width", bubbleWidth + bubbleMargin.left + bubbleMargin.right)
    .attr("height", bubbleHeight + bubbleMargin.top + bubbleMargin.bottom);

const bubbleG = bubbleSvg.append("g")
    .attr("transform", `translate(${bubbleMargin.left},${bubbleMargin.top})`);

// Scales for bubble chart
const bubbleXScale = d3.scaleTime()
    .domain(timeExtent)
    .range([0, bubbleWidth]);

const bubbleYScale = d3.scalePoint()
    .domain(locations)
    .range([0, bubbleHeight])
    .padding(0.5);

// Size scale for bubbles (radius based on decibel level)
const decibelMin = Math.min(...processedData.map(d => d.decibel));
const decibelMax = Math.max(...processedData.map(d => d.decibel));
const radiusScale = d3.scaleSqrt()
    .domain([decibelMin, decibelMax])
    .range([8, 40]); // Minimum and maximum bubble radius

// Create tooltip for bubbles
const bubbleTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Draw bubbles
const bubbles = bubbleG.selectAll(".bubble")
    .data(processedData)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("cx", d => bubbleXScale(d.time))
    .attr("cy", d => bubbleYScale(d.location))
    .attr("r", d => radiusScale(d.decibel))
    .attr("fill", d => colorScale(d.location))
    .attr("opacity", 0.7)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
        d3.select(this)
            .attr("opacity", 1)
            .attr("stroke-width", 3);
        
        bubbleTooltip
            .html(`<strong>${d.location}</strong><br/>
                   Time: ${d.timeStr}<br/>
                   Decibel Level: ${d.decibel} dB`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .style("opacity", 1);
    })
    .on("mouseout", function() {
        d3.select(this)
            .attr("opacity", 0.7)
            .attr("stroke-width", 2);
        
        bubbleTooltip.style("opacity", 0);
    });

// Add animation to bubbles on load
bubbles
    .attr("r", 0)
    .transition()
    .duration(800)
    .delay((d, i) => i * 30)
    .attr("r", d => radiusScale(d.decibel));

// X Axis for bubble chart
bubbleG.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${bubbleHeight})`)
    .call(d3.axisBottom(bubbleXScale).ticks(8).tickFormat(d3.timeFormat("%I:%M %p")));

// Y Axis for bubble chart
bubbleG.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(bubbleYScale));

// Axis labels for bubble chart
bubbleG.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - bubbleMargin.left)
    .attr("x", 0 - (bubbleHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Location");

bubbleG.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${bubbleWidth / 2}, ${bubbleHeight + bubbleMargin.bottom - 10})`)
    .style("text-anchor", "middle")
    .text("Time");

// Add title
bubbleG.append("text")
    .attr("class", "chart-title")
    .attr("x", bubbleWidth / 2)
    .attr("y", -20)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Bubble Size = Noise Level (dB)");

// Add grid lines for better readability
bubbleG.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(bubbleXScale.ticks(8))
    .enter()
    .append("line")
    .attr("x1", d => bubbleXScale(d))
    .attr("x2", d => bubbleXScale(d))
    .attr("y1", 0)
    .attr("y2", bubbleHeight)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-opacity", 0.5)
    .attr("stroke-width", 1);

// ==========================================
// LIBRARY SHELVES VISUALIZATION
// ==========================================

// Library shelves dimensions
const shelfMargin = { top: 60, right: 80, bottom: 100, left: 120 };
const shelfWidth = 1200 - shelfMargin.left - shelfMargin.right;
const shelfHeight = 600 - shelfMargin.top - shelfMargin.bottom;

// Shelf settings
const shelfSpacing = shelfHeight / (locations.length + 1);
const shelfThickness = 8;
const bookMinWidth = 15;
const bookMaxWidth = 25;
const bookMinHeight = 20;
const bookMaxHeight = 80;

// Create library shelves SVG
const shelfSvg = d3.select("#library-shelves")
    .append("svg")
    .attr("width", shelfWidth + shelfMargin.left + shelfMargin.right)
    .attr("height", shelfHeight + shelfMargin.top + shelfMargin.bottom);

const shelfG = shelfSvg.append("g")
    .attr("transform", `translate(${shelfMargin.left},${shelfMargin.top})`);

// Scales
const shelfXScale = d3.scaleTime()
    .domain(timeExtent)
    .range([0, shelfWidth]);

const bookHeightScale = d3.scaleLinear()
    .domain([decibelMin, decibelMax])
    .range([bookMinHeight, bookMaxHeight]);

const bookWidthScale = d3.scaleLinear()
    .domain([decibelMin, decibelMax])
    .range([bookMinWidth, bookMaxWidth]);

// Create tooltip for books
const bookTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Draw shelves and books for each location
locations.forEach((location, locationIndex) => {
    const shelfY = locationIndex * shelfSpacing + shelfSpacing;
    
    // Draw the wooden shelf
    shelfG.append("rect")
        .attr("x", 0)
        .attr("y", shelfY - shelfThickness / 2)
        .attr("width", shelfWidth)
        .attr("height", shelfThickness)
        .attr("fill", "#8B6F47")
        .attr("stroke", "#6B5235")
        .attr("stroke-width", 1)
        .attr("rx", 2);
    
    // Add shelf support brackets
    shelfG.append("rect")
        .attr("x", -10)
        .attr("y", shelfY - shelfThickness / 2)
        .attr("width", 8)
        .attr("height", shelfThickness)
        .attr("fill", "#6B5235")
        .attr("rx", 1);
    
    shelfG.append("rect")
        .attr("x", shelfWidth + 2)
        .attr("y", shelfY - shelfThickness / 2)
        .attr("width", 8)
        .attr("height", shelfThickness)
        .attr("fill", "#6B5235")
        .attr("rx", 1);
    
    // Get data for this location, sorted by time
    const locationData = processedData
        .filter(d => d.location === location)
        .sort((a, b) => a.time - b.time);
    
    // Draw books for this shelf
    const bookGroup = shelfG.append("g")
        .attr("class", `shelf-${locationIndex}`);
    
    locationData.forEach((d, i) => {
        const bookX = shelfXScale(d.time);
        const bookHeight = bookHeightScale(d.decibel);
        const bookWidth = bookWidthScale(d.decibel);
        const bookY = shelfY - bookHeight;
        
        // Create book group
        const book = bookGroup.append("g")
            .attr("class", "book")
            .attr("transform", `translate(${bookX},${bookY})`)
            .style("cursor", "pointer");
        
        // Book spine (main rectangle)
        const spineColor = colorScale(location);
        const spine = book.append("rect")
            .attr("class", "book-spine")
            .attr("width", bookWidth)
            .attr("height", bookHeight)
            .attr("fill", spineColor)
            .attr("stroke", d3.rgb(spineColor).darker(0.3))
            .attr("stroke-width", 1)
            .attr("rx", 2);
        
        // Book spine highlight (for 3D effect)
        book.append("rect")
            .attr("class", "book-highlight")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", bookWidth * 0.15)
            .attr("height", bookHeight)
            .attr("fill", d3.rgb(spineColor).brighter(0.3))
            .attr("opacity", 0.6)
            .attr("rx", 2);
        
        // Book pages (top edge)
        book.append("rect")
            .attr("class", "book-pages")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", bookWidth)
            .attr("height", 2)
            .attr("fill", "#f5f5f5")
            .attr("stroke", "#ddd")
            .attr("stroke-width", 0.5);
        
        // Decibel label on spine (only for larger books)
        if (bookHeight > 35) {
            book.append("text")
                .attr("class", "book-label")
                .attr("x", bookWidth / 2)
                .attr("y", bookHeight / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "white")
                .attr("font-size", Math.min(bookWidth * 0.8, 12))
                .attr("font-weight", "bold")
                .text(Math.round(d.decibel));
        }
        
        // Hover interactions
        book.on("mouseover", function(event) {
            spine
                .attr("stroke-width", 2)
                .attr("filter", "brightness(1.2)");
            
            bookTooltip
                .html(`<strong>${d.location}</strong><br/>
                       Time: ${d.timeStr}<br/>
                       Decibel Level: ${d.decibel} dB<br/>
                       <em>Book height = noise level</em>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .style("opacity", 1);
        })
        .on("mouseout", function() {
            spine
                .attr("stroke-width", 1)
                .attr("filter", null);
            
            bookTooltip.style("opacity", 0);
        });
    });
    
    // Add location label on the left
    shelfG.append("text")
        .attr("x", -10)
        .attr("y", shelfY + 5)
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#333")
        .text(location);
});

// Add time axis at the bottom
const shelfXAxis = shelfG.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${shelfHeight})`)
    .call(d3.axisBottom(shelfXScale).ticks(8).tickFormat(d3.timeFormat("%I:%M %p")));

// Add axis label
shelfG.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${shelfWidth / 2}, ${shelfHeight + shelfMargin.bottom - 20})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#666")
    .text("Time (books arranged left to right)");

// Add decorative elements - library ambiance
// Add wall texture background
shelfG.insert("rect", ":first-child")
    .attr("x", -20)
    .attr("y", -20)
    .attr("width", shelfWidth + 40)
    .attr("height", shelfHeight + 40)
    .attr("fill", "#faf8f5")
    .attr("opacity", 0.3);

// Add title
shelfG.append("text")
    .attr("class", "chart-title")
    .attr("x", shelfWidth / 2)
    .attr("y", -30)
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("📚 Library Shelves: Each Book's Height Represents Noise Level 📚");

// ==========================================
// WAVEFORM VISUALIZATION - Time Passing
// ==========================================

// Waveform dimensions
const waveMargin = { top: 80, right: 80, bottom: 100, left: 100 };
const waveWidth = 1200 - waveMargin.left - waveMargin.right;
const waveHeight = 400 - waveMargin.top - waveMargin.bottom;

// Create waveform SVG
const waveSvg = d3.select("#waveform-chart")
    .append("svg")
    .attr("width", waveWidth + waveMargin.left + waveMargin.right)
    .attr("height", waveHeight + waveMargin.top + waveMargin.bottom);

const waveG = waveSvg.append("g")
    .attr("transform", `translate(${waveMargin.left},${waveMargin.top})`);

// Scales
const waveXScale = d3.scaleTime()
    .domain(timeExtent)
    .range([0, waveWidth]);

// Wave amplitude scale - maps decibel to vertical position
// Center line represents baseline, wave goes up (positive) for higher noise
const baselineDecibel = (decibelRange[0] + decibelRange[1]) / 2;
const maxAmplitude = (decibelRange[1] - decibelRange[0]) / 2;

// Center line (zero line)
const centerY = waveHeight / 2;
waveG.append("line")
    .attr("class", "center-line")
    .attr("x1", 0)
    .attr("x2", waveWidth)
    .attr("y1", centerY)
    .attr("y2", centerY)
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0.5);

// Animation state
let isPlaying = false;
let currentTime = timeExtent[0];
let animationId = null;
const animationSpeed = 50; // milliseconds per frame

// Get sorted data by time
const sortedData = [...processedData].sort((a, b) => a.time - b.time);

// Create interpolated data for smooth waves
function createWaveformData(location) {
    const locationData = sortedData.filter(d => d.location === location);
    if (locationData.length === 0) return [];
    
    // Create dense interpolated points for smooth waveform
    const interpolated = [];
    const basePoints = 500; // Number of points for smooth curve
    
    for (let i = 0; i <= basePoints; i++) {
        const t = i / basePoints;
        const targetTime = new Date(
            timeExtent[0].getTime() + 
            t * (timeExtent[1].getTime() - timeExtent[0].getTime())
        );
        
        // Find closest data points
        let closest = locationData[0];
        let minDiff = Math.abs(targetTime - locationData[0].time);
        
        for (let j = 1; j < locationData.length; j++) {
            const diff = Math.abs(targetTime - locationData[j].time);
            if (diff < minDiff) {
                minDiff = diff;
                closest = locationData[j];
            }
        }
        
        // Interpolate between points if needed
        const timeDiff = targetTime - closest.time;
        let value = closest.decibel;
        
        if (timeDiff !== 0 && locationData.length > 1) {
            const idx = locationData.findIndex(d => d === closest);
            if (idx > 0 && idx < locationData.length - 1) {
                const prev = locationData[idx - 1];
                const next = locationData[idx + 1];
                const timeRange = Math.abs(next.time - prev.time);
                if (timeRange > 0) {
                    const t2 = Math.abs(targetTime - prev.time) / timeRange;
                    value = prev.decibel + (next.decibel - prev.decibel) * t2;
                }
            }
        }
        
        interpolated.push({
            time: targetTime,
            decibel: value,
            location: location
        });
    }
    
    return interpolated;
}

// Create waveform paths for each location
const waveformPaths = {};
const waveformGroups = {};

locations.forEach(location => {
    const group = waveG.append("g")
        .attr("class", `waveform-${location.replace(/\s+/g, '-').toLowerCase()}`);
    
    waveformGroups[location] = group;
    
    const waveformData = createWaveformData(location);
    
    // Create area path (goes above and below center line)
    // Higher decibel = wave goes up, lower decibel = wave goes down
    const areaGenerator = d3.area()
        .x(d => waveXScale(d.time))
        .y0(centerY)
        .y1(d => {
            // Calculate deviation from baseline as amplitude
            const deviation = d.decibel - baselineDecibel;
            // Scale amplitude to use half the chart height
            const amplitude = (deviation / maxAmplitude) * (waveHeight / 2);
            return centerY - amplitude;
        })
        .curve(d3.curveMonotoneX);
    
    // Create line path
    const lineGenerator = d3.line()
        .x(d => waveXScale(d.time))
        .y(d => {
            const deviation = d.decibel - baselineDecibel;
            const amplitude = (deviation / maxAmplitude) * (waveHeight / 2);
            return centerY - amplitude;
        })
        .curve(d3.curveMonotoneX);
    
    // Draw area
    const areaPath = group.append("path")
        .datum(waveformData)
        .attr("class", "waveform-area")
        .attr("fill", colorScale(location))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGenerator);
    
    // Draw line
    const linePath = group.append("path")
        .datum(waveformData)
        .attr("class", "waveform-line")
        .attr("fill", "none")
        .attr("stroke", colorScale(location))
        .attr("stroke-width", 3)
        .attr("d", lineGenerator);
    
    waveformPaths[location] = { area: areaPath, line: linePath, data: waveformData };
});

// Time indicator line
const timeIndicator = waveG.append("line")
    .attr("class", "time-indicator")
    .attr("x1", waveXScale(currentTime))
    .attr("x2", waveXScale(currentTime))
    .attr("y1", 0)
    .attr("y2", waveHeight)
    .attr("stroke", "#ff4444")
    .attr("stroke-width", 3)
    .attr("opacity", 0.8)
    .attr("pointer-events", "none");

// Add time indicator circle
const timeCircle = waveG.append("circle")
    .attr("class", "time-indicator-circle")
    .attr("cx", waveXScale(currentTime))
    .attr("cy", centerY)
    .attr("r", 8)
    .attr("fill", "#ff4444")
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .attr("pointer-events", "none");

// Animation function
function animateWaveform() {
    if (!isPlaying) return;
    
    // Move time forward
    const timeStep = (timeExtent[1].getTime() - timeExtent[0].getTime()) / 1000;
    currentTime = new Date(currentTime.getTime() + timeStep);
    
    // Check if we've reached the end
    if (currentTime > timeExtent[1]) {
        currentTime = timeExtent[0];
    }
    
    // Update time indicator
    const xPos = waveXScale(currentTime);
    timeIndicator
        .attr("x1", xPos)
        .attr("x2", xPos);
    
    timeCircle
        .attr("cx", xPos);
    
    // Update waveform visibility (show only data up to current time)
    locations.forEach(location => {
        const filteredData = waveformPaths[location].data.filter(d => d.time <= currentTime);
        
        if (filteredData.length > 0) {
            const areaGen = d3.area()
                .x(d => waveXScale(d.time))
                .y0(centerY)
                .y1(d => {
                    const deviation = d.decibel - baselineDecibel;
                    const amplitude = (deviation / maxAmplitude) * (waveHeight / 2);
                    return centerY - amplitude;
                })
                .curve(d3.curveMonotoneX);
            
            const lineGen = d3.line()
                .x(d => waveXScale(d.time))
                .y(d => {
                    const deviation = d.decibel - baselineDecibel;
                    const amplitude = (deviation / maxAmplitude) * (waveHeight / 2);
                    return centerY - amplitude;
                })
                .curve(d3.curveMonotoneX);
            
            waveformPaths[location].area.attr("d", areaGen);
            waveformPaths[location].line.attr("d", lineGen);
        } else {
            waveformPaths[location].area.attr("d", null);
            waveformPaths[location].line.attr("d", null);
        }
    });
    
    // Update time display
    const timeDisplay = d3.select("#timeDisplay");
    timeDisplay.text("Time: " + d3.timeFormat("%I:%M:%S %p")(currentTime));
    
    animationId = setTimeout(animateWaveform, animationSpeed);
}

// Play/Pause button
const playPauseBtn = d3.select("#playPauseBtn");
playPauseBtn.on("click", function() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        d3.select(this).text("⏸ Pause");
        animateWaveform();
    } else {
        d3.select(this).text("▶ Play");
        if (animationId) {
            clearTimeout(animationId);
        }
    }
});

// Reset button
d3.select("#resetBtn").on("click", function() {
    isPlaying = false;
    playPauseBtn.text("▶ Play");
    if (animationId) {
        clearTimeout(animationId);
    }
    currentTime = timeExtent[0];
    
    // Reset time indicator
    timeIndicator
        .attr("x1", waveXScale(currentTime))
        .attr("x2", waveXScale(currentTime));
    
    timeCircle
        .attr("cx", waveXScale(currentTime));
    
    // Reset waveforms
    locations.forEach(location => {
        waveformPaths[location].area.attr("d", null);
        waveformPaths[location].line.attr("d", null);
    });
    
    d3.select("#timeDisplay").text("Time: " + d3.timeFormat("%I:%M:%S %p")(currentTime));
});

// X Axis
waveG.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${waveHeight})`)
    .call(d3.axisBottom(waveXScale).ticks(8).tickFormat(d3.timeFormat("%I:%M %p")));

// Y Axis (decibel scale) - create a scale for the axis
const waveYAxisScale = d3.scaleLinear()
    .domain([decibelRange[0], decibelRange[1]])
    .range([waveHeight, 0]);

waveG.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(waveYAxisScale).ticks(6));

// Axis labels
waveG.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - waveMargin.left)
    .attr("x", 0 - (waveHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Noise Level (dB) - Wave Amplitude");

waveG.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${waveWidth / 2}, ${waveHeight + waveMargin.bottom - 10})`)
    .style("text-anchor", "middle")
    .text("Time");

// Add title
waveG.append("text")
    .attr("class", "chart-title")
    .attr("x", waveWidth / 2)
    .attr("y", -40)
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("🔊 Sound Wave: Watch Noise Levels Fluctuate Over Time 🔊");

// Initialize time display
d3.select("#timeDisplay").text("Time: " + d3.timeFormat("%I:%M:%S %p")(currentTime));

