// Admin Dashboard Component
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
                    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p class="text-gray-600">Overview of your MegaPDF system</p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.createStatsCards(stats)}
                </div>

                <!-- Charts and Recent Activity -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Operations Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Operations</h3>
                        <div id="operations-chart" class="chart-container"></div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div class="space-y-3 custom-scrollbar max-h-80 overflow-y-auto">
                            ${this.createRecentActivityList()}
                        </div>
                    </div>
                </div>

                <!-- System Health -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${this.createHealthMetrics(health)}
                    </div>
                </div>
            </div>
        `;
    }

    createStatsCards(stats) {
        const cards = [
            {
                title: 'Total Users',
                value: window.utils.formatNumber(stats.totalUsers),
                icon: 'fas fa-users',
                color: 'blue',
                change: stats.activeUsers,
                changeLabel: 'active users'
            },
            {
                title: 'Total Operations',
                value: window.utils.formatNumber(stats.totalOperations),
                icon: 'fas fa-file-pdf',
                color: 'green',
                change: stats.operationsToday,
                changeLabel: 'today'
            },
            {
                title: 'Total Revenue',
                value: window.utils.formatCurrency(stats.totalRevenue),
                icon: 'fas fa-dollar-sign',
                color: 'purple',
                change: window.utils.formatCurrency(stats.revenueToday),
                changeLabel: 'today'
            },
            {
                title: 'Operations This Week',
                value: window.utils.formatNumber(stats.operationsThisWeek),
                icon: 'fas fa-chart-line',
                color: 'indigo',
                change: window.utils.formatCurrency(stats.revenueThisWeek),
                changeLabel: 'revenue'
            }
        ];

        return cards.map(card => `
            <div class="stats-card bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-12 w-12 rounded-md bg-${card.color}-500 text-white">
                            <i class="${card.icon}"></i>
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <div class="text-sm font-medium text-gray-500">${card.title}</div>
                        <div class="text-2xl font-bold text-gray-900">${card.value}</div>
                        <div class="text-sm text-gray-600">
                            <span class="font-medium">${card.change}</span>
                            <span class="text-gray-500">${card.changeLabel}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    createRecentActivityList() {
        if (!this.dashboardData.recentActivity || this.dashboardData.recentActivity.length === 0) {
            return '<p class="text-gray-500 text-center py-4">No recent activity</p>';
        }

        return this.dashboardData.recentActivity.map(activity => `
            <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-${this.getOperationIcon(activity.operation)} text-sm text-gray-600"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">${activity.userName}</p>
                    <p class="text-sm text-gray-500">${window.utils.capitalize(activity.operation)} operation</p>
                </div>
                <div class="flex-shrink-0 text-right">
                    <p class="text-sm text-gray-500">${window.utils.formatRelativeTime(activity.createdAt)}</p>
                    ${activity.amount > 0 ? `<p class="text-xs text-green-600">${window.utils.formatCurrency(activity.amount)}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    createHealthMetrics(health) {
        const metrics = [
            {
                name: 'Database',
                value: health.databaseStatus,
                status: health.databaseStatus === 'healthy' ? 'success' : 'error'
            },
            {
                name: 'API Response',
                value: `${health.apiResponseTime}ms`,
                status: health.apiResponseTime < 100 ? 'success' : health.apiResponseTime < 500 ? 'warning' : 'error'
            },
            {
                name: 'Disk Usage',
                value: `${health.diskUsage}%`,
                status: health.diskUsage < 80 ? 'success' : health.diskUsage < 90 ? 'warning' : 'error'
            },
            {
                name: 'Error Rate',
                value: `${health.errorRate}%`,
                status: health.errorRate < 1 ? 'success' : health.errorRate < 5 ? 'warning' : 'error'
            }
        ];

        return metrics.map(metric => `
            <div class="text-center">
                <div class="text-2xl font-bold ${this.getStatusColor(metric.status)}">${metric.value}</div>
                <div class="text-sm text-gray-500">${metric.name}</div>
                <div class="mt-1">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeClass(metric.status)}">
                        <i class="fas fa-${this.getStatusIcon(metric.status)} mr-1"></i>
                        ${window.utils.capitalize(metric.status)}
                    </span>
                </div>
            </div>
        `).join('');
    }

    getOperationIcon(operation) {
        const icons = {
            'convert': 'exchange-alt',
            'compress': 'compress-arrows-alt',
            'merge': 'object-group',
            'split': 'cut',
            'protect': 'lock',
            'unlock': 'unlock',
            'deposit': 'credit-card',
            'default': 'file-pdf'
        };
        return icons[operation] || icons.default;
    }

    getStatusColor(status) {
        const colors = {
            'success': 'text-green-600',
            'warning': 'text-yellow-600',
            'error': 'text-red-600'
        };
        return colors[status] || 'text-gray-600';
    }

    getStatusBadgeClass(status) {
        const classes = {
            'success': 'bg-green-100 text-green-800',
            'warning': 'bg-yellow-100 text-yellow-800',
            'error': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusIcon(status) {
        const icons = {
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'times-circle'
        };
        return icons[status] || 'question-circle';
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the dashboard data.</p>
                    <button onclick="window.adminApp.loadPage('dashboard')" class="btn-primary">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    async postRender() {
        // Render charts after DOM is updated
        if (this.dashboardData && this.dashboardData.stats.topOperations) {
            this.renderOperationsChart();
        }

        // Start auto-refresh
        this.startAutoRefresh();
    }

    renderOperationsChart() {
        const chartElement = document.getElementById('operations-chart');
        if (!chartElement) return;

        // Simple chart implementation (you can replace with Chart.js or similar)
        const operations = this.dashboardData.stats.topOperations;
        const maxCount = Math.max(...operations.map(op => op.count));

        chartElement.innerHTML = operations.map(op => {
            const percentage = (op.count / maxCount) * 100;
            return `
                <div class="flex items-center mb-3">
                    <div class="w-20 text-sm text-gray-600">${window.utils.capitalize(op.operation)}</div>
                    <div class="flex-1 mx-3">
                        <div class="bg-gray-200 rounded-full h-3">
                            <div class="bg-blue-500 h-3 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="w-16 text-sm text-gray-900 text-right">${window.utils.formatNumber(op.count)}</div>
                </div>
            `;
        }).join('');
    }

    startAutoRefresh() {
        // Refresh dashboard every 30 seconds
        this.refreshInterval = setInterval(async () => {
            try {
                const newData = await window.adminAPI.getDashboard();
                this.dashboardData = newData;
                this.renderOperationsChart();
                // Update stats without full re-render
                this.updateStatsInPlace();
            } catch (error) {
                console.error('Auto-refresh failed:', error);
            }
        }, 30000);
    }

    updateStatsInPlace() {
        // Update stat values without full page refresh
        const statsCards = document.querySelectorAll('.stats-card');
        const stats = this.dashboardData.stats;
        const values = [
            window.utils.formatNumber(stats.totalUsers),
            window.utils.formatNumber(stats.totalOperations),
            window.utils.formatCurrency(stats.totalRevenue),
            window.utils.formatNumber(stats.operationsThisWeek)
        ];

        statsCards.forEach((card, index) => {
            const valueElement = card.querySelector('.text-2xl');
            if (valueElement && values[index]) {
                valueElement.textContent = values[index];
            }
        });
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

// Export to global scope
window.DashboardComponent = DashboardComponent;