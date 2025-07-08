// Analytics Component - Using Real Data
class AnalyticsComponent {
    constructor() {
        this.analyticsData = null;
        this.currentView = 'operations';
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
        const stats = this.analyticsData.stats;
        
        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
                            <p class="text-gray-600">Detailed insights into your system performance</p>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="window.analyticsComponent.exportData()" 
                                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-download mr-2"></i>
                                Export Data
                            </button>
                            <button onclick="window.analyticsComponent.refreshAnalytics()" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-sync mr-2"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Metrics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.createMetricsCards(stats)}
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Usage Trends -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-semibold text-gray-900">Usage Trends</h3>
                            <div class="flex space-x-2">
                                <button onclick="window.analyticsComponent.switchChartView('operations')" 
                                        class="chart-view-btn ${this.currentView === 'operations' ? 'active' : ''}" data-view="operations">Operations</button>
                                <button onclick="window.analyticsComponent.switchChartView('revenue')" 
                                        class="chart-view-btn ${this.currentView === 'revenue' ? 'active' : ''}" data-view="revenue">Revenue</button>
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
                        <div class="grid grid-cols-3 gap-4 mb-6">
                            <div class="text-center p-4 bg-green-50 rounded-lg">
                                <div class="text-2xl font-bold text-green-600">$${this.formatCurrency(stats.totalRevenue)}</div>
                                <div class="text-sm text-gray-500">Total Revenue</div>
                            </div>
                            <div class="text-center p-4 bg-blue-50 rounded-lg">
                                <div class="text-2xl font-bold text-blue-600">$${this.formatCurrency(stats.revenueThisWeek)}</div>
                                <div class="text-sm text-gray-500">This Week</div>
                            </div>
                            <div class="text-center p-4 bg-purple-50 rounded-lg">
                                <div class="text-2xl font-bold text-purple-600">$${this.formatCurrency(stats.revenueToday)}</div>
                                <div class="text-sm text-gray-500">Today</div>
                            </div>
                        </div>
                        <div id="revenue-chart" class="chart-container h-64"></div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Top Revenue Sources</h3>
                        <div class="space-y-4">
                            ${this.createRevenueSourcesList(stats.topOperations)}
                        </div>
                    </div>
                </div>

                <!-- User Behavior Analytics -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">User Activity Overview</h3>
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="text-center p-4 bg-blue-50 rounded-lg">
                                <div class="text-2xl font-bold text-blue-600">${this.formatNumber(stats.totalUsers)}</div>
                                <div class="text-sm text-gray-500">Total Users</div>
                            </div>
                            <div class="text-center p-4 bg-green-50 rounded-lg">
                                <div class="text-2xl font-bold text-green-600">${this.formatNumber(stats.activeUsers)}</div>
                                <div class="text-sm text-gray-500">Active Users</div>
                            </div>
                        </div>
                        <div id="user-activity-chart" class="chart-container h-48"></div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
                        <div class="space-y-4">
                            ${this.createPerformanceMetrics(stats)}
                        </div>
                    </div>
                </div>

                <!-- Detailed Operations Table -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-gray-900">Detailed Operations Analysis</h3>
                        <span class="text-sm text-gray-500">${stats.topOperations?.length || 0} operation types</span>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Revenue</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.createOperationsTableRows(stats.topOperations, stats.totalOperations)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createMetricsCards(stats) {
        const metrics = [
            {
                title: 'Total Operations',
                value: this.formatNumber(stats.totalOperations),
                change: stats.operationsToday > 0 ? `+${this.formatNumber(stats.operationsToday)} today` : 'No operations today',
                icon: 'fas fa-chart-line',
                color: 'blue',
                trend: stats.operationsToday > 0 ? 'up' : 'neutral'
            },
            {
                title: 'Revenue',
                value: `$${this.formatCurrency(stats.totalRevenue)}`,
                change: stats.revenueToday > 0 ? `+$${this.formatCurrency(stats.revenueToday)} today` : 'No revenue today',
                icon: 'fas fa-dollar-sign',
                color: 'green',
                trend: stats.revenueToday > 0 ? 'up' : 'neutral'
            },
            {
                title: 'Active Users',
                value: this.formatNumber(stats.activeUsers),
                change: `${((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% of total`,
                icon: 'fas fa-users',
                color: 'purple',
                trend: stats.activeUsers > 0 ? 'up' : 'neutral'
            },
            {
                title: 'Avg Revenue/Operation',
                value: `$${stats.totalOperations > 0 ? (stats.totalRevenue / stats.totalOperations).toFixed(3) : '0.000'}`,
                change: 'Per operation',
                icon: 'fas fa-calculator',
                color: 'yellow',
                trend: 'neutral'
            }
        ];

        return metrics.map(metric => {
            const colorClasses = {
                blue: 'border-blue-500 bg-blue-50',
                green: 'border-green-500 bg-green-50',
                purple: 'border-purple-500 bg-purple-50',
                yellow: 'border-yellow-500 bg-yellow-50'
            };

            const iconColors = {
                blue: 'text-blue-600',
                green: 'text-green-600',
                purple: 'text-purple-600',
                yellow: 'text-yellow-600'
            };

            return `
                <div class="bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[metric.color]}">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-600">${metric.title}</p>
                            <p class="text-2xl font-bold text-gray-900">${metric.value}</p>
                            <p class="text-sm text-gray-500 mt-1">${metric.change}</p>
                        </div>
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[metric.color]}">
                            <i class="${metric.icon} ${iconColors[metric.color]}"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    createRevenueSourcesList(operations) {
        if (!operations || operations.length === 0) {
            return '<div class="text-gray-500 text-center py-4">No revenue data available</div>';
        }

        const totalRevenue = operations.reduce((sum, op) => sum + (op.revenue || 0), 0);

        return operations.slice(0, 5).map(op => {
            const percentage = totalRevenue > 0 ? ((op.revenue || 0) / totalRevenue * 100) : 0;
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span class="font-medium text-gray-900">${this.formatOperationName(op.operation)}</span>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold text-gray-900">$${this.formatCurrency(op.revenue || 0)}</div>
                        <div class="text-sm text-gray-500">${percentage.toFixed(1)}%</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    createPerformanceMetrics(stats) {
        const metrics = [
            {
                label: 'Operations Today',
                value: this.formatNumber(stats.operationsToday),
                target: this.formatNumber(stats.operationsThisWeek / 7), // Daily average
                percentage: stats.operationsThisWeek > 0 ? (stats.operationsToday / (stats.operationsThisWeek / 7) * 100) : 0
            },
            {
                label: 'Revenue Today',
                value: `$${this.formatCurrency(stats.revenueToday)}`,
                target: `$${this.formatCurrency(stats.revenueThisWeek / 7)}`, // Daily average
                percentage: stats.revenueThisWeek > 0 ? (stats.revenueToday / (stats.revenueThisWeek / 7) * 100) : 0
            },
            {
                label: 'User Engagement',
                value: `${((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}%`,
                target: '80%',
                percentage: (stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100
            }
        ];

        return metrics.map(metric => {
            const isGood = metric.percentage >= 80;
            const barColor = isGood ? 'bg-green-500' : metric.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
            
            return `
                <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-700">${metric.label}</span>
                        <span class="text-sm font-semibold">${metric.value}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div class="${barColor} h-2 rounded-full transition-all duration-300" style="width: ${Math.min(metric.percentage, 100)}%"></div>
                    </div>
                    <div class="text-xs text-gray-500">Target: ${metric.target}</div>
                </div>
            `;
        }).join('');
    }

    createOperationsTableRows(operations, totalOperations) {
        if (!operations || operations.length === 0) {
            return '<tr><td colspan="5" class="text-center py-4 text-gray-500">No operation data available</td></tr>';
        }

        return operations.map(op => {
            const share = totalOperations > 0 ? (op.count / totalOperations * 100) : 0;
            const avgRevenue = op.count > 0 ? (op.revenue || 0) / op.count : 0;
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span class="text-sm font-medium text-gray-900">${this.formatOperationName(op.operation)}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatNumber(op.count)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${this.formatCurrency(op.revenue || 0)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${avgRevenue.toFixed(3)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: ${share}%"></div>
                            </div>
                            <span class="text-sm text-gray-900">${share.toFixed(1)}%</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async postRender() {
        window.analyticsComponent = this;
        
        // Initialize charts with real data
        if (window.chartComponent && this.analyticsData) {
            this.initializeCharts();
        }
    }

    initializeCharts() {
        this.renderUsageTrendsChart();
        this.renderOperationsDistributionChart();
        this.renderRevenueChart();
        this.renderUserActivityChart();
    }

    renderUsageTrendsChart() {
        const stats = this.analyticsData.stats;
        
        if (this.currentView === 'operations') {
            // Show operations trend (simplified - you can enhance with historical data)
            const data = {
                labels: ['Today', 'This Week', 'Total'],
                datasets: [{
                    label: 'Operations',
                    data: [stats.operationsToday, stats.operationsThisWeek, stats.totalOperations],
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.4,
                    fill: true
                }]
            };
            
            if (window.chartComponent) {
                window.chartComponent.updateLineChart(
                    document.getElementById('usage-trends-chart'), 
                    data, 
                    { height: 250, showPoints: true }
                );
            }
        } else if (this.currentView === 'revenue') {
            // Show revenue trend
            const data = {
                labels: ['Today', 'This Week', 'Total'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [stats.revenueToday, stats.revenueThisWeek, stats.totalRevenue],
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.4,
                    fill: true
                }]
            };
            
            if (window.chartComponent) {
                window.chartComponent.updateLineChart(
                    document.getElementById('usage-trends-chart'), 
                    data, 
                    { height: 250, showPoints: true }
                );
            }
        }
    }

    renderOperationsDistributionChart() {
        const operations = this.analyticsData.stats.topOperations || [];
        
        if (operations.length === 0) {
            document.getElementById('operations-distribution-chart').innerHTML = 
                '<div class="flex items-center justify-center h-64 text-gray-500">No operation data available</div>';
            return;
        }

        const data = {
            labels: operations.map(op => this.formatOperationName(op.operation)),
            datasets: [{
                data: operations.map(op => op.count),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'
                ].slice(0, operations.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        if (window.chartComponent) {
            window.chartComponent.updateDoughnutChart(
                document.getElementById('operations-distribution-chart'),
                data,
                { height: 250, cutout: '50%' }
            );
        }
    }

    renderRevenueChart() {
        const stats = this.analyticsData.stats;
        
        const data = {
            labels: ['Today', 'This Week', 'Total'],
            datasets: [{
                label: 'Revenue',
                data: [stats.revenueToday, stats.revenueThisWeek, stats.totalRevenue],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1
            }]
        };

        if (window.chartComponent) {
            window.chartComponent.updateBarChart(
                document.getElementById('revenue-chart'),
                data,
                { height: 250 }
            );
        }
    }

    renderUserActivityChart() {
        const stats = this.analyticsData.stats;
        
        const data = {
            labels: ['Active Users', 'Inactive Users'],
            datasets: [{
                data: [stats.activeUsers, stats.totalUsers - stats.activeUsers],
                backgroundColor: ['#10B981', '#E5E7EB'],
                borderWidth: 0
            }]
        };

        if (window.chartComponent) {
            window.chartComponent.updateDoughnutChart(
                document.getElementById('user-activity-chart'),
                data,
                { height: 200, cutout: '60%' }
            );
        }
    }

    switchChartView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.chart-view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Re-render the chart
        this.renderUsageTrendsChart();
    }

    async refreshAnalytics() {
        try {
            window.showNotification('Refreshing analytics...', 'info', 2000);
            this.analyticsData = await window.adminAPI.getDashboard();
            
            // Re-render the component
            const content = this.createAnalyticsHTML();
            document.getElementById('page-content').innerHTML = content;
            await this.postRender();
            
            window.showNotification('Analytics refreshed successfully!', 'success');
        } catch (error) {
            window.showNotification('Failed to refresh analytics', 'error');
        }
    }

    exportData() {
        try {
            const csvData = this.generateCSVData();
            this.downloadFile(csvData, 'analytics-data.csv', 'text/csv');
            window.showNotification('Analytics data exported successfully', 'success');
        } catch (error) {
            window.showNotification('Failed to export data', 'error');
        }
    }

    generateCSVData() {
        const stats = this.analyticsData.stats;
        const operations = stats.topOperations || [];
        
        const headers = ['Operation', 'Count', 'Revenue', 'Average Revenue'];
        const rows = operations.map(op => [
            this.formatOperationName(op.operation),
            op.count,
            (op.revenue || 0).toFixed(2),
            op.count > 0 ? ((op.revenue || 0) / op.count).toFixed(3) : '0.000'
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatCurrency(amount) {
        return parseFloat(amount || 0).toFixed(2);
    }

    formatOperationName(operation) {
        return operation.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

    cleanup() {
        if (window.chartComponent) {
            window.chartComponent.destroyAll();
        }
        window.analyticsComponent = null;
    }
}

// Export to global scope
window.AnalyticsComponent = AnalyticsComponent;