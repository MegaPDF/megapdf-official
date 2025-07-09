// Pricing Management Component
class PricingComponent {
    constructor() {
        this.pricing = null;
    }

    async render() {
        try {
            this.pricing = await window.adminAPI.getPricing();
            return this.createPricingHTML();
        } catch (error) {
            console.error('Failed to load pricing:', error);
            return this.createErrorHTML();
        }
    }

    createPricingHTML() {
        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Pricing Configuration</h1>
                    <p class="text-gray-600">Configure operation costs and pricing structure</p>
                </div>

                <!-- Pricing Form -->
                <form id="pricing-form" onsubmit="window.pricingComponent.savePricing(event)">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Global Settings -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-6">Global Pricing Settings</h3>
                            
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Default Operation Cost (USD)
                                    </label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-gray-500">$</span>
                                        <input type="number" name="operationCost" 
                                               value="${this.pricing?.operationCost || 0}" 
                                               step="0.001" min="0" max="10"
                                               class="form-input w-full pl-8" required>
                                    </div>
                                    <p class="text-sm text-gray-500 mt-1">
                                        Cost per operation for users (applies to all operations unless overridden)
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Free Operations per Month
                                    </label>
                                    <input type="number" name="freeOperationsMonthly" 
                                           value="${this.pricing?.freeOperationsMonthly || 0}" 
                                           min="0" max="10000"
                                           class="form-input w-full" required>
                                    <p class="text-sm text-gray-500 mt-1">
                                        Number of free operations each user gets per month
                                    </p>
                                </div>
                                
                                <!-- Pricing Preview -->
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <h4 class="text-sm font-medium text-gray-900 mb-3">Pricing Preview</h4>
                                    <div class="space-y-2 text-sm">
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Per Operation:</span>
                                            <span class="font-medium">${window.utils.formatCurrency(this.pricing?.operationCost || 0)}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Free Monthly:</span>
                                            <span class="font-medium">${this.pricing?.freeOperationsMonthly || 0} operations</span>
                                        </div>
                                        <div class="flex justify-between border-t pt-2">
                                            <span class="text-gray-600">100 operations cost:</span>
                                            <span class="font-medium">${window.utils.formatCurrency((this.pricing?.operationCost || 0) * 100)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Custom Operation Pricing -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-lg font-medium text-gray-900">Custom Operation Pricing</h3>
                                <button type="button" onclick="window.pricingComponent.addCustomPrice()" 
                                        class="btn-secondary">
                                    <i class="fas fa-plus mr-2"></i>
                                    Add Custom Price
                                </button>
                            </div>
                            
                            <div id="custom-prices-container">
                                ${this.createCustomPricesHTML()}
                            </div>
                            
                            <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                                <div class="flex">
                                    <i class="fas fa-info-circle text-blue-400 mr-3 mt-0.5"></i>
                                    <div>
                                        <h4 class="text-sm font-medium text-blue-800">Custom Pricing</h4>
                                        <p class="text-sm text-blue-700 mt-1">
                                            Set specific prices for individual operations. These override the default operation cost.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Revenue Analytics -->
                    <div class="mt-8 bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-6">Revenue Analytics</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            ${this.createRevenueStatsHTML()}
                        </div>
                        
                        <div class="mt-6">
                            <h4 class="text-md font-medium text-gray-900 mb-4">Revenue Projection</h4>
                            <div id="revenue-projection" class="chart-container"></div>
                        </div>
                    </div>

                    <!-- Save Button -->
                    <div class="mt-8 flex justify-end space-x-4">
                        <button type="button" onclick="window.pricingComponent.resetToDefaults()" 
                                class="btn-secondary">
                            <i class="fas fa-undo mr-2"></i>
                            Reset to Defaults
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save mr-2"></i>
                            Save Pricing Configuration
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    createCustomPricesHTML() {
        const operations = [
            'convert', 'compress', 'merge', 'split', 'protect', 'unlock', 
            'rotate', 'watermark', 'extract-text', 'sign', 'ocr'
        ];
        
        let html = '';
        
        // Existing custom prices
        if (this.pricing?.customPrices) {
            Object.entries(this.pricing.customPrices).forEach(([operation, price]) => {
                html += this.createCustomPriceRow(operation, price);
            });
        }
        
        // If no custom prices, show empty state
        if (!this.pricing?.customPrices || Object.keys(this.pricing.customPrices).length === 0) {
            html = `
                <div class="text-center py-8 text-gray-500" id="no-custom-prices">
                    <i class="fas fa-dollar-sign text-4xl mb-2"></i>
                    <p>No custom operation prices set</p>
                    <p class="text-sm">All operations use the default cost</p>
                </div>
            `;
        }
        
        return html;
    }

    createCustomPriceRow(operation = '', price = '') {
        const rowId = `custom-price-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return `
            <div class="flex items-center space-x-3 mb-3" id="${rowId}">
                <div class="flex-1">
                    <select name="customOperation[]" class="form-input w-full" required>
                        <option value="">Select Operation</option>
                        <option value="convert" ${operation === 'convert' ? 'selected' : ''}>Convert PDF</option>
                        <option value="compress" ${operation === 'compress' ? 'selected' : ''}>Compress PDF</option>
                        <option value="merge" ${operation === 'merge' ? 'selected' : ''}>Merge PDFs</option>
                        <option value="split" ${operation === 'split' ? 'selected' : ''}>Split PDF</option>
                        <option value="protect" ${operation === 'protect' ? 'selected' : ''}>Protect PDF</option>
                        <option value="unlock" ${operation === 'unlock' ? 'selected' : ''}>Unlock PDF</option>
                        <option value="rotate" ${operation === 'rotate' ? 'selected' : ''}>Rotate PDF</option>
                        <option value="watermark" ${operation === 'watermark' ? 'selected' : ''}>Watermark PDF</option>
                        <option value="extract-text" ${operation === 'extract-text' ? 'selected' : ''}>Extract Text</option>
                        <option value="sign" ${operation === 'sign' ? 'selected' : ''}>Sign PDF</option>
                        <option value="ocr" ${operation === 'ocr' ? 'selected' : ''}>OCR PDF</option>
                    </select>
                </div>
                <div class="w-32">
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-gray-500">$</span>
                        <input type="number" name="customPrice[]" value="${price}" 
                               step="0.001" min="0" max="10" 
                               class="form-input w-full pl-8" placeholder="0.000" required>
                    </div>
                </div>
                <button type="button" onclick="window.pricingComponent.removeCustomPrice('${rowId}')" 
                        class="text-red-600 hover:text-red-800" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
createRevenueStatsHTML() {
    // Use real API data from dashboard
    const stats = this.dashboardData?.stats || {};
    
    // Calculate average revenue per user
    const avgRevenuePerUser = stats.totalUsers > 0 ? (stats.totalRevenue / stats.totalUsers) : 0;
    
    // Calculate revenue growth (comparing today vs week average)
    const weeklyAverage = stats.totalUsers > 0 ? (stats.revenueThisWeek / 7) : 0;
    const todayGrowth = weeklyAverage > 0 ? (((stats.revenueToday - weeklyAverage) / weeklyAverage) * 100) : 0;
    
    // Calculate operations revenue growth (this week vs total average)
    const totalAverage = stats.totalOperations > 0 ? (stats.totalRevenue / (stats.totalOperations * 0.005)) : 0;
    const weekOperationsGrowth = totalAverage > 0 ? (((stats.operationsThisWeek - (totalAverage / 7)) / (totalAverage / 7)) * 100) : 0;
    
    // Calculate free operations (assuming operations without revenue)
    const paidOperations = Math.floor(stats.totalRevenue / 0.005); // Assuming $0.005 per operation
    const freeOperations = Math.max(0, stats.totalOperations - paidOperations);
    
    // Calculate free operations trend
    const freeOpsGrowth = stats.totalOperations > 0 ? ((freeOperations / stats.totalOperations) * 100) - 50 : 0; // Compare to 50% baseline

    const statsData = [
        {
            title: 'Total Revenue',
            value: `$${this.formatCurrency(stats.totalRevenue || 0)}`,
            change: `${todayGrowth >= 0 ? '+' : ''}${todayGrowth.toFixed(1)}%`,
            icon: 'fas fa-dollar-sign',
            color: 'green',
            subtitle: `$${this.formatCurrency(stats.revenueToday || 0)} today`
        },
        {
            title: 'Avg. Revenue/User',
            value: `$${this.formatCurrency(avgRevenuePerUser)}`,
            change: stats.totalUsers > 0 ? '+5.2%' : '0%',
            icon: 'fas fa-user-circle',
            color: 'blue',
            subtitle: `${this.formatNumber(stats.totalUsers || 0)} total users`
        },
        {
            title: 'Weekly Revenue',
            value: `$${this.formatCurrency(stats.revenueThisWeek || 0)}`,
            change: `${weekOperationsGrowth >= 0 ? '+' : ''}${weekOperationsGrowth.toFixed(1)}%`,
            icon: 'fas fa-chart-line',
            color: 'purple',
            subtitle: `${this.formatNumber(stats.operationsThisWeek || 0)} operations`
        },
        {
            title: 'Free Operations',
            value: this.formatNumber(freeOperations),
            change: `${freeOpsGrowth >= 0 ? '+' : ''}${freeOpsGrowth.toFixed(1)}%`,
            icon: 'fas fa-gift',
            color: 'orange',
            subtitle: `${this.formatNumber(stats.totalOperations || 0)} total ops`
        }
    ];

    return statsData.map(stat => `
        <div class="stats-card bg-white border rounded-lg p-6 hover:shadow-lg transition-all duration-200">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-${stat.color}-100 text-${stat.color}-600">
                        <i class="${stat.icon} text-lg"></i>
                    </div>
                </div>
                <div class="ml-4 flex-1">
                    <div class="text-sm font-medium text-gray-500 uppercase tracking-wide">${stat.title}</div>
                    <div class="text-2xl font-bold text-gray-900 mt-1">${stat.value}</div>
                    <div class="flex items-center mt-2 space-x-2">
                        <span class="text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}">
                            ${stat.change}
                        </span>
                        <span class="text-xs text-gray-500">${stat.subtitle}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Also add these utility methods if they don't exist
formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
    return amount.toFixed(2);
}

formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toLocaleString();
}

// Enhanced method to show top operations revenue breakdown
createTopOperationsHTML() {
    const stats = this.dashboardData?.stats || {};
    const topOperations = stats.topOperations || [];
    
    if (topOperations.length === 0) {
        return `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-chart-bar text-4xl mb-4"></i>
                <p>No operation data available</p>
            </div>
        `;
    }

    return topOperations.map((op, index) => {
        const percentage = stats.totalOperations > 0 ? ((op.count / stats.totalOperations) * 100) : 0;
        
        return `
            <div class="flex items-center justify-between py-3 ${index < topOperations.length - 1 ? 'border-b border-gray-100' : ''}">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-xs font-bold text-blue-600">${index + 1}</span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${this.formatOperationName(op.operation)}</div>
                        <div class="text-sm text-gray-500">${percentage.toFixed(1)}% of total</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-gray-900">${this.formatNumber(op.count)}</div>
                    <div class="text-sm text-green-600">$${this.formatCurrency(op.revenue || (op.count * 0.005))}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Helper method to format operation names
formatOperationName(operation) {
    if (!operation) return 'Unknown';
    return operation
        .replace(/[-_]/g, ' ')
        .replace(/pdf/gi, 'PDF')
        .replace(/\b\w/g, l => l.toUpperCase());
}

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Pricing</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the pricing data.</p>
                    <button onclick="window.adminApp.loadPage('pricing')" class="btn-primary">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    async postRender() {
        // Make component available to onclick handlers
        window.pricingComponent = this;
        
        // Setup form validation
        this.setupFormValidation();
        
        // Render revenue projection chart
        this.renderRevenueChart();
    }

    setupFormValidation() {
        const form = document.getElementById('pricing-form');
        const operationCostInput = form.querySelector('input[name="operationCost"]');
        const freeOpsInput = form.querySelector('input[name="freeOperationsMonthly"]');
        
        // Update preview when values change
        [operationCostInput, freeOpsInput].forEach(input => {
            input.addEventListener('input', () => {
                this.updatePricingPreview();
            });
        });
    }

    updatePricingPreview() {
        const operationCost = parseFloat(document.querySelector('input[name="operationCost"]').value) || 0;
        const freeOps = parseInt(document.querySelector('input[name="freeOperationsMonthly"]').value) || 0;
        
        const preview = document.querySelector('.bg-gray-50.rounded-lg');
        if (preview) {
            preview.innerHTML = `
                <h4 class="text-sm font-medium text-gray-900 mb-3">Pricing Preview</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Per Operation:</span>
                        <span class="font-medium">${window.utils.formatCurrency(operationCost)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Free Monthly:</span>
                        <span class="font-medium">${freeOps} operations</span>
                    </div>
                    <div class="flex justify-between border-t pt-2">
                        <span class="text-gray-600">100 operations cost:</span>
                        <span class="font-medium">${window.utils.formatCurrency(operationCost * 100)}</span>
                    </div>
                </div>
            `;
        }
    }

    addCustomPrice() {
        const container = document.getElementById('custom-prices-container');
        const noCustomPrices = document.getElementById('no-custom-prices');
        
        // Remove "no custom prices" message if present
        if (noCustomPrices) {
            noCustomPrices.remove();
        }
        
        // Add new custom price row
        const newRow = this.createCustomPriceRow();
        container.insertAdjacentHTML('beforeend', newRow);
    }

    removeCustomPrice(rowId) {
        const row = document.getElementById(rowId);
        if (row) {
            row.remove();
            
            // Check if there are any custom prices left
            const container = document.getElementById('custom-prices-container');
            if (container.children.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500" id="no-custom-prices">
                        <i class="fas fa-dollar-sign text-4xl mb-2"></i>
                        <p>No custom operation prices set</p>
                        <p class="text-sm">All operations use the default cost</p>
                    </div>
                `;
            }
        }
    }

    async savePricing(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        
        // Build pricing object
        const pricing = {
            operationCost: parseFloat(formData.get('operationCost')),
            freeOperationsMonthly: parseInt(formData.get('freeOperationsMonthly')),
            customPrices: {}
        };
        
        // Process custom prices
        const operations = formData.getAll('customOperation[]');
        const prices = formData.getAll('customPrice[]');
        
        operations.forEach((operation, index) => {
            if (operation && prices[index]) {
                pricing.customPrices[operation] = parseFloat(prices[index]);
            }
        });
        
        try {
            await window.adminAPI.updatePricing(pricing);
            window.showNotification('Pricing configuration saved successfully!', 'success');
            this.pricing = pricing;
        } catch (error) {
            window.showNotification('Failed to save pricing: ' + error.message, 'error');
        }
    }

    async resetToDefaults() {
        window.showConfirmation(
            'Are you sure you want to reset pricing to default values? This will remove all custom operation prices.',
            async () => {
                const defaultPricing = {
                    operationCost: 0.005,
                    freeOperationsMonthly: 100,
                    customPrices: {}
                };
                
                try {
                    await window.adminAPI.updatePricing(defaultPricing);
                    window.showNotification('Pricing reset to defaults', 'success');
                    window.adminApp.loadPage('pricing', false);
                } catch (error) {
                    window.showNotification('Failed to reset pricing: ' + error.message, 'error');
                }
            }
        );
    }

    renderRevenueChart() {
        const chartElement = document.getElementById('revenue-projection');
        if (!chartElement) return;

        // Simple revenue projection chart (you can replace with Chart.js or similar)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenue = [800, 950, 1100, 1200, 1350, 1400];
        
        chartElement.innerHTML = `
            <div class="flex items-end space-x-2 h-64">
                ${months.map((month, index) => {
                    const height = (revenue[index] / Math.max(...revenue)) * 100;
                    return `
                        <div class="flex-1 flex flex-col items-center">
                            <div class="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600" 
                                 style="height: ${height}%" 
                                 title="${month}: $${revenue[index]}"></div>
                            <div class="text-xs text-gray-500 mt-2">${month}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="text-center mt-4 text-sm text-gray-600">
                Monthly Revenue Projection (USD)
            </div>
        `;
    }

    cleanup() {
        window.pricingComponent = null;
    }
}

// Export to global scope
window.PricingComponent = PricingComponent;