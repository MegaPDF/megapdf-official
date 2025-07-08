// Analytics Component for Admin Panel
class AnalyticsComponent {
    constructor() {
        this.analyticsData = null;
        this.charts = {};
        this.currentDateRange = '7d';
    }

    async render() {
        try {
            this.analyticsData = await window.adminAPI.getDashboard();
            return this.createAnalyticsHTML();
        } catch (error) {
            console.error('Failed to load analytics:', error);
            return this.createErrorHTML();
        }
    }

    createAnalyticsHTML() {
        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
                        <p class="text-gray-600">Detailed insights and performance metrics</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <select id="date-range-selector" onchange="window.analyticsComponent.changeTimeRange(this.value)" 
                                class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <button onclick="window.analyticsComponent.exportData()" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>
                            Export Data
                        </button>
                    </div>
                </div>

                <!-- Key Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.createMetricsCards()}
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Usage Trends -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-semibold text-gray-900">Usage Trends</h3>
                            <div class="flex space-x-2">
                                <button onclick="window.analyticsComponent.switchChartView('operations')" 
                                        class="chart-view-btn active" data-view="operations">Operations</button>
                                <button onclick="window.analyticsComponent.switchChartView('users')" 
                                        class="chart-view-btn" data-view="users">Users</button>
                            </div>
                        </div>
                        <div id="usage-trends-chart" class="chart-container h-64"></div>
                    </div>
                    
                    <!-- Operation Types Distribution -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Operation Distribution</h3>
                        <div id="operations-distribution-chart" class="chart-container h-64"></div>
                    </div>
                </div>

                <!-- Revenue Analytics -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Revenue Analytics</h3>
                        <div id="revenue-chart" class="chart-container h-64"></div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Top Revenue Sources</h3>
                        <div class="space-y-4">
                            ${this.createRevenueSourcesList()}
                        </div>
                    </div>
                </div>

