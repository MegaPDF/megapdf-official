// api/templates/assets/js/components/analytics.js

// Advanced Analytics Component - With Debugging and Error Handling
class AnalyticsComponent {
    constructor() {
        this.analyticsData = null;
        this.refreshInterval = null;
        this.charts = {};
        this.selectedPeriod = 'month';
    }

    async render() {
        try {
            console.log('Analytics: Starting to fetch data...');
            
            // Check if adminAPI is available
            if (!window.adminAPI) {
                console.error('Analytics: window.adminAPI is not available');
                return this.createErrorHTML('Admin API not initialized');
            }

            // Check if user is authenticated
            const token = localStorage.getItem('admin_token');
            if (!token) {
                console.error('Analytics: No admin token found');
                return this.createErrorHTML('Not authenticated - please login again');
            }

            console.log('Analytics: Fetching real data...');
            this.analyticsData = await this.fetchRealData();
            console.log('Analytics: Data fetched successfully:', this.analyticsData);
            
            return this.createAnalyticsHTML();
        } catch (error) {
            console.error('Analytics: Failed to load:', error);
            return this.createErrorHTML(error.message || 'Unknown error occurred');
        }
    }

    async fetchRealData() {
        try {
            console.log('Analytics: Calling adminAPI.getDashboard()...');
            
            // Get dashboard data - same API call that works for regular dashboard
            const dashboardData = await window.adminAPI.getDashboard();
            
            if (!dashboardData) {
                throw new Error('Dashboard API returned null/undefined data');
            }

            console.log('Analytics: Dashboard data received:', dashboardData);

            // Validate data structure
            if (!dashboardData.stats) {
                throw new Error('Dashboard data missing stats object');
            }

            if (!dashboardData.systemHealth) {
                throw new Error('Dashboard data missing systemHealth object');
            }

            // Try to get additional user data (optional)
            let usersData = null;
            try {
                console.log('Analytics: Trying to fetch additional user data...');
                usersData = await window.adminAPI.getUsers(1, 100);
                console.log('Analytics: Additional user data:', usersData);
            } catch (e) {
                console.log('Analytics: Additional user data not available:', e.message);
                // This is optional, so we continue without it
            }

            const result = {
                stats: dashboardData.stats,
                recentActivity: dashboardData.recentActivity || [],
                systemHealth: dashboardData.systemHealth,
                activeUsers: dashboardData.activeUsers || dashboardData.stats.activeUsers,
                users: usersData
            };

            console.log('Analytics: Final processed data:', result);
            return result;

        } catch (error) {
            console.error('Analytics: Error in fetchRealData:', error);
            
            // Try to provide more specific error messages
            if (error.message.includes('401')) {
                throw new Error('Authentication failed - please login again');
            } else if (error.message.includes('404')) {
                throw new Error('Dashboard API endpoint not found');
            } else if (error.message.includes('500')) {
                throw new Error('Server error - please try again later');
            } else if (error.message.includes('Network')) {
                throw new Error('Network error - check your connection');
            } else {
                throw new Error(`API Error: ${error.message}`);
            }
        }
    }

