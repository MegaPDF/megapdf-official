// PDF Tools Management Component - Using Real Data
class ToolsComponent {
    constructor() {
        this.toolsData = null;
        this.dashboardData = null;
        this.loading = false;
    }

    async render() {
        try {
            this.loading = true;
            // Load both tools data and dashboard data for usage statistics
            const [toolsData, dashboardData] = await Promise.all([
                window.adminAPI.getPDFTools(),
                window.adminAPI.getDashboard()
            ]);
            
            this.toolsData = toolsData;
            this.dashboardData = dashboardData;
            this.loading = false;
            
            return this.createToolsHTML();
        } catch (error) {
            console.error('Failed to load tools:', error);
            this.loading = false;
            return this.createErrorHTML();
        }
    }

    createToolsHTML() {
        const tools = this.toolsData.tools || [];
        const stats = this.dashboardData.stats;
        
        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">PDF Tools Management</h1>
                            <p class="text-gray-600">Configure and monitor PDF processing tools</p>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="window.toolsComponent.enableAllTools()" 
                                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-check-circle mr-2"></i>
                                Enable All
                            </button>
                            <button onclick="window.toolsComponent.disableAllTools()" 
                                    class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                <i class="fas fa-times-circle mr-2"></i>
                                Disable All
                            </button>
                            <button onclick="window.toolsComponent.refreshTools()" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-sync mr-2"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tools Overview Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    ${this.createToolsStatsCards(tools, stats)}
                </div>

                <!-- Tools Usage Analytics -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Usage Distribution Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tools Usage Distribution</h3>
                        <div id="tools-usage-chart" class="chart-container h-64"></div>
                    </div>
                    
                    <!-- Revenue by Tool -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue by Tool</h3>
                        <div id="tools-revenue-chart" class="chart-container h-64"></div>
                    </div>
                </div>

                <!-- Tools Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    ${this.createToolsGrid(tools, stats.topOperations)}
                </div>

                <!-- Detailed Tools Table -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">Tools Performance</h3>
                            <span class="text-sm text-gray-500">${tools.length} tools configured</span>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Use</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.createToolsTableRows(tools, stats.topOperations)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createToolsStatsCards(tools, stats) {
        const enabledTools = tools.filter(tool => tool.enabled).length;
        const totalUsage = (stats.topOperations || []).reduce((sum, op) => sum + op.count, 0);
        const totalRevenue = (stats.topOperations || []).reduce((sum, op) => sum + (op.revenue || 0), 0);
        const avgCostPerUse = totalUsage > 0 ? totalRevenue / totalUsage : 0;

        const statsCards = [
            {
                title: 'Active Tools',
                value: `${enabledTools}/${tools.length}`,
                subtitle: 'Enabled tools',
                icon: 'fas fa-tools',
                color: 'green'
            },
            {
                title: 'Total Usage',
                value: this.formatNumber(totalUsage),
                subtitle: 'Operations processed',
                icon: 'fas fa-chart-bar',
                color: 'blue'
            },
            {
                title: 'Total Revenue',
                value: `$${this.formatCurrency(totalRevenue)}`,
                subtitle: 'From all tools',
                icon: 'fas fa-dollar-sign',
                color: 'purple'
            },
            {
                title: 'Avg Cost',
                value: `$${avgCostPerUse.toFixed(3)}`,
                subtitle: 'Per operation',
                icon: 'fas fa-calculator',
                color: 'yellow'
            }
        ];

        return statsCards.map(card => {
            const colorClasses = {
                green: 'border-green-500 bg-green-50 text-green-600',
                blue: 'border-blue-500 bg-blue-50 text-blue-600',
                purple: 'border-purple-500 bg-purple-50 text-purple-600',
                yellow: 'border-yellow-500 bg-yellow-50 text-yellow-600'
            };

            return `
                <div class="bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[card.color].split(' ')[0]}">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-600">${card.title}</p>
                            <p class="text-2xl font-bold text-gray-900">${card.value}</p>
                            <p class="text-sm text-gray-500">${card.subtitle}</p>
                        </div>
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[card.color].split(' ').slice(1).join(' ')}">
                            <i class="${card.icon}"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    createToolsGrid(tools, operations) {
        return tools.map(tool => {
            const operationData = operations?.find(op => op.operation === tool.id) || { count: 0, revenue: 0 };
            const usageCount = operationData.count;
            const revenue = operationData.revenue || 0;
            const costPerUse = tool.costPerUse || 0.005; // Default cost
            
            return `
                <div class="bg-white rounded-lg shadow p-6 border ${tool.enabled ? 'border-green-200' : 'border-gray-200'}">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 ${tool.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} rounded-lg flex items-center justify-center">
                                <i class="${this.getToolIcon(tool.id)}"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-900">${tool.name || this.formatToolName(tool.id)}</h4>
                                <p class="text-sm text-gray-500">${tool.description || 'PDF processing tool'}</p>
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${tool.enabled ? 'checked' : ''} 
                                   onchange="window.toolsComponent.toggleTool('${tool.id}', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="text-center p-3 bg-blue-50 rounded-lg">
                            <div class="text-lg font-bold text-blue-600">${this.formatNumber(usageCount)}</div>
                            <div class="text-xs text-gray-500">Uses</div>
                        </div>
                        <div class="text-center p-3 bg-green-50 rounded-lg">
                            <div class="text-lg font-bold text-green-600">$${this.formatCurrency(revenue)}</div>
                            <div class="text-xs text-gray-500">Revenue</div>
                        </div>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Cost per use:</span>
                            <span class="font-medium">$${costPerUse.toFixed(3)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Profit margin:</span>
                            <span class="font-medium text-green-600">
                                ${usageCount > 0 ? (((revenue - (usageCount * costPerUse)) / revenue) * 100).toFixed(1) : '0'}%
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Status:</span>
                            <span class="font-medium ${tool.enabled ? 'text-green-600' : 'text-red-600'}">
                                ${tool.enabled ? 'Active' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex space-x-2">
                        <button onclick="window.toolsComponent.viewToolDetails('${tool.id}')" 
                                class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                            <i class="fas fa-eye mr-1"></i>
                            Details
                        </button>
                        <button onclick="window.toolsComponent.configureTool('${tool.id}')" 
                                class="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors">
                            <i class="fas fa-cog mr-1"></i>
                            Configure
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    createToolsTableRows(tools, operations) {
        return tools.map(tool => {
            const operationData = operations?.find(op => op.operation === tool.id) || { count: 0, revenue: 0 };
            const usageCount = operationData.count;
            const revenue = operationData.revenue || 0;
            const costPerUse = tool.costPerUse || 0.005;
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-8 h-8 ${tool.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} rounded-lg flex items-center justify-center mr-3">
                                <i class="${this.getToolIcon(tool.id)} text-xs"></i>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900">${tool.name || this.formatToolName(tool.id)}</div>
                                <div class="text-sm text-gray-500">${tool.description || 'PDF processing tool'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tool.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${tool.enabled ? 'Active' : 'Disabled'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatNumber(usageCount)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${this.formatCurrency(revenue)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${costPerUse.toFixed(3)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex space-x-2">
                            <button onclick="window.toolsComponent.toggleTool('${tool.id}', ${!tool.enabled})" 
                                    class="text-blue-600 hover:text-blue-900">
                                <i class="fas fa-${tool.enabled ? 'pause' : 'play'}"></i>
                            </button>
                            <button onclick="window.toolsComponent.configureTool('${tool.id}')" 
                                    class="text-green-600 hover:text-green-900">
                                <i class="fas fa-cog"></i>
                            </button>
                            <button onclick="window.toolsComponent.viewToolAnalytics('${tool.id}')" 
                                    class="text-purple-600 hover:text-purple-900">
                                <i class="fas fa-chart-line"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async postRender() {
        window.toolsComponent = this;
        
        // Add CSS for toggle switches
        this.addToggleSwitchCSS();
        
        // Initialize charts
        if (window.chartComponent && this.dashboardData) {
            this.initializeCharts();
        }
    }

    addToggleSwitchCSS() {
        if (!document.getElementById('toggle-switch-css')) {
            const style = document.createElement('style');
            style.id = 'toggle-switch-css';
            style.textContent = `
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 24px;
                }
                
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                input:checked + .toggle-slider {
                    background-color: #10B981;
                }
                
                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }
            `;
            document.head.appendChild(style);
        }
    }

    initializeCharts() {
        this.renderUsageChart();
        this.renderRevenueChart();
    }

    renderUsageChart() {
        const operations = this.dashboardData.stats.topOperations || [];
        
        if (operations.length === 0) {
            document.getElementById('tools-usage-chart').innerHTML = 
                '<div class="flex items-center justify-center h-64 text-gray-500">No usage data available</div>';
            return;
        }

        const data = {
            labels: operations.map(op => this.formatToolName(op.operation)),
            datasets: [{
                data: operations.map(op => op.count),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'
                ].slice(0, operations.length),
                borderWidth: 0
            }]
        };

        if (window.chartComponent) {
            window.chartComponent.updateDoughnutChart(
                document.getElementById('tools-usage-chart'),
                data,
                { height: 250, cutout: '50%' }
            );
        }
    }

    renderRevenueChart() {
        const operations = this.dashboardData.stats.topOperations || [];
        
        if (operations.length === 0) {
            document.getElementById('tools-revenue-chart').innerHTML = 
                '<div class="flex items-center justify-center h-64 text-gray-500">No revenue data available</div>';
            return;
        }

        const data = {
            labels: operations.map(op => this.formatToolName(op.operation)),
            datasets: [{
                label: 'Revenue ($)',
                data: operations.map(op => op.revenue || 0),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1
            }]
        };

        if (window.chartComponent) {
            window.chartComponent.updateBarChart(
                document.getElementById('tools-revenue-chart'),
                data,
                { height: 250 }
            );
        }
    }

    async toggleTool(toolId, enabled) {
        try {
            await window.adminAPI.updateToolStatus(toolId, enabled);
            window.showNotification(
                `Tool ${enabled ? 'enabled' : 'disabled'} successfully`,
                'success'
            );
            
            // Update local data
            const tool = this.toolsData.tools.find(t => t.id === toolId);
            if (tool) {
                tool.enabled = enabled;
            }
            
            // Refresh the component
            await this.refreshTools();
        } catch (error) {
            window.showNotification('Failed to update tool status', 'error');
        }
    }

    async enableAllTools() {
        try {
            await window.adminAPI.enableAllTools();
            window.showNotification('All tools enabled successfully', 'success');
            await this.refreshTools();
        } catch (error) {
            window.showNotification('Failed to enable all tools', 'error');
        }
    }

    async disableAllTools() {
        window.showConfirmation(
            'Are you sure you want to disable all tools? This will stop all PDF processing operations.',
            async () => {
                try {
                    await window.adminAPI.disableAllTools();
                    window.showNotification('All tools disabled successfully', 'success');
                    await this.refreshTools();
                } catch (error) {
                    window.showNotification('Failed to disable all tools', 'error');
                }
            }
        );
    }

    async refreshTools() {
        try {
            const [toolsData, dashboardData] = await Promise.all([
                window.adminAPI.getPDFTools(),
                window.adminAPI.getDashboard()
            ]);
            
            this.toolsData = toolsData;
            this.dashboardData = dashboardData;
            
            // Re-render the component
            const content = this.createToolsHTML();
            document.getElementById('page-content').innerHTML = content;
            await this.postRender();
            
            window.showNotification('Tools data refreshed successfully', 'success');
        } catch (error) {
            window.showNotification('Failed to refresh tools data', 'error');
        }
    }

    viewToolDetails(toolId) {
        const tool = this.toolsData.tools.find(t => t.id === toolId);
        const operationData = this.dashboardData.stats.topOperations?.find(op => op.operation === toolId) || { count: 0, revenue: 0 };
        
        window.showConfirmation(
            `Tool: ${tool?.name || this.formatToolName(toolId)}\n\nUsage: ${this.formatNumber(operationData.count)} operations\nRevenue: $${this.formatCurrency(operationData.revenue || 0)}\nStatus: ${tool?.enabled ? 'Active' : 'Disabled'}\n\nDescription: ${tool?.description || 'PDF processing tool'}`,
            () => {}, // No action needed for details view
            () => {} // No action needed for cancel
        );
    }

    configureToolO(toolId) {
        window.showNotification(`Tool configuration for ${this.formatToolName(toolId)} coming soon!`, 'info');
    }

    viewToolAnalytics(toolId) {
        window.showNotification(`Analytics for ${this.formatToolName(toolId)} coming soon!`, 'info');
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

    formatToolName(toolId) {
        return toolId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getToolIcon(toolId) {
        const icons = {
            'pdf-merge': 'fas fa-copy',
            'pdf-split': 'fas fa-cut',
            'pdf-compress': 'fas fa-compress-arrows-alt',
            'pdf-convert': 'fas fa-exchange-alt',
            'pdf-protect': 'fas fa-lock',
            'pdf-unlock': 'fas fa-unlock',
            'pdf-rotate': 'fas fa-redo',
            'pdf-watermark': 'fas fa-tint',
            'pdf-ocr': 'fas fa-eye',
            'pdf-extract': 'fas fa-file-export'
        };
        return icons[toolId] || 'fas fa-file-pdf';
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Tools</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the tools data.</p>
                    <button onclick="window.adminApp.loadPage('tools')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    cleanup() {
        window.toolsComponent = null;
    }
}

// Export to global scope
window.ToolsComponent = ToolsComponent;