// Dashboard Component - Recreated with Chart.js Integration
class DashboardComponent {
    constructor() {
        this.dashboardData = null;
        this.autoRefreshInterval = null;
    }

    async render() {
        try {
            console.log('Loading dashboard data...');
            this.dashboardData = await window.adminAPI.getDashboard();
            console.log('Dashboard data loaded:', this.dashboardData);
            
            if (!this.dashboardData) {
                return this.createErrorHTML('Failed to load dashboard data');
            }

            return this.createDashboardHTML();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            return this.createErrorHTML('Failed to load dashboard data: ' + error.message);
        }
    }

    createDashboardHTML() {
        if (!this.dashboardData) {
            return this.createErrorHTML('No dashboard data available');
        }

        // Safely extract data with defaults
        const stats = this.dashboardData.stats || {};
        const health = this.dashboardData.systemHealth || {};
        const activity = this.dashboardData.recentActivity || [];

        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p class="text-gray-600">System overview and performance metrics</p>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="window.dashboardComponent.refreshDashboard()" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-sync mr-2"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.createStatsCards(stats)}
                </div>

                <!-- System Health -->
                <div class="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        ${this.createSystemHealthCards(health)}
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Operations Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Top Operations</h3>
                            <span class="text-sm text-gray-500">${(stats.topOperations?.length || 0)} operations</span>
                        </div>
                        <div class="h-64">
                            <canvas id="operations-chart"></canvas>
                        </div>
                        <div class="mt-4">
                            ${this.createOperationsTable(stats.topOperations || [])}
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            <span class="text-sm text-gray-500">${activity.length} activities</span>
                        </div>
                        <div class="space-y-3 max-h-64 overflow-y-auto">
                            ${this.createRecentActivity(activity)}
                        </div>
                    </div>
                </div>

                <!-- Revenue Chart -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                    <div class="h-64">
                        <canvas id="revenue-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    createStatsCards(stats) {
        const statsConfig = [
            {
                title: 'Total Users',
                value: this.formatNumber(stats.totalUsers || 0),
                icon: 'fas fa-users',
                color: 'blue',
                change: '+12%'
            },
            {
                title: 'Active Users',
                value: this.formatNumber(stats.activeUsers || 0),
                icon: 'fas fa-user-check',
                color: 'green',
                change: '+5%'
            },
            {
                title: 'Total Operations',
                value: this.formatNumber(stats.totalOperations || 0),
                icon: 'fas fa-cogs',
                color: 'yellow',
                change: '+18%'
            },
            {
                title: 'Total Revenue',
                value: `$${this.formatCurrency(stats.totalRevenue || 0)}`,
                icon: 'fas fa-dollar-sign',
                color: 'purple',
                change: '+23%'
            }
        ];

        return statsConfig.map(stat => {
            const colorClasses = {
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                yellow: 'bg-yellow-500',
                purple: 'bg-purple-500'
            };

            return `
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="p-3 rounded-lg ${colorClasses[stat.color]} text-white">
                                <i class="${stat.icon} text-xl"></i>
                            </div>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="text-sm font-medium text-gray-500">${stat.title}</h3>
                            <div class="flex items-baseline">
                                <p class="text-2xl font-semibold text-gray-900">${stat.value}</p>
                                <span class="ml-2 text-sm font-medium text-green-600">${stat.change}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    createSystemHealthCards(health) {
        const healthMetrics = [
            {
                label: 'Database',
                value: health.databaseStatus || 'unknown',
                status: (health.databaseStatus === 'healthy') ? 'good' : 'error'
            },
            {
                label: 'API Response',
                value: `${(health.apiResponseTime || 0).toFixed(0)}ms`,
                status: (health.apiResponseTime || 0) < 200 ? 'good' : (health.apiResponseTime || 0) < 500 ? 'warning' : 'error'
            },
            {
                label: 'Disk Usage',
                value: `${(health.diskUsage || 0).toFixed(1)}%`,
                status: (health.diskUsage || 0) < 80 ? 'good' : (health.diskUsage || 0) < 90 ? 'warning' : 'error'
            },
            {
                label: 'Memory Usage',
                value: `${(health.memoryUsage || 0).toFixed(1)}%`,
                status: (health.memoryUsage || 0) < 80 ? 'good' : (health.memoryUsage || 0) < 90 ? 'warning' : 'error'
            },
            {
                label: 'Error Rate',
                value: `${(health.errorRate || 0).toFixed(2)}%`,
                status: (health.errorRate || 0) < 1 ? 'good' : (health.errorRate || 0) < 5 ? 'warning' : 'error'
            }
        ];

        return healthMetrics.map(metric => {
            const statusColors = {
                good: 'text-green-600 bg-green-100',
                warning: 'text-yellow-600 bg-yellow-100',
                error: 'text-red-600 bg-red-100'
            };

            return `
                <div class="text-center p-3 rounded-lg ${statusColors[metric.status]}">
                    <div class="font-semibold">${metric.value}</div>
                    <div class="text-xs">${metric.label}</div>
                </div>
            `;
        }).join('');
    }

    createOperationsTable(operations) {
        if (!Array.isArray(operations) || operations.length === 0) {
            return '<div class="text-gray-500 text-center py-4">No operation data available</div>';
        }

        const maxCount = Math.max(...operations.map(op => op.count || 0));

        return `
            <div class="space-y-2">
                ${operations.slice(0, 5).map(op => {
                    const count = op.count || 0;
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return `
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center justify-between text-sm">
                                    <span class="font-medium">${this.formatOperationName(op.operation || 'Unknown')}</span>
                                    <span class="text-gray-500">${this.formatNumber(count)}</span>
                                </div>
                                <div class="mt-1 bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    createRecentActivity(activities) {
        if (!Array.isArray(activities) || activities.length === 0) {
            return '<div class="text-gray-500 text-center py-4">No recent activity</div>';
        }

        return activities.slice(0, 10).map(activity => {
            const statusColors = {
                completed: 'bg-green-100 text-green-800',
                pending: 'bg-yellow-100 text-yellow-800',
                failed: 'bg-red-100 text-red-800'
            };

            const statusColor = statusColors[activity.status] || 'bg-gray-100 text-gray-800';
            const timeAgo = this.formatTimeAgo(activity.createdAt);

            return `
                <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">
                            ${activity.userName || 'Unknown User'} - ${this.formatOperationName(activity.operation || 'Unknown')}
                        </p>
                        <p class="text-xs text-gray-500">
                            ${activity.userEmail || ''}
                            ${activity.amount ? `- $${this.formatCurrency(Math.abs(activity.amount))}` : ''}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                            ${activity.status || 'unknown'}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">${timeAgo}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    async postRender() {
        console.log('Dashboard postRender called');
        window.dashboardComponent = this;
        
        // Wait a bit for Chart.js to load if needed
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
        
        // Start auto-refresh
        this.startAutoRefresh();
    }

    async initializeCharts() {
        if (!window.chartComponent) {
            console.warn('Chart component not available yet, retrying...');
            setTimeout(() => this.initializeCharts(), 500);
            return;
        }

        if (!this.dashboardData) {
            console.warn('No dashboard data available for charts');
            return;
        }

        console.log('Initializing charts...');
        
        try {
            await this.renderOperationsChart();
            await this.renderRevenueChart();
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    async renderOperationsChart() {
        console.log('Rendering operations chart...');
        
        const operations = this.dashboardData?.stats?.topOperations;
        if (!Array.isArray(operations) || operations.length === 0) {
            console.log('No operations data available for chart');
            document.getElementById('operations-chart').parentElement.innerHTML = 
                '<div class="flex items-center justify-center h-64 text-gray-500">No operations data available</div>';
            return;
        }

        const validOperations = operations.filter(op => op && typeof op.count === 'number' && op.count > 0);
        
        if (validOperations.length === 0) {
            document.getElementById('operations-chart').parentElement.innerHTML = 
                '<div class="flex items-center justify-center h-64 text-gray-500">No valid operations data</div>';
            return;
        }

        // Prepare data for Chart.js
        const data = {
            labels: validOperations.map(op => this.formatOperationName(op.operation || 'Unknown')),
            datasets: [{
                data: validOperations.map(op => op.count || 0),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
                    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
                ].slice(0, validOperations.length),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        };

        try {
            window.chartComponent.createDoughnutChart('operations-chart', data, options);
            console.log('Operations chart rendered successfully');
        } catch (error) {
            console.error('Error rendering operations chart:', error);
            document.getElementById('operations-chart').parentElement.innerHTML = 
                '<div class="flex items-center justify-center h-64 text-red-500">Chart rendering error</div>';
        }
    }

    async renderRevenueChart() {
        console.log('Rendering revenue chart...');
        
        const stats = this.dashboardData?.stats || {};
        
        // Prepare data for Chart.js bar chart
        const data = {
            labels: ['Today', 'This Week', 'Total'],
            datasets: [{
                label: 'Revenue ($)',
                data: [
                    stats.revenueToday || 0,
                    stats.revenueThisWeek || 0,
                    stats.totalRevenue || 0
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',   // Green for today
                    'rgba(59, 130, 246, 0.8)',   // Blue for this week  
                    'rgba(139, 92, 246, 0.8)'    // Purple for total
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(59, 130, 246)',
                    'rgb(139, 92, 246)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        };

        try {
            window.chartComponent.createBarChart('revenue-chart', data, options);
            console.log('Revenue chart rendered successfully');
        } catch (error) {
            console.error('Error rendering revenue chart:', error);
            document.getElementById('revenue-chart').parentElement.innerHTML = 
                '<div class="flex items-center justify-center h-64 text-red-500">Chart rendering error</div>';
        }
    }

    // Utility methods
    formatOperationName(operation) {
        if (!operation) return 'Unknown';
        return operation.replace(/[-_]/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase());
    }

    formatNumber(num) {
        if (typeof num !== 'number') return '0';
        return num.toLocaleString();
    }

    formatCurrency(amount) {
        if (typeof amount !== 'number') return '0.00';
        return amount.toFixed(2);
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays}d ago`;
        } catch {
            return 'Unknown';
        }
    }

    async refreshDashboard() {
        try {
            window.showNotification('Refreshing dashboard...', 'info', 2000);
            
            // Clean up existing charts
            if (window.chartComponent) {
                window.chartComponent.destroyChart('operations-chart');
                window.chartComponent.destroyChart('revenue-chart');
            }
            
            // Fetch new data
            this.dashboardData = await window.adminAPI.getDashboard();
            
            // Re-render the component
            const content = this.createDashboardHTML();
            document.getElementById('page-content').innerHTML = content;
            await this.postRender();
            
            window.showNotification('Dashboard refreshed successfully!', 'success');
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            window.showNotification('Failed to refresh dashboard', 'error');
        }
    }

    startAutoRefresh() {
        // Clear existing interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        // Refresh every 5 minutes
        this.autoRefreshInterval = setInterval(() => {
            this.refreshDashboard();
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        
        // Clean up charts when component is destroyed
        if (window.chartComponent) {
            window.chartComponent.destroyChart('operations-chart');
            window.chartComponent.destroyChart('revenue-chart');
        }
    }

    createErrorHTML(message) {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <div class="mx-auto h-12 w-12 text-red-400">
                        <i class="fas fa-exclamation-triangle text-4xl"></i>
                    </div>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">Dashboard Error</h3>
                    <p class="mt-1 text-sm text-gray-500">${message}</p>
                    <div class="mt-6">
                        <button onclick="window.dashboardComponent.refreshDashboard()" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Export to global scope
window.DashboardComponent = DashboardComponent;