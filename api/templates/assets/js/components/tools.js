// PDF Tools Management Component
class ToolsComponent {
    constructor() {
        this.tools = [];
    }

    async render() {
        try {
            const response = await window.adminAPI.getPDFTools();
            this.tools = response.tools || [];
            return this.createToolsHTML();
        } catch (error) {
            console.error('Failed to load tools:', error);
            return this.createErrorHTML();
        }
    }

    createToolsHTML() {
        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">PDF Tools Management</h1>
                            <p class="text-gray-600">Enable or disable PDF processing tools</p>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="window.toolsComponent.enableAllTools()" class="btn-success">
                                <i class="fas fa-check-circle mr-2"></i>
                                Enable All
                            </button>
                            <button onclick="window.toolsComponent.disableAllTools()" class="btn-danger">
                                <i class="fas fa-times-circle mr-2"></i>
                                Disable All
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tools Status Overview -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    ${this.createToolsStatsHTML()}
                </div>

                <!-- Tools Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.createToolsGridHTML()}
                </div>

                <!-- Bulk Operations -->
                <div class="mt-8 bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Bulk Operations</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onclick="window.toolsComponent.enableByCategory('Conversion')" 
                                class="btn-secondary">
                            <i class="fas fa-exchange-alt mr-2"></i>
                            Enable All Conversion
                        </button>
                        <button onclick="window.toolsComponent.enableByCategory('Optimization')" 
                                class="btn-secondary">
                            <i class="fas fa-compress mr-2"></i>
                            Enable All Optimization
                        </button>
                        <button onclick="window.toolsComponent.enableByCategory('Security')" 
                                class="btn-secondary">
                            <i class="fas fa-shield-alt mr-2"></i>
                            Enable All Security
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createToolsStatsHTML() {
        const enabledCount = this.tools.filter(tool => tool.enabled).length;
        const disabledCount = this.tools.length - enabledCount;
        const categories = [...new Set(this.tools.map(tool => tool.category))];
        const totalRevenue = this.tools.reduce((sum, tool) => 
            sum + (tool.enabled ? tool.operationCost * 1000 : 0), 0); // Simulated revenue

        const stats = [
            {
                title: 'Total Tools',
                value: this.tools.length,
                icon: 'fas fa-tools',
                color: 'blue'
            },
            {
                title: 'Enabled Tools',
                value: enabledCount,
                icon: 'fas fa-check-circle',
                color: 'green'
            },
            {
                title: 'Disabled Tools',
                value: disabledCount,
                icon: 'fas fa-times-circle',
                color: 'red'
            },
            {
                title: 'Categories',
                value: categories.length,
                icon: 'fas fa-layer-group',
                color: 'purple'
            }
        ];

        return stats.map(stat => `
            <div class="stats-card bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-12 w-12 rounded-md bg-${stat.color}-500 text-white">
                            <i class="${stat.icon}"></i>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-500">${stat.title}</div>
                        <div class="text-2xl font-bold text-gray-900">${stat.value}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    createToolsGridHTML() {
        if (this.tools.length === 0) {
            return `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-tools text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No Tools Found</h3>
                    <p class="text-gray-600">No PDF tools are configured in the system.</p>
                </div>
            `;
        }

        return this.tools.map(tool => `
            <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="${this.getToolIcon(tool.id)} text-2xl ${tool.enabled ? 'text-blue-500' : 'text-gray-400'}"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-lg font-medium text-gray-900">${tool.name}</h3>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                             ${this.getCategoryColor(tool.category)}">
                                    ${tool.category}
                                </span>
                            </div>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="tool-${tool.id}" 
                                   ${tool.enabled ? 'checked' : ''} 
                                   onchange="window.toolsComponent.toggleTool('${tool.id}', this.checked)">
                            <span class="toggle-slider"></span>
                        </div>
                    </div>
                    
                    <p class="text-sm text-gray-600 mb-4">${tool.description}</p>
                    
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center">
                            <i class="fas fa-dollar-sign text-gray-400 mr-1"></i>
                            <span class="text-gray-600">Cost: ${window.utils.formatCurrency(tool.operationCost)}</span>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                     ${tool.enabled ? 'status-active' : 'status-inactive'}">
                            <i class="fas fa-${tool.enabled ? 'check' : 'times'} mr-1"></i>
                            ${tool.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                    
                    <!-- Tool Actions -->
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="flex justify-between items-center">
                            <button onclick="window.toolsComponent.viewToolDetails('${tool.id}')" 
                                    class="text-blue-600 hover:text-blue-800 text-sm">
                                <i class="fas fa-info-circle mr-1"></i>
                                View Details
                            </button>
                            <button onclick="window.toolsComponent.testTool('${tool.id}')" 
                                    class="text-green-600 hover:text-green-800 text-sm ${!tool.enabled ? 'opacity-50 cursor-not-allowed' : ''}"
                                    ${!tool.enabled ? 'disabled' : ''}>
                                <i class="fas fa-play mr-1"></i>
                                Test Tool
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getToolIcon(toolId) {
        const icons = {
            'convert': 'fas fa-exchange-alt',
            'compress': 'fas fa-compress-arrows-alt',
            'merge': 'fas fa-object-group',
            'split': 'fas fa-cut',
            'protect': 'fas fa-lock',
            'unlock': 'fas fa-unlock',
            'rotate': 'fas fa-redo',
            'watermark': 'fas fa-tint',
            'extract-text': 'fas fa-file-alt',
            'sign': 'fas fa-signature',
            'ocr': 'fas fa-eye',
            'pagenumber': 'fas fa-list-ol'
        };
        return icons[toolId] || 'fas fa-file-pdf';
    }

    getCategoryColor(category) {
        const colors = {
            'Conversion': 'bg-blue-100 text-blue-800',
            'Optimization': 'bg-green-100 text-green-800',
            'Organization': 'bg-purple-100 text-purple-800',
            'Security': 'bg-red-100 text-red-800',
            'Editing': 'bg-yellow-100 text-yellow-800',
            'Analysis': 'bg-indigo-100 text-indigo-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Tools</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the tools data.</p>
                    <button onclick="window.adminApp.loadPage('tools')" class="btn-primary">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    async postRender() {
        // Make component available to onclick handlers
        window.toolsComponent = this;
    }

    async toggleTool(toolId, enabled) {
        try {
            await window.adminAPI.updateToolStatus(toolId, enabled);
            
            // Update local tool status
            const tool = this.tools.find(t => t.id === toolId);
            if (tool) {
                tool.enabled = enabled;
            }
            
            window.showNotification(
                `Tool ${enabled ? 'enabled' : 'disabled'} successfully`, 
                'success'
            );
            
            // Update the stats
            this.updateStats();
            
        } catch (error) {
            // Revert toggle if API call failed
            const checkbox = document.getElementById(`tool-${toolId}`);
            if (checkbox) {
                checkbox.checked = !enabled;
            }
            
            window.showNotification(
                `Failed to ${enabled ? 'enable' : 'disable'} tool: ${error.message}`, 
                'error'
            );
        }
    }

    async enableAllTools() {
        window.showConfirmation(
            'Are you sure you want to enable all PDF tools?',
            async () => {
                try {
                    await window.adminAPI.enableAllTools();
                    window.showNotification('All tools enabled successfully', 'success');
                    window.adminApp.loadPage('tools', false);
                } catch (error) {
                    window.showNotification('Failed to enable all tools: ' + error.message, 'error');
                }
            }
        );
    }

    async disableAllTools() {
        window.showConfirmation(
            'Are you sure you want to disable all PDF tools? This will prevent users from using any PDF operations.',
            async () => {
                try {
                    await window.adminAPI.disableAllTools();
                    window.showNotification('All tools disabled successfully', 'warning');
                    window.adminApp.loadPage('tools', false);
                } catch (error) {
                    window.showNotification('Failed to disable all tools: ' + error.message, 'error');
                }
            }
        );
    }

    async enableByCategory(category) {
        const toolsInCategory = this.tools.filter(tool => tool.category === category);
        const disabledTools = toolsInCategory.filter(tool => !tool.enabled);
        
        if (disabledTools.length === 0) {
            window.showNotification(`All ${category} tools are already enabled`, 'info');
            return;
        }
        
        window.showConfirmation(
            `Enable all ${disabledTools.length} disabled tools in the ${category} category?`,
            async () => {
                try {
                    for (const tool of disabledTools) {
                        await window.adminAPI.updateToolStatus(tool.id, true);
                        tool.enabled = true;
                    }
                    
                    window.showNotification(`All ${category} tools enabled successfully`, 'success');
                    this.updateToolsDisplay();
                    this.updateStats();
                    
                } catch (error) {
                    window.showNotification(`Failed to enable ${category} tools: ${error.message}`, 'error');
                }
            }
        );
    }

    viewToolDetails(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Tool Details</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center">
                        <i class="${this.getToolIcon(tool.id)} text-2xl text-blue-500 mr-3"></i>
                        <div>
                            <h4 class="font-medium text-gray-900">${tool.name}</h4>
                            <p class="text-sm text-gray-600">${tool.id}</p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <p class="text-sm text-gray-600">${tool.description}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Category</label>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getCategoryColor(tool.category)}">
                                ${tool.category}
                            </span>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Status</label>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tool.enabled ? 'status-active' : 'status-inactive'}">
                                <i class="fas fa-${tool.enabled ? 'check' : 'times'} mr-1"></i>
                                ${tool.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Operation Cost</label>
                        <p class="text-sm font-medium text-gray-900">${window.utils.formatCurrency(tool.operationCost)}</p>
                    </div>
                </div>
                
                <div class="flex justify-end mt-6">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="btn-primary">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async testTool(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool || !tool.enabled) return;
        
        const progressNotification = window.showProgress(`Testing ${tool.name}...`);
        
        try {
            // Simulate tool test (you would implement actual testing)
            await new Promise(resolve => setTimeout(resolve, 2000));
            progressNotification.complete(`${tool.name} test completed successfully!`, 'success');
        } catch (error) {
            progressNotification.remove();
            window.showNotification(`${tool.name} test failed: ${error.message}`, 'error');
        }
    }

    updateStats() {
        const statsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4.gap-6.mb-8');
        if (statsContainer) {
            statsContainer.innerHTML = this.createToolsStatsHTML();
        }
    }

    updateToolsDisplay() {
        const toolsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
        if (toolsContainer) {
            toolsContainer.innerHTML = this.createToolsGridHTML();
        }
    }

    cleanup() {
        window.toolsComponent = null;
    }
}

// Export to global scope
window.ToolsComponent = ToolsComponent;