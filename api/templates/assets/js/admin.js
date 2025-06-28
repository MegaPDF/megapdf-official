// Main Admin Application Controller
class AdminApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentComponent = null;
        this.initialized = false;
        this.components = {
            dashboard: DashboardComponent,
            users: UsersComponent,
            settings: SettingsComponent,
            pricing: PricingComponent,
            tools: ToolsComponent
        };
    }

    async init() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.setupSidebar();
        await this.loadPage('dashboard');
        this.initialized = true;
    }

    setupEventListeners() {
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    this.loadPage(page);
                }
            });
        });

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');
            
            if (window.innerWidth < 1024 && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target) &&
                !sidebar.classList.contains('-translate-x-full')) {
                this.closeSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                this.openSidebar();
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });
    }

    setupSidebar() {
        // Set initial active nav item
        this.updateActiveNavItem('dashboard');
    }

    async loadPage(pageName, pushState = true) {
        if (!this.components[pageName]) {
            console.error(`Component not found: ${pageName}`);
            this.showError(`Page "${pageName}" not found`);
            return;
        }

        // Show loading state
        this.showLoading();

        try {
            // Cleanup previous component
            if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
                this.currentComponent.cleanup();
            }

            // Create new component instance
            this.currentComponent = new this.components[pageName]();
            
            // Render component
            const content = await this.currentComponent.render();
            this.renderContent(content);

            // Post-render setup
            if (typeof this.currentComponent.postRender === 'function') {
                await this.currentComponent.postRender();
            }

            // Update navigation
            this.currentPage = pageName;
            this.updateActiveNavItem(pageName);

            // Update browser history
            if (pushState) {
                history.pushState({ page: pageName }, '', `#${pageName}`);
            }

            // Update page title
            document.title = `${this.getPageTitle(pageName)} - MegaPDF Admin`;

        } catch (error) {
            console.error(`Failed to load page ${pageName}:`, error);
            this.showError(`Failed to load ${pageName} page`);
        } finally {
            this.hideLoading();
        }
    }

    renderContent(html) {
        const contentContainer = document.getElementById('page-content');
        if (contentContainer) {
            contentContainer.innerHTML = html;
        }
    }

    showLoading() {
        const contentContainer = document.getElementById('page-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="flex items-center justify-center py-12">
                    <div class="spinner mr-3"></div>
                    <span class="text-gray-600">Loading...</span>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading is hidden when content is rendered
    }

    showError(message) {
        const contentContainer = document.getElementById('page-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="window.adminApp.loadPage('dashboard')" class="btn-primary">
                        <i class="fas fa-home mr-2"></i>
                        Go to Dashboard
                    </button>
                </div>
            `;
        }
    }

    updateActiveNavItem(pageName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active', 'bg-gray-800', 'text-white');
            item.classList.add('text-gray-300');
        });

        // Add active class to current nav item
        const activeItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeItem) {
            activeItem.classList.add('active', 'bg-gray-800', 'text-white');
            activeItem.classList.remove('text-gray-300');
        }
    }

    getPageTitle(pageName) {
        const titles = {
            dashboard: 'Dashboard',
            users: 'User Management',
            settings: 'Settings',
            pricing: 'Pricing Configuration',
            tools: 'PDF Tools Management'
        };
        return titles[pageName] || 'Admin Panel';
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('-translate-x-full')) {
            this.openSidebar();
        } else {
            this.closeSidebar();
        }
    }

    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('-translate-x-full');
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 1024) {
            sidebar.classList.add('-translate-x-full');
        }
    }

    // Utility methods for components
    refreshCurrentPage() {
        this.loadPage(this.currentPage, false);
    }

    navigateTo(pageName) {
        this.loadPage(pageName);
    }

    getCurrentPage() {
        return this.currentPage;
    }

    // Global error handler
    handleError(error, context = '') {
        console.error(`Admin App Error${context ? ` (${context})` : ''}:`, error);
        
        let message = 'An unexpected error occurred';
        if (error.message) {
            message = error.message;
        }
        
        window.showNotification(message, 'error');
    }

    // Check if user has permission for action
    hasPermission(action) {
        // For now, all admin users have all permissions
        return true;
    }

    // Confirm dangerous actions
    confirmAction(message, action) {
        window.showConfirmation(message, action);
    }
}

// Global utility functions for components
window.adminUtils = {
    refreshPage: () => window.adminApp.refreshCurrentPage(),
    navigateTo: (page) => window.adminApp.navigateTo(page),
    handleError: (error, context) => window.adminApp.handleError(error, context),
    hasPermission: (action) => window.adminApp.hasPermission(action),
    confirmAction: (message, action) => window.adminApp.confirmAction(message, action)
};

// Initialize admin app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
    
    // Handle initial route from URL hash
    const hash = window.location.hash.slice(1);
    if (hash && window.adminApp.components[hash]) {
        window.adminApp.currentPage = hash;
    }
});

// Handle authentication completion
document.addEventListener('authCompleted', () => {
    if (window.adminApp && !window.adminApp.initialized) {
        window.adminApp.init();
    }
});