    createAnalyticsHTML() {
        // Validate data before rendering
        if (!this.analyticsData || !this.analyticsData.stats) {
            return this.createErrorHTML('Invalid data structure received from API');
        }

        const stats = this.analyticsData.stats;
        const health = this.analyticsData.systemHealth;

        // Debug: Log the stats we're working with
        console.log('Analytics: Rendering with stats:', stats);

        return `
            <div class="page-transition">
                <!-- Debug Info (remove in production) -->
                <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-500 mr-2"></i>
                        <span class="text-sm text-green-700">✅ Analytics loaded successfully</span>
                        <button onclick="console.log('Current analytics data:', window.analyticsComponent.analyticsData)" 
                                class="ml-auto text-xs bg-green-100 px-2 py-1 rounded">
                            Debug Data
                        </button>
                    </div>
                </div>

                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                            <p class="text-gray-600">Real-time insights from your MegaPDF system</p>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex items-center space-x-4">
                            <button onclick="window.analyticsComponent.exportData()" class="btn-secondary">
                                <i class="fas fa-download mr-2"></i>
                                Export Data
                            </button>
                            <button onclick="window.analyticsComponent.refreshData()" class="btn-primary">
                                <i class="fas fa-sync mr-2"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Real KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.createRealKPICards(stats)}
                </div>

                <!-- Main Analytics Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Operations Analysis -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Operations Breakdown</h3>
                        <div id="operations-chart" class="chart-container h-64">
                            ${this.createOperationsChart(stats.topOperations)}
                        </div>
                    </div>

                    <!-- Revenue Analysis -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Total Revenue</span>
                                <span class="text-lg font-semibold">${window.utils.formatCurrency(stats.totalRevenue)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Today's Revenue</span>
                                <span class="text-lg font-semibold text-green-600">${window.utils.formatCurrency(stats.revenueToday)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">This Week's Revenue</span>
                                <span class="text-lg font-semibold text-blue-600">${window.utils.formatCurrency(stats.revenueThisWeek)}</span>
                            </div>
                            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h4 class="text-sm font-medium text-gray-900 mb-2">Revenue Per Operation</h4>
                                <div class="text-2xl font-bold text-indigo-600">
                                    $${stats.totalRevenue > 0 && stats.totalOperations > 0 ? 
                                        (stats.totalRevenue / stats.totalOperations).toFixed(3) : '0.000'}
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Average revenue per operation</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Analytics -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- System Health -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                        <div class="space-y-4">
                            ${this.createRealHealthMetrics(health)}
                        </div>
                    </div>

                    <!-- User Analytics -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Total Users</span>
                                <span class="text-lg font-semibold">${window.utils.formatNumber(stats.totalUsers || 0)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Active Users</span>
                                <span class="text-lg font-semibold text-green-600">${window.utils.formatNumber(stats.activeUsers || 0)}</span>
                            </div>
                            <div class="mt-4">
                                <div class="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Activity Rate</span>
                                    <span>${(stats.totalUsers && stats.totalUsers > 0) ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                         style="width: ${(stats.totalUsers && stats.totalUsers > 0) ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%"></div>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div class="text-sm font-medium text-blue-900">Operations per User</div>
                                <div class="text-lg font-bold text-blue-700">
                                    ${(stats.totalUsers && stats.totalUsers > 0) ? Math.round(stats.totalOperations / stats.totalUsers) : 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Metrics -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Total Operations</span>
                                <span class="text-lg font-semibold">${window.utils.formatNumber(stats.totalOperations || 0)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Today's Operations</span>
                                <span class="text-lg font-semibold text-green-600">${window.utils.formatNumber(stats.operationsToday || 0)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Weekly Operations</span>
                                <span class="text-lg font-semibold text-blue-600">${window.utils.formatNumber(stats.operationsThisWeek || 0)}</span>
                            </div>
                            <div class="mt-4 p-3 bg-purple-50 rounded-lg">
                                <div class="text-sm font-medium text-purple-900">Daily Average</div>
                                <div class="text-lg font-bold text-purple-700">
                                    ${stats.operationsThisWeek ? Math.round(stats.operationsThisWeek / 7) : 0}
                                </div>
                                <p class="text-xs text-purple-600">Operations per day this week</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div class="space-y-3 custom-scrollbar max-h-96 overflow-y-auto">
                        ${this.createRealActivityList(this.analyticsData.recentActivity)}
                    </div>
                </div>

                <!-- Operation Statistics Table -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Operation Statistics</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-3 text-sm font-medium text-gray-500">Operation</th>
                                    <th class="text-right py-3 text-sm font-medium text-gray-500">Count</th>
                                    <th class="text-right py-3 text-sm font-medium text-gray-500">Revenue</th>
                                    <th class="text-right py-3 text-sm font-medium text-gray-500">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.createRealOperationTable(stats.topOperations, stats.totalOperations)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createRealKPICards(stats) {
        // Safely handle potentially undefined values
        const safeStats = {
            totalOperations: stats.totalOperations || 0,
            totalUsers: stats.totalUsers || 0,
            activeUsers: stats.activeUsers || 0,
            totalRevenue: stats.totalRevenue || 0,
            operationsToday: stats.operationsToday || 0,
            operationsThisWeek: stats.operationsThisWeek || 0,
            revenueToday: stats.revenueToday || 0,
            revenueThisWeek: stats.revenueThisWeek || 0
        };

        // Calculate real growth percentages where possible
        const weeklyGrowth = safeStats.operationsThisWeek > 0 ? 
            Math.round(((safeStats.operationsToday * 7) / safeStats.operationsThisWeek - 1) * 100) : 0;
        
        const revenueGrowth = safeStats.revenueThisWeek > 0 ? 
            Math.round(((safeStats.revenueToday * 7) / safeStats.revenueThisWeek - 1) * 100) : 0;

        const kpis = [
            {
                title: 'Total Operations',
                value: window.utils.formatNumber(safeStats.totalOperations),
                change: `${safeStats.operationsToday} today`,
                changeValue: weeklyGrowth,
                icon: 'fas fa-file-pdf',
                color: 'blue'
            },
            {
                title: 'Active Users',
                value: window.utils.formatNumber(safeStats.activeUsers),
                change: `${safeStats.totalUsers > 0 ? Math.round((safeStats.activeUsers / safeStats.totalUsers) * 100) : 0}% active`,
                changeValue: null,
                icon: 'fas fa-users',
                color: 'green'
            },
            {
                title: 'Total Revenue',
                value: window.utils.formatCurrency(safeStats.totalRevenue),
                change: `${window.utils.formatCurrency(safeStats.revenueToday)} today`,
                changeValue: revenueGrowth,
                icon: 'fas fa-dollar-sign',
                color: 'purple'
            },
            {
                title: 'Weekly Operations',
                value: window.utils.formatNumber(safeStats.operationsThisWeek),
                change: `${safeStats.operationsThisWeek > 0 ? Math.round(safeStats.operationsThisWeek / 7) : 0}/day avg`,
                changeValue: null,
                icon: 'fas fa-chart-line',
                color: 'indigo'
            }
        ];

        return kpis.map(kpi => `
            <div class="stats-card bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-12 w-12 rounded-md bg-${kpi.color}-500 text-white">
                            <i class="${kpi.icon}"></i>
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <div class="text-sm font-medium text-gray-500">${kpi.title}</div>
                        <div class="text-2xl font-bold text-gray-900">${kpi.value}</div>
                        <div class="flex items-center text-sm">
                            ${kpi.changeValue !== null ? 
                                `<span class="text-${kpi.changeValue >= 0 ? 'green' : 'red'}-600 font-medium mr-2">
                                    ${kpi.changeValue >= 0 ? '+' : ''}${kpi.changeValue}%
                                </span>` : ''
                            }
                            <span class="text-gray-500">${kpi.change}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    createRealHealthMetrics(health) {
        if (!health) {
            return '<p class="text-gray-500 text-center">Health data not available</p>';
        }

        const metrics = [
            {
                label: 'Database Status',
                value: health.databaseStatus || 'unknown',
                status: (health.databaseStatus === 'healthy') ? 'good' : 'critical'
            },
            {
                label: 'API Response Time',
                value: `${health.apiResponseTime || 0}ms`,
                status: (health.apiResponseTime || 0) < 100 ? 'good' : 
                       (health.apiResponseTime || 0) < 300 ? 'warning' : 'critical'
            },
            {
                label: 'Memory Usage',
                value: `${health.memoryUsage || 0}%`,
                status: (health.memoryUsage || 0) < 80 ? 'good' : 
                       (health.memoryUsage || 0) < 90 ? 'warning' : 'critical'
            },
            {
                label: 'Disk Usage',
                value: `${health.diskUsage || 0}%`,
                status: (health.diskUsage || 0) < 80 ? 'good' : 
                       (health.diskUsage || 0) < 90 ? 'warning' : 'critical'
            },
            {
                label: 'Error Rate',
                value: `${health.errorRate || 0}%`,
                status: (health.errorRate || 0) < 1 ? 'good' : 
                       (health.errorRate || 0) < 5 ? 'warning' : 'critical'
            }
        ];

        return metrics.map(metric => `
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">${metric.label}</span>
                <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900 mr-2">${metric.value}</span>
                    <div class="w-2 h-2 rounded-full ${
                        metric.status === 'good' ? 'bg-green-400' :
                        metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }"></div>
                </div>
            </div>
        `).join('');
    }

    createOperationsChart(topOperations) {
        if (!topOperations || topOperations.length === 0) {
            return '<p class="text-gray-500 text-center py-8">No operation data available</p>';
        }

        const maxCount = Math.max(...topOperations.map(op => op.count || 0));

        return topOperations.map(op => {
            const count = op.count || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return `
                <div class="flex items-center mb-4">
                    <div class="w-24 text-sm text-gray-600 truncate">
                        ${window.utils.capitalize(op.operation || 'unknown')}
                    </div>
                    <div class="flex-1 mx-3">
                        <div class="bg-gray-200 rounded-full h-4">
                            <div class="bg-blue-500 h-4 rounded-full transition-all duration-500" 
                                 style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="w-16 text-sm text-gray-900 text-right font-medium">
                        ${window.utils.formatNumber(count)}
                    </div>
                </div>
            `;
        }).join('');
    }

    createRealActivityList(recentActivity) {
        if (!recentActivity || recentActivity.length === 0) {
            return '<p class="text-gray-500 text-center py-4">No recent activity</p>';
        }

        return recentActivity.map(activity => `
            <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full ${this.getActivityColor(activity.operation)} flex items-center justify-center">
                        <i class="fas fa-${this.getOperationIcon(activity.operation)} text-sm text-white"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">${activity.userName || 'Unknown User'}</p>
                    <p class="text-sm text-gray-500">${window.utils.capitalize(activity.operation || 'unknown')} operation</p>
                </div>
                <div class="flex-shrink-0 text-right">
                    <p class="text-sm text-gray-500">${window.utils.formatRelativeTime(activity.createdAt)}</p>
                    ${(activity.amount && activity.amount > 0) ? `<p class="text-xs text-green-600">${window.utils.formatCurrency(activity.amount)}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    createRealOperationTable(topOperations, totalOperations) {
        if (!topOperations || topOperations.length === 0) {
            return '<tr><td colspan="4" class="text-center py-4 text-gray-500">No operation data available</td></tr>';
        }

        const safeTotal = totalOperations || 0;

        return topOperations.map(op => {
            const count = op.count || 0;
            const percentage = safeTotal > 0 ? ((count / safeTotal) * 100).toFixed(1) : '0.0';
            const estimatedRevenue = op.revenue || (count * 0.05);
            
            return `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3 text-sm text-gray-900">${window.utils.capitalize(op.operation || 'unknown')}</td>
                    <td class="py-3 text-sm text-gray-900 text-right font-medium">${window.utils.formatNumber(count)}</td>
                    <td class="py-3 text-sm text-gray-900 text-right font-medium">${window.utils.formatCurrency(estimatedRevenue)}</td>
                    <td class="py-3 text-sm text-right">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${percentage}%
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Helper methods
    getOperationIcon(operation) {
        const icons = {
            'pdf_merge': 'object-group',
            'pdf_split': 'cut',
            'pdf_compress': 'compress-arrows-alt',
            'pdf_convert': 'exchange-alt',
            'pdf_protect': 'lock',
            'pdf_unlock': 'unlock',
            'deposit': 'plus-circle',
            'default': 'file-pdf'
        };
        return icons[operation] || icons.default;
    }

    getActivityColor(operation) {
        const colors = {
            'pdf_merge': 'bg-blue-500',
            'pdf_split': 'bg-green-500',
            'pdf_compress': 'bg-purple-500',
            'pdf_convert': 'bg-yellow-500',
            'pdf_protect': 'bg-red-500',
            'pdf_unlock': 'bg-indigo-500',
            'deposit': 'bg-green-600',
            'default': 'bg-gray-500'
        };
        return colors[operation] || colors.default;
    }

    // Interactive methods
    async refreshData() {
        console.log('Analytics: Manual refresh requested');
        try {
            const refreshBtn = document.querySelector('[onclick*="refreshData"]');
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Refreshing...';
                refreshBtn.disabled = true;
            }

            this.analyticsData = await this.fetchRealData();
            
            // Re-render the entire component with fresh data
            const pageContent = document.getElementById('page-content');
            if (pageContent) {
                pageContent.innerHTML = this.createAnalyticsHTML();
            }

            if (window.notifications?.show) {
                window.notifications.show('Analytics data refreshed successfully', 'success');
            }
        } catch (error) {
            console.error('Analytics: Failed to refresh data:', error);
            if (window.notifications?.show) {
                window.notifications.show('Failed to refresh data: ' + error.message, 'error');
            }
        }
    }

    exportData() {
        console.log('Analytics: Export requested');
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                stats: this.analyticsData.stats,
                systemHealth: this.analyticsData.systemHealth,
                recentActivity: this.analyticsData.recentActivity,
                metadata: {
                    totalUsers: this.analyticsData.stats.totalUsers,
                    totalOperations: this.analyticsData.stats.totalOperations,
                    totalRevenue: this.analyticsData.stats.totalRevenue,
                    exportDate: new Date().toLocaleDateString()
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `megapdf-analytics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            if (window.notifications?.show) {
                window.notifications.show('Analytics data exported successfully', 'success');
            }
        } catch (error) {
            console.error('Analytics: Export failed:', error);
            if (window.notifications?.show) {
                window.notifications.show('Export failed: ' + error.message, 'error');
            }
        }
    }

    createErrorHTML(errorMessage = 'Unknown error occurred') {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Analytics</h2>
                    <p class="text-gray-600 mb-4">${errorMessage}</p>
                    
                    <!-- Debug Information -->
                    <div class="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
                        <h3 class="text-sm font-medium text-gray-900 mb-2">Debug Information:</h3>
                        <ul class="text-xs text-gray-600 space-y-1">
                            <li>• Admin API Available: ${window.adminAPI ? '✅ Yes' : '❌ No'}</li>
                            <li>• Auth Token: ${localStorage.getItem('admin_token') ? '✅ Present' : '❌ Missing'}</li>
                            <li>• Base URL: ${window.API_BASE_URL || 'Not set'}</li>
                            <li>• Error: ${errorMessage}</li>
                        </ul>
                    </div>
                    
                    <div class="mt-6 space-x-4">
                        <button onclick="window.adminApp.loadPage('analytics')" class="btn-primary">
                            <i class="fas fa-redo mr-2"></i>
                            Try Again
                        </button>
                        <button onclick="window.adminApp.loadPage('dashboard')" class="btn-secondary">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async postRender() {
        console.log('Analytics: Post-render setup');
        
        // Make component available to onclick handlers
        window.analyticsComponent = this;
        
        // Start auto-refresh for real-time updates (less frequent for real data)
        this.startAutoRefresh();
    }

    startAutoRefresh() {
        // Refresh real data every 2 minutes
        this.refreshInterval = setInterval(() => {
            console.log('Analytics: Auto-refresh triggered');
            this.refreshData();
        }, 120000);
    }

    cleanup() {
        console.log('Analytics: Cleanup');
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

// Export to global scope
window.AnalyticsComponent = AnalyticsComponent;