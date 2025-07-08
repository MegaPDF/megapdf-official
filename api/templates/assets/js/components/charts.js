// Professional Charts Component using Chart.js
class ChartComponent {
    constructor() {
        this.charts = new Map();
        this.loadChartJS();
    }

    async loadChartJS() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
            script.onload = () => {
                console.log('Chart.js loaded successfully');
            };
            document.head.appendChild(script);
        }
    }

    // Create a bar chart
    createBarChart(containerId, data, options = {}) {
        return this.createChart(containerId, 'bar', data, options);
    }

    // Create a line chart
    createLineChart(containerId, data, options = {}) {
        return this.createChart(containerId, 'line', data, options);
    }

    // Create a doughnut chart
    createDoughnutChart(containerId, data, options = {}) {
        return this.createChart(containerId, 'doughnut', data, options);
    }

    // Create a pie chart
    createPieChart(containerId, data, options = {}) {
        return this.createChart(containerId, 'pie', data, options);
    }

    // Generic chart creation method
    createChart(containerId, type, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Chart container ${containerId} not found`);
            return null;
        }

        // Validate data
        if (!data || !data.labels || !data.datasets) {
            container.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">No data available</div>';
            return null;
        }

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            container.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Loading charts...</div>';
            // Retry after a short delay
            setTimeout(() => this.createChart(containerId, type, data, options), 500);
            return null;
        }

        // Destroy existing chart if it exists
        this.destroyChart(containerId);

        // Clear container and create canvas
        container.innerHTML = '<canvas></canvas>';
        const canvas = container.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        // Default configuration
        const defaultConfig = {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        };

        // Merge custom options
        const config = this.mergeConfig(defaultConfig, options, type);

        try {
            const chart = new Chart(ctx, config);
            this.charts.set(containerId, chart);
            return chart;
        } catch (error) {
            console.error('Error creating chart:', error);
            container.innerHTML = '<div class="flex items-center justify-center h-64 text-red-500">Chart error</div>';
            return null;
        }
    }

    // Merge configuration based on chart type
    mergeConfig(defaultConfig, customOptions, type) {
        const config = JSON.parse(JSON.stringify(defaultConfig)); // Deep clone

        // Type-specific configurations
        switch (type) {
            case 'bar':
                config.options.scales = {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return this.formatValue(value);
                            }.bind(this)
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                };
                break;

            case 'line':
                config.options.scales = {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                };
                config.options.elements = {
                    line: {
                        tension: 0.4
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                };
                break;

            case 'doughnut':
            case 'pie':
                config.options.cutout = type === 'doughnut' ? '60%' : 0;
                config.options.plugins.legend.position = 'right';
                break;
        }

        // Merge custom options
        return this.deepMerge(config, customOptions);
    }

    // Deep merge utility
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // Update existing chart
    updateChart(containerId, newData) {
        const chart = this.charts.get(containerId);
        if (chart) {
            chart.data = newData;
            chart.update('active');
        }
    }

    // Update specific chart types
    updateBarChart(container, newData, config) {
        const containerId = typeof container === 'string' ? container : container.id;
        if (this.charts.has(containerId)) {
            this.updateChart(containerId, newData);
        } else {
            this.createBarChart(containerId, newData, config);
        }
    }

    updateLineChart(container, newData, config) {
        const containerId = typeof container === 'string' ? container : container.id;
        if (this.charts.has(containerId)) {
            this.updateChart(containerId, newData);
        } else {
            this.createLineChart(containerId, newData, config);
        }
    }

    updateDoughnutChart(container, newData, config) {
        const containerId = typeof container === 'string' ? container : container.id;
        if (this.charts.has(containerId)) {
            this.updateChart(containerId, newData);
        } else {
            this.createDoughnutChart(containerId, newData, config);
        }
    }

    // Render methods (for backward compatibility)
    renderBarChart(container, config) {
        const containerId = typeof container === 'string' ? container : container.id;
        return this.createBarChart(containerId, config.data, config);
    }

    renderLineChart(container, config) {
        const containerId = typeof container === 'string' ? container : container.id;
        return this.createLineChart(containerId, config.data, config);
    }

    renderDoughnutChart(container, config) {
        const containerId = typeof container === 'string' ? container : container.id;
        return this.createDoughnutChart(containerId, config.data, config);
    }

    // Utility methods
    formatValue(value) {
        if (typeof value !== 'number') return '0';
        
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        } else if (value % 1 === 0) {
            return value.toString();
        } else {
            return value.toFixed(2);
        }
    }

    // Generate color palette
    generateColors(count) {
        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ];
        
        if (count <= colors.length) {
            return colors.slice(0, count);
        }
        
        // Generate additional colors if needed
        const additionalColors = [];
        for (let i = colors.length; i < count; i++) {
            const hue = (i * 137.5) % 360; // Golden angle for good color distribution
            additionalColors.push(`hsl(${hue}, 70%, 60%)`);
        }
        
        return [...colors, ...additionalColors];
    }

    // Destroy specific chart
    destroyChart(containerId) {
        const chart = this.charts.get(containerId);
        if (chart) {
            chart.destroy();
            this.charts.delete(containerId);
        }
    }

    // Destroy all charts
    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

// Export to global scope
window.ChartComponent = ChartComponent;
window.chartComponent = new ChartComponent();