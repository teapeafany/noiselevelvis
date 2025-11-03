# Library Noise Levels Visualization

Interactive D3.js visualizations showing noise levels (decibel measurements) across different library spaces over time.

## Features

1. **Line Chart** - Multi-line chart showing noise levels over time for each location
2. **Bubble Chart** - Circle size represents noise level, positioned by time and location
3. **Library Shelves** - Creative visualization where books on shelves represent noise data (book height = noise level)
4. **Sound Wave** - Animated waveform visualization showing noise levels fluctuating over time like audio waves

## How to View

### Option 1: GitHub Pages (Recommended)
1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"
6. Your site will be available at: `https://teapeafany.github.io/noiselevelvis/`

### Option 2: Local Viewing
Simply open `index.html` in your web browser. All dependencies (D3.js) are loaded from CDN.

## Data

The visualization uses noise level data from three locations:
- Blue Donkey
- Kaldis  
- PG3

Each data point includes a timestamp and decibel measurement.

## Technologies Used

- D3.js v7
- HTML5
- CSS3
- JavaScript (ES6+)

## Interactive Features

- Click legend items to show/hide locations
- Hover over data points for detailed information
- Use the brush chart to zoom into specific time ranges
- Play/pause the animated waveform visualization
- Reset animation to start from beginning