                <!-- User Behavior Analytics -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">User Activity Patterns</h3>
                        <div id="user-activity-chart" class="chart-container h-64"></div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Peak Usage Hours</h3>
                        <div id="peak-hours-chart" class="chart-container h-64"></div>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                        <button onclick="window.analyticsComponent.refreshMetrics()" 
                                class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            <i class="fas fa-sync mr-1"></i>
                            Refresh
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${this.createPerformanceMetrics()}
                    </div>
                </div>
            </div>
        `;
    }

    createMetricsCards() {
        const stats = this.analyticsData?.stats || {};
        const metrics = [
            {
                title: 'Total Operations',
                value: window.utils.formatNumber(stats.totalOperations || 0),
                change: '+12.5%',
                changeType: 'positive',
                icon: 'fas fa-file-pdf',
                color: 'blue'
            },
            {
                title: 'Active Users',
                value: window.utils.formatNumber(stats.activeUsers || 0),
                change: '+8.2%',
                changeType: 'positive',
                icon: 'fas fa-users',
                color: 'green'
            },
            {
                title: 'Revenue',
                value: window.utils.formatCurrency(stats.totalRevenue || 0),
                change: '+15.3%',
                changeType: 'positive',
                icon: 'fas fa-dollar-sign',
                color: 'purple'
            },
            {
                title: 'Conversion Rate',
                value: '3.2%',
                change: '-0.5%',
                changeType: 'negative',
                icon: 'fas fa-percentage',
                color: 'orange'
            }
        ];

        return metrics.map(metric => `
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-12 w-12 rounded-md bg-${metric.color}-500 text-white">
                            <i class="${metric.icon}"></i>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-500">${metric.title}</div>
                        <div class="text-2xl font-bold text-gray-900">${metric.value}</div>
                        <div class="flex items-center mt-1">
                            <span class="text-sm ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}">
                                <i class="fas fa-arrow-${metric.changeType === 'positive' ? 'up' : 'down'} mr-1"></i>
                                ${metric.change}
                            </span>
                            <span class="text-sm text-gray-500 ml-2">vs last period</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    createRevenueSourcesList() {
        const sources = [
            { name: 'PDF Compression', revenue: 2450, percentage: 35 },
            { name: 'PDF Merge', revenue: 1890, percentage: 27 },
            { name: 'PDF Split', revenue: 1230, percentage: 18 },
            { name: 'PDF Protection', revenue: 890, percentage: 13 },
            { name: 'Other Operations', revenue: 490, percentage: 7 }
        ];

        return sources.map(source => `
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium text-gray-900">${source.name}</span>
                        <span class="text-sm text-gray-600">${window.utils.formatCurrency(source.revenue)}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                             style="width: ${source.percentage}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    createPerformanceMetrics() {
        const metrics = [
            {
                title: 'Average Response Time',
                value: '125ms',
                status: 'good',
                description: 'API response time'
            },
            {
                title: 'Success Rate',
                value: '99.8%',
                status: 'excellent',
                description: 'Operation success rate'
            },
            {
                title: 'Error Rate',
                value: '0.2%',
                status: 'good',
                description: 'System error rate'
            }
        ];

        const statusColors = {
            excellent: 'green',
            good: 'blue',
            warning: 'yellow',
            poor: 'red'
        };

        return metrics.map(metric => `
            <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-${statusColors[metric.status]}-100 mb-3">
                    <span class="text-2xl font-bold text-${statusColors[metric.status]}-600">${metric.value}</span>
                </div>
                <h4 class="text-lg font-medium text-gray-900">${metric.title}</h4>
                <p class="text-sm text-gray-600">${metric.description}</p>
            </div>
        `).join('');
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Analytics</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the analytics data.</p>
                    <button onclick="window.adminApp.loadPage('analytics')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    async postRender() {
        // Make component available to onclick handlers
        window.analyticsComponent = this;
        
        // Initialize charts
        this.initializeCharts();
        
        // Setup chart view buttons
        this.setupChartViewButtons();
    }

    initializeCharts() {
        // Usage trends chart
        this.renderUsageTrendsChart();
        
        // Operations distribution chart
        this.renderOperationsDistributionChart();
        
        // Revenue chart
        this.renderRevenueChart();
        
        // User activity chart
        this.renderUserActivityChart();
        
        // Peak hours chart
        this.renderPeakHoursChart();
    }

    renderUsageTrendsChart() {
        const container = document.getElementById('usage-trends-chart');
        if (!container) return;

        // Generate sample data
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Operations',
                data: [120, 150, 180, 200, 160, 90, 70],
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4
            }]
        };

        window.chartComponent.createLineChart('usage-trends-chart', data, {
            height: 250,
            showPoints: true
        });
    }

    renderOperationsDistributionChart() {
        const data = {
            labels: ['Compress', 'Merge', 'Split', 'Protect', 'Convert'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                ]
            }]
        };

        window.chartComponent.createDoughnutChart('operations-distribution-chart', data, {
            height: 250
        });
    }

    renderRevenueChart() {
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [1200, 1500, 1800, 2200, 1900, 2400],
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderColor: 'rgb(168, 85, 247)',
                tension: 0.4
            }]
        };

        window.chartComponent.createLineChart('revenue-chart', data, {
            height: 250
        });
    }

    renderUserActivityChart() {
        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Active Users',
                data: [450, 520, 480, 590],
                backgroundColor: '#10B981'
            }]
        };

        window.chartComponent.createBarChart('user-activity-chart', data, {
            height: 250
        });
    }

    renderPeakHoursChart() {
        const data = {
            labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
            datasets: [{
                label: 'Operations',
                data: [20, 80, 120, 100, 150, 60],
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderColor: 'rgb(245, 158, 11)',
                tension: 0.4
            }]
        };

        window.chartComponent.createLineChart('peak-hours-chart', data, {
            height: 250
        });
    }

    setupChartViewButtons() {
        const buttons = document.querySelectorAll('.chart-view-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Add CSS for chart view buttons
        const style = document.createElement('style');
        style.textContent = `
            .chart-view-btn {
                padding: 0.5rem 1rem;
                border: 1px solid #e5e7eb;
                background: white;
                color: #6b7280;
                font-size: 0.875rem;
                border-radius: 0.375rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .chart-view-btn:first-child {
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
                border-right: none;
            }
            .chart-view-btn:last-child {
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
            }
            .chart-view-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            .chart-view-btn:hover:not(.active) {
                background: #f3f4f6;
            }
        `;
        document.head.appendChild(style);
    }

    changeTimeRange(range) {
        this.currentDateRange = range;
        // Re-fetch data and update charts
        this.refreshAnalytics();
    }

    switchChartView(view) {
        // Switch between operations and users view in usage trends
        if (view === 'operations') {
            this.renderUsageTrendsChart();
        } else if (view === 'users') {
            // Render users chart
            const data = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Users',
                    data: [80, 95, 110, 125, 100, 60, 45],
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.4
                }]
            };
            window.chartComponent.updateLineChart(
                document.getElementById('usage-trends-chart'), 
                data, 
                { height: 250, showPoints: true }
            );
        }
    }

    async refreshAnalytics() {
        try {
            this.analyticsData = await window.adminAPI.getDashboard();
            this.initializeCharts();
            window.showNotification('Analytics data refreshed', 'success');
        } catch (error) {
            window.showNotification('Failed to refresh analytics', 'error');
        }
    }

    refreshMetrics() {
        this.refreshAnalytics();
    }

    exportData() {
        // Export analytics data as CSV
        const csvData = this.generateCSVData();
        window.utils.downloadFile(csvData, 'analytics-data.csv', 'text/csv');
        window.showNotification('Analytics data exported successfully', 'success');
    }

    generateCSVData() {
        const headers = ['Date', 'Operations', 'Users', 'Revenue'];
        const rows = [
            ['2023-07-01', '120', '80', '240.00'],
            ['2023-07-02', '150', '95', '300.00'],
            ['2023-07-03', '180', '110', '360.00'],
            ['2023-07-04', '200', '125', '400.00'],
            ['2023-07-05', '160', '100', '320.00'],
            ['2023-07-06', '90', '60', '180.00'],
            ['2023-07-07', '70', '45', '140.00']
        ];
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    cleanup() {
        // Cleanup charts
        if (window.chartComponent) {
            window.chartComponent.destroyAll();
        }
        window.analyticsComponent = null;
    }
}

// Export to global scope
window.AnalyticsComponent = AnalyticsComponent;