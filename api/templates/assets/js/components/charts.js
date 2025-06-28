// Charts Component for Admin Panel
// Simple chart implementation without external dependencies

class ChartComponent {
    constructor() {
        this.charts = new Map();
    }

    // Create a bar chart
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            type: 'bar',
            data: data,
            width: options.width || 400,
            height: options.height || 300,
            colors: options.colors || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
            showValues: options.showValues !== false,
            title: options.title || '',
            ...options
        };

        const chart = this.renderBarChart(container, config);
        this.charts.set(containerId, chart);
        return chart;
    }

    // Create a line chart
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            type: 'line',
            data: data,
            width: options.width || 400,
            height: options.height || 300,
            colors: options.colors || ['#3B82F6', '#10B981', '#F59E0B'],
            showPoints: options.showPoints !== false,
            title: options.title || '',
            ...options
        };

        const chart = this.renderLineChart(container, config);
        this.charts.set(containerId, chart);
        return chart;
    }

    // Create a doughnut chart
    createDoughnutChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            type: 'doughnut',
            data: data,
            width: options.width || 300,
            height: options.height || 300,
            colors: options.colors || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            title: options.title || '',
            ...options
        };

        const chart = this.renderDoughnutChart(container, config);
        this.charts.set(containerId, chart);
        return chart;
    }

    // Render bar chart
    renderBarChart(container, config) {
        const { data, width, height, colors, showValues, title } = config;
        const labels = data.labels || [];
        const datasets = data.datasets || [];

        if (datasets.length === 0) return null;

        const svg = this.createSVG(width, height);
        const chartArea = { x: 60, y: title ? 40 : 20, width: width - 100, height: height - 80 };

        // Add title
        if (title) {
            const titleElement = this.createSVGElement('text', {
                x: width / 2,
                y: 20,
                'text-anchor': 'middle',
                'font-size': '16',
                'font-weight': 'bold',
                fill: '#374151'
            });
            titleElement.textContent = title;
            svg.appendChild(titleElement);
        }

        // Calculate max value
        const maxValue = Math.max(...datasets.flatMap(d => d.data));
        const yScale = chartArea.height / maxValue;

        // Draw bars
        const barWidth = chartArea.width / (labels.length * datasets.length + labels.length);
        const groupWidth = barWidth * datasets.length;

        labels.forEach((label, labelIndex) => {
            datasets.forEach((dataset, datasetIndex) => {
                const value = dataset.data[labelIndex] || 0;
                const barHeight = value * yScale;
                const x = chartArea.x + labelIndex * (groupWidth + barWidth) + datasetIndex * barWidth;
                const y = chartArea.y + chartArea.height - barHeight;

                // Draw bar
                const rect = this.createSVGElement('rect', {
                    x: x,
                    y: y,
                    width: barWidth - 2,
                    height: barHeight,
                    fill: colors[datasetIndex % colors.length],
                    'fill-opacity': '0.8',
                    class: 'chart-bar'
                });

                // Add hover effect
                rect.addEventListener('mouseenter', () => {
                    rect.setAttribute('fill-opacity', '1');
                    this.showTooltip(x + barWidth/2, y, `${label}: ${value}`);
                });

                rect.addEventListener('mouseleave', () => {
                    rect.setAttribute('fill-opacity', '0.8');
                    this.hideTooltip();
                });

                svg.appendChild(rect);

                // Show values on bars
                if (showValues) {
                    const text = this.createSVGElement('text', {
                        x: x + barWidth / 2,
                        y: y - 5,
                        'text-anchor': 'middle',
                        'font-size': '12',
                        fill: '#6B7280'
                    });
                    text.textContent = value;
                    svg.appendChild(text);
                }
            });

            // Draw label
            const labelText = this.createSVGElement('text', {
                x: chartArea.x + labelIndex * (groupWidth + barWidth) + groupWidth / 2,
                y: chartArea.y + chartArea.height + 20,
                'text-anchor': 'middle',
                'font-size': '12',
                fill: '#6B7280'
            });
            labelText.textContent = label;
            svg.appendChild(labelText);
        });

        // Draw Y axis
        this.drawYAxis(svg, chartArea, maxValue);

        container.innerHTML = '';
        container.appendChild(svg);

        return { svg, update: (newData) => this.updateBarChart(container, newData, config) };
    }

    // Render line chart
    renderLineChart(container, config) {
        const { data, width, height, colors, showPoints, title } = config;
        const labels = data.labels || [];
        const datasets = data.datasets || [];

        if (datasets.length === 0) return null;

        const svg = this.createSVG(width, height);
        const chartArea = { x: 60, y: title ? 40 : 20, width: width - 100, height: height - 80 };

        // Add title
        if (title) {
            const titleElement = this.createSVGElement('text', {
                x: width / 2,
                y: 20,
                'text-anchor': 'middle',
                'font-size': '16',
                'font-weight': 'bold',
                fill: '#374151'
            });
            titleElement.textContent = title;
            svg.appendChild(titleElement);
        }

        // Calculate scales
        const maxValue = Math.max(...datasets.flatMap(d => d.data));
        const xStep = chartArea.width / (labels.length - 1);
        const yScale = chartArea.height / maxValue;

        // Draw lines and points
        datasets.forEach((dataset, datasetIndex) => {
            const color = colors[datasetIndex % colors.length];
            const points = dataset.data.map((value, index) => ({
                x: chartArea.x + index * xStep,
                y: chartArea.y + chartArea.height - (value * yScale)
            }));

            // Draw line
            const pathData = points.map((point, index) => 
                `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            ).join(' ');

            const path = this.createSVGElement('path', {
                d: pathData,
                stroke: color,
                'stroke-width': '2',
                fill: 'none',
                class: 'chart-line'
            });
            svg.appendChild(path);

            // Draw points
            if (showPoints) {
                points.forEach((point, index) => {
                    const circle = this.createSVGElement('circle', {
                        cx: point.x,
                        cy: point.y,
                        r: '4',
                        fill: color,
                        class: 'chart-point'
                    });

                    // Add hover effect
                    circle.addEventListener('mouseenter', () => {
                        circle.setAttribute('r', '6');
                        this.showTooltip(point.x, point.y, `${labels[index]}: ${dataset.data[index]}`);
                    });

                    circle.addEventListener('mouseleave', () => {
                        circle.setAttribute('r', '4');
                        this.hideTooltip();
                    });

                    svg.appendChild(circle);
                });
            }
        });

        // Draw labels
        labels.forEach((label, index) => {
            const x = chartArea.x + index * xStep;
            const labelText = this.createSVGElement('text', {
                x: x,
                y: chartArea.y + chartArea.height + 20,
                'text-anchor': 'middle',
                'font-size': '12',
                fill: '#6B7280'
            });
            labelText.textContent = label;
            svg.appendChild(labelText);
        });

        // Draw Y axis
        this.drawYAxis(svg, chartArea, maxValue);

        container.innerHTML = '';
        container.appendChild(svg);

        return { svg, update: (newData) => this.updateLineChart(container, newData, config) };
    }

    // Render doughnut chart
    renderDoughnutChart(container, config) {
        const { data, width, height, colors, title } = config;
        const labels = data.labels || [];
        const values = data.datasets?.[0]?.data || [];

        if (values.length === 0) return null;

        const svg = this.createSVG(width, height);
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 40;
        const innerRadius = radius * 0.6;

        // Add title
        if (title) {
            const titleElement = this.createSVGElement('text', {
                x: centerX,
                y: 20,
                'text-anchor': 'middle',
                'font-size': '16',
                'font-weight': 'bold',
                fill: '#374151'
            });
            titleElement.textContent = title;
            svg.appendChild(titleElement);
        }

        // Calculate total and angles
        const total = values.reduce((sum, value) => sum + value, 0);
        let currentAngle = -Math.PI / 2; // Start at top

        values.forEach((value, index) => {
            const percentage = value / total;
            const angle = percentage * 2 * Math.PI;
            const endAngle = currentAngle + angle;

            // Create arc path
            const largeArcFlag = angle > Math.PI ? 1 : 0;
            const outerStart = this.polarToCartesian(centerX, centerY, radius, currentAngle);
            const outerEnd = this.polarToCartesian(centerX, centerY, radius, endAngle);
            const innerStart = this.polarToCartesian(centerX, centerY, innerRadius, currentAngle);
            const innerEnd = this.polarToCartesian(centerX, centerY, innerRadius, endAngle);

            const pathData = [
                'M', outerStart.x, outerStart.y,
                'A', radius, radius, 0, largeArcFlag, 1, outerEnd.x, outerEnd.y,
                'L', innerEnd.x, innerEnd.y,
                'A', innerRadius, innerRadius, 0, largeArcFlag, 0, innerStart.x, innerStart.y,
                'Z'
            ].join(' ');

            const path = this.createSVGElement('path', {
                d: pathData,
                fill: colors[index % colors.length],
                'fill-opacity': '0.8',
                class: 'chart-segment'
            });

            // Add hover effect
            path.addEventListener('mouseenter', () => {
                path.setAttribute('fill-opacity', '1');
                const midAngle = currentAngle + angle / 2;
                const tooltipPos = this.polarToCartesian(centerX, centerY, radius + 20, midAngle);
                this.showTooltip(tooltipPos.x, tooltipPos.y, `${labels[index]}: ${value} (${(percentage * 100).toFixed(1)}%)`);
            });

            path.addEventListener('mouseleave', () => {
                path.setAttribute('fill-opacity', '0.8');
                this.hideTooltip();
            });

            svg.appendChild(path);
            currentAngle = endAngle;
        });

        // Add legend
        this.addLegend(svg, labels, colors, width, height);

        container.innerHTML = '';
        container.appendChild(svg);

        return { svg, update: (newData) => this.updateDoughnutChart(container, newData, config) };
    }

    // Helper methods
    createSVG(width, height) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.backgroundColor = 'transparent';
        return svg;
    }

    createSVGElement(tag, attributes) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    drawYAxis(svg, chartArea, maxValue) {
        const steps = 5;
        const stepValue = maxValue / steps;

        for (let i = 0; i <= steps; i++) {
            const y = chartArea.y + chartArea.height - (i * chartArea.height / steps);
            const value = Math.round(i * stepValue);

            // Grid line
            const line = this.createSVGElement('line', {
                x1: chartArea.x,
                y1: y,
                x2: chartArea.x + chartArea.width,
                y2: y,
                stroke: '#E5E7EB',
                'stroke-width': '1'
            });
            svg.appendChild(line);

            // Y label
            const text = this.createSVGElement('text', {
                x: chartArea.x - 10,
                y: y + 5,
                'text-anchor': 'end',
                'font-size': '12',
                fill: '#6B7280'
            });
            text.textContent = value;
            svg.appendChild(text);
        }
    }

    polarToCartesian(centerX, centerY, radius, angleInRadians) {
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    addLegend(svg, labels, colors, width, height) {
        const legendX = 20;
        const legendY = height - (labels.length * 20 + 20);

        labels.forEach((label, index) => {
            const y = legendY + index * 20;

            // Color box
            const rect = this.createSVGElement('rect', {
                x: legendX,
                y: y,
                width: 12,
                height: 12,
                fill: colors[index % colors.length]
            });
            svg.appendChild(rect);

            // Label text
            const text = this.createSVGElement('text', {
                x: legendX + 20,
                y: y + 9,
                'font-size': '12',
                fill: '#374151'
            });
            text.textContent = label;
            svg.appendChild(text);
        });
    }

    showTooltip(x, y, text) {
        this.hideTooltip(); // Remove existing tooltip

        const tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.className = 'absolute bg-gray-800 text-white px-2 py-1 rounded text-sm pointer-events-none z-50';
        tooltip.textContent = text;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - 30}px`;
        tooltip.style.transform = 'translateX(-50%)';

        document.body.appendChild(tooltip);
    }

    hideTooltip() {
        const existing = document.getElementById('chart-tooltip');
        if (existing) {
            existing.remove();
        }
    }

    // Update methods
    updateBarChart(container, newData, config) {
        this.renderBarChart(container, { ...config, data: newData });
    }

    updateLineChart(container, newData, config) {
        this.renderLineChart(container, { ...config, data: newData });
    }

    updateDoughnutChart(container, newData, config) {
        this.renderDoughnutChart(container, { ...config, data: newData });
    }

    // Destroy chart
    destroy(containerId) {
        const chart = this.charts.get(containerId);
        if (chart) {
            this.charts.delete(containerId);
        }
        this.hideTooltip();
    }

    // Destroy all charts
    destroyAll() {
        this.charts.clear();
        this.hideTooltip();
    }
}

// Export to global scope
window.ChartComponent = ChartComponent;
window.chartComponent = new ChartComponent();