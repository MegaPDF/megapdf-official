// Admin Dashboard Component - Using Real Data
class DashboardComponent {
    constructor() {
        this.dashboardData = null;
        this.refreshInterval = null;
    }

    async render() {
        try {
            this.dashboardData = await window.adminAPI.getDashboard();
            return this.createDashboardHTML();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            return this.createErrorHTML();
        }
    }

    createDashboardHTML() {
        const stats = this.dashboardData.stats;
        const health = this.dashboardData.systemHealth;

        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p class="text-gray-600">Overview of your MegaPDF system</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="flex items-center text-sm text-gray-500">
                                <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                Live Data
                            </div>
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

                <!-- Charts and Recent Activity -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Operations Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Top Operations</h3>
                            <span class="text-sm text-gray-500">${stats.topOperations?.length || 0} operations</span>
                        </div>
                        <div id="operations-chart" class="chart-container h-64"></div>
                        <div class="mt-4">
                            ${this.createOperationsTable(stats.topOperations)}
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            <span class="text-sm text-gray-500">${this.dashboardData.recentActivity?.length || 0} activities</span>
                        </div>
                        <div class="space-y-3 custom-scrollbar max-h-80 overflow-y-auto">
                            ${this.createRecentActivityList()}
                        </div>
                    </div>
                </div>

                <!-- Revenue and Performance Metrics -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Revenue Overview -->
                    <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                        <div class="grid grid-cols-3 gap-4 mb-6">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-600">$${this.formatCurrency(stats.totalRevenue)}</div>
                                <div class="text-sm text-gray-500">Total Revenue</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-600">$${this.formatCurrency(stats.revenueThisWeek)}</div>
                                <div class="text-sm text-gray-500">This Week</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-600">$${this.formatCurrency(stats.revenueToday)}</div>
                                <div class="text-sm text-gray-500">Today</div>
                            </div>
                        </div>
                        <div id="revenue-chart" class="chart-container h-48"></div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Operations Today</span>
                                <span class="font-semibold">${this.formatNumber(stats.operationsToday)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">This Week</span>
                                <span class="font-semibold">${this.formatNumber(stats.operationsThisWeek)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Active Users</span>
                                <span class="font-semibold">${this.formatNumber(stats.activeUsers)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Total Users</span>
                                <span class="font-semibold">${this.formatNumber(stats.totalUsers)}</span>
                            </div>
                            <hr class="my-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Avg Revenue/Op</span>
                                <span class="font-semibold text-green-600">
                                    $${stats.totalOperations > 0 ? (stats.totalRevenue / stats.totalOperations).toFixed(3) : '0.000'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createStatsCards(stats) {
        const cards = [
            {
                title: 'Total Users',
                value: this.formatNumber(stats.totalUsers),
                change: stats.activeUsers > 0 ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% active` : 'No active users',
                icon: 'fas fa-users',
                color: 'blue',
                trend: 'up'
            },
            {
                title: 'Total Operations',
                value: this.formatNumber(stats.totalOperations),
                change: stats.operationsToday > 0 ? `+${this.formatNumber(stats.operationsToday)} today` : 'No operations today',
                icon: 'fas fa-chart-line',
                color: 'green',
                trend: stats.operationsToday > 0 ? 'up' : 'neutral'
            },
            {
                title: 'Total Revenue',
                value: `$${this.formatCurrency(stats.totalRevenue)}`,
                change: stats.revenueToday > 0 ? `+$${this.formatCurrency(stats.revenueToday)} today` : 'No revenue today',
                icon: 'fas fa-dollar-sign',
                color: 'purple',
                trend: stats.revenueToday > 0 ? 'up' : 'neutral'
            },
            {
                title: 'This Week',
                value: this.formatNumber(stats.operationsThisWeek),
                change: stats.revenueThisWeek > 0 ? `$${this.formatCurrency(stats.revenueThisWeek)} revenue` : 'No revenue',
                icon: 'fas fa-calendar-week',
                color: 'yellow',
                trend: stats.operationsThisWeek > 0 ? 'up' : 'neutral'
            }
        ];

        return cards.map(card => {
            const colorClasses = {
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                purple: 'bg-purple-500',
                yellow: 'bg-yellow-500'
            };

            const trendIcon = {
                up: 'fas fa-arrow-up text-green-500',
                down: 'fas fa-arrow-down text-red-500',
                neutral: 'fas fa-minus text-gray-500'
            };

            return `
                <div class="stats-card bg-white rounded-lg shadow p-6 border-l-4 border-${card.color}-500">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-600">${card.title}</p>
                            <p class="text-2xl font-bold text-gray-900">${card.value}</p>
                            <p class="flex items-center text-sm text-gray-500 mt-1">
                                <i class="${trendIcon[card.trend]} mr-1"></i>
                                ${card.change}
                            </p>
                        </div>
                        <div class="w-12 h-12 ${colorClasses[card.color]} rounded-lg flex items-center justify-center text-white">
                            <i class="${card.icon}"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    createSystemHealthCards(health) {
        if (!health) {
            return '<div class="text-gray-500 text-center col-span-5">System health data unavailable</div>';
        }

        const healthMetrics = [
            {
                label: 'Database',
                value: health.databaseStatus || 'Unknown',
                status: health.databaseStatus === 'connected' ? 'good' : 'warning'
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
        if (!operations || operations.length === 0) {
            return '<div class="text-gray-500 text-center py-4">No operation data available</div>';
        }

        const maxCount = Math.max(...operations.map(op => op.count));

        return `
            <div class="space-y-2">
                ${operations.map(op => {
                    const percentage = maxCount > 0 ? (op.count / maxCount) * 100 : 0;
                    return `
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center justify-between text-sm mb-1">
                                    <span class="font-medium text-gray-900">${this.formatOperationName(op.operation)}</span>
                                    <span class="text-gray-500">$${this.formatCurrency(op.revenue || 0)}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                            <div class="w-16 text-sm text-gray-900 text-right ml-3">${this.formatNumber(op.count)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    createRecentActivityList() {
        if (!this.dashboardData.recentActivity || this.dashboardData.recentActivity.length === 0) {
            return '<div class="text-gray-500 text-center py-4">No recent activity</div>';
        }

        return this.dashboardData.recentActivity.slice(0, 10).map(activity => {
            const timeAgo = this.timeAgo(new Date(activity.createdAt));
            const statusColor = {
                completed: 'text-green-600 bg-green-100',
                pending: 'text-yellow-600 bg-yellow-100',
                failed: 'text-red-600 bg-red-100'
            }[activity.status] || 'text-gray-600 bg-gray-100';

            return `
                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-${this.getOperationIcon(activity.operation)} text-blue-600 text-xs"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                            ${activity.userName || 'Unknown User'}
                        </p>
                        <p class="text-sm text-gray-500">
                            ${this.formatOperationName(activity.operation)}
                            ${activity.amount ? `- $${this.formatCurrency(activity.amount)}` : ''}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                            ${activity.status}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">${timeAgo}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    async postRender() {
        window.dashboardComponent = this;
        
        // Initialize charts with real data
        if (window.chartComponent && this.dashboardData) {
            this.renderOperationsChart();
            this.renderRevenueChart();
        }
        
        // Start auto-refresh
        this.startAutoRefresh();
    }

    renderOperationsChart() {
        if (!this.dashboardData.stats.topOperations) return;

        const operations = this.dashboardData.stats.topOperations.slice(0, 5);
        const data = {
            labels: operations.map(op => this.formatOperationName(op.operation)),
            datasets: [{
                data: operations.map(op => op.count),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                ],
                borderWidth: 0
            }]
        };

        if (window.chartComponent) {
            window.chartComponent.updateDoughnutChart(
                document.getElementById('operations-chart'),
                data,
                { height: 250, cutout: '60%' }
            );
        }
    }

    renderRevenueChart() {
        // Simple revenue trend chart (you can enhance this with historical data)
        const data = {
            labels: ['Today', 'This Week', 'Total'],
            datasets: [{
                label: 'Revenue',
                data: [
                    this.dashboardData.stats.revenueToday,
                    this.dashboardData.stats.revenueThisWeek,
                    this.dashboardData.stats.totalRevenue
                ],
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgb(16, 185, 129)',
                tension: 0.4
            }]
        };

        if (window.chartComponent) {
            window.chartComponent.updateLineChart(
                document.getElementById('revenue-chart'),
                data,
                { height: 200, showPoints: true }
            );
        }
    }

    async refreshDashboard() {
        try {
            window.showNotification('Refreshing dashboard...', 'info', 2000);
            this.dashboardData = await window.adminAPI.getDashboard();
            
            // Re-render the component
            const content = this.createDashboardHTML();
            document.getElementById('page-content').innerHTML = content;
            await this.postRender();
            
            window.showNotification('Dashboard refreshed successfully!', 'success');
        } catch (error) {
            window.showNotification('Failed to refresh dashboard', 'error');
        }
    }

    startAutoRefresh() {
        // Refresh dashboard every 5 minutes
        this.refreshInterval = setInterval(async () => {
            try {
                const newData = await window.adminAPI.getDashboard();
                this.dashboardData = newData;
                this.updateStatsInPlace();
                this.renderOperationsChart();
                this.renderRevenueChart();
            } catch (error) {
                console.error('Auto-refresh failed:', error);
            }
        }, 300000); // 5 minutes
    }

    updateStatsInPlace() {
        // Update stat values without full page refresh
        const stats = this.dashboardData.stats;
        const statsElements = document.querySelectorAll('.stats-card .text-2xl');
        
        if (statsElements.length >= 4) {
            statsElements[0].textContent = this.formatNumber(stats.totalUsers);
            statsElements[1].textContent = this.formatNumber(stats.totalOperations);
            statsElements[2].textContent = `$${this.formatCurrency(stats.totalRevenue)}`;
            statsElements[3].textContent = this.formatNumber(stats.operationsThisWeek);
        }
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

    getOperationIcon(operation) {
        const icons = {
            'pdf-merge': 'copy',
            'pdf-split': 'cut',
            'pdf-compress': 'compress-arrows-alt',
            'pdf-convert': 'exchange-alt',
            'deposit': 'credit-card',
            'withdrawal': 'money-bill'
        };
        return icons[operation] || 'file-pdf';
    }

    timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + ' years ago';
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + ' months ago';
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + ' days ago';
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + ' hours ago';
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + ' minutes ago';
        
        return 'just now';
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the dashboard data.</p>
                    <button onclick="window.adminApp.loadPage('dashboard')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        window.dashboardComponent = null;
    }
}

// Export to global scope
window.DashboardComponent = DashboardComponent;