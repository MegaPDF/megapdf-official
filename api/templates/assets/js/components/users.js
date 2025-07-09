// Fixed Users Management Component with proper modal, delete handling, and pagination
class UsersComponent {
    constructor() {
        this.users = [];
        this.currentPage = 1;
        this.limit = 20;
        this.total = 0;
        this.loading = false;
        this.filters = {
            search: '',
            role: '',
            status: ''
        };
    }

    async render() {
        try {
            await this.loadUsers();
            return this.createUsersHTML();
        } catch (error) {
            console.error('Failed to load users:', error);
            return this.createErrorHTML();
        }
    }

    async loadUsers() {
        this.loading = true;
        const response = await window.adminAPI.getUsers(this.currentPage, this.limit, this.filters);
        this.users = response.users;
        this.total = response.total;
        this.currentPage = response.page;
        this.limit = response.limit;
        this.loading = false;
    }

    createUsersHTML() {
        return `
            <div class="page-transition">
                <!-- Enhanced Header -->
                <div class="mb-8">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                            <p class="text-gray-600 text-lg">Manage users and their accounts</p>
                            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span class="flex items-center">
                                    <i class="fas fa-users mr-2 text-blue-500"></i>
                                    ${window.utils.formatNumber(this.total)} Total Users
                                </span>
                                <span class="flex items-center">
                                    <i class="fas fa-clock mr-2 text-green-500"></i>
                                    Last updated: ${new Date().toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-3 mt-4 lg:mt-0">
                            <button onclick="window.usersComponent.exportUsers()" class="btn-secondary">
                                <i class="fas fa-download mr-2"></i>
                                Export Data
                            </button>
                            <button onclick="window.usersComponent.refreshUsers()" class="btn-primary">
                                <i class="fas fa-sync mr-2"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Search and Filters -->
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6" style="border: 1px solid #e5e7eb;">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <!-- Search Input -->
                        <div class="lg:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700 mb-3">Search Users</label>
                            <div class="relative">
                                <input type="text" id="user-search" placeholder="Search by name, email, or ID..." 
                                       class="form-input w-full pl-10 pr-4 py-3">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-search text-gray-400"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Role Filter -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-3">Role Filter</label>
                            <select id="role-filter" class="form-input w-full">
                                <option value="">All Roles</option>
                                <option value="user">👤 User</option>
                                <option value="admin">⚡ Admin</option>
                                <option value="moderator">🛡️ Moderator</option>
                            </select>
                        </div>

                        <!-- Status Filter -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-3">Status Filter</label>
                            <select id="status-filter" class="form-input w-full">
                                <option value="">All Status</option>
                                <option value="verified">✅ Verified</option>
                                <option value="unverified">❌ Unverified</option>
                            </select>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end">
                        <button onclick="window.usersComponent.applyFilters()" class="btn-primary px-8">
                            <i class="fas fa-filter mr-2"></i>
                            Apply Filters
                        </button>
                    </div>
                </div>

                <!-- Enhanced Users Table -->
                <div class="bg-white rounded-lg shadow-lg overflow-hidden" style="border: 1px solid #e5e7eb;">
                    <!-- Table Header -->
                    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">Users Directory</h3>
                                <p class="text-sm text-gray-600 mt-1">${window.utils.formatNumber(this.total)} users found</p>
                            </div>
                            <div class="flex items-center space-x-3 mt-3 sm:mt-0">
                                <span class="text-sm font-medium text-gray-600">Show:</span>
                                <select id="limit-select" onchange="window.usersComponent.changeLimit()" 
                                        class="form-input text-sm py-1 px-2 w-20">
                                    <option value="20" ${this.limit === 20 ? 'selected' : ''}>20</option>
                                    <option value="50" ${this.limit === 50 ? 'selected' : ''}>50</option>
                                    <option value="100" ${this.limit === 100 ? 'selected' : ''}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Table Content -->
                    <div class="overflow-x-auto">
                        <table class="admin-table w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Balance</th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Operations</th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Spent</th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Joined</th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200" id="users-table-body">
                                ${this.createUsersTableRows()}
                            </tbody>
                        </table>
                    </div>

                    <!-- Enhanced Pagination -->
                    <div id="pagination-container">
                        ${this.createPagination()}
                    </div>
                </div>
            </div>

            <!-- Fixed User Modal with proper positioning -->
            ${this.createUserModal()}
        `;
    }

    createUsersTableRows() {
        if (this.users.length === 0) {
            return `
                <tr>
                    <td colspan="8" class="px-6 py-16 text-center">
                        <div class="flex flex-col items-center space-y-4">
                            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-users text-4xl text-gray-400"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-600">No users found</h3>
                                <p class="text-gray-400 mt-1">Try adjusting your search criteria</p>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.users.map(user => `
            <tr class="hover:bg-gray-50 transition-colors duration-200">
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-md" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                <span class="text-white font-bold text-lg">${user.name.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="text-sm font-bold text-gray-900 truncate">${user.name}</div>
                            <div class="text-sm text-gray-500 truncate">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 
                                   user.role === 'moderator' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                                   'bg-gray-100 text-gray-700 border border-gray-200'}" style="font-size: 11px;">
                        ${user.role === 'admin' ? '⚡' : user.role === 'moderator' ? '🛡️' : '👤'} ${window.utils.capitalize(user.role)}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-gray-900">${window.utils.formatCurrency(user.balance)}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-semibold text-gray-700">${window.utils.formatNumber(user.totalOperations)}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-gray-900">${window.utils.formatCurrency(user.totalSpent)}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-600">${window.utils.formatDate(user.createdAt)}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                                 ${user.isEmailVerified ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}">
                        ${user.isEmailVerified ? '✅ Verified' : '❌ Unverified'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="window.usersComponent.viewUser('${user.id}')" 
                                class="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110" 
                                title="View User">
                            <i class="fas fa-eye text-sm"></i>
                        </button>
                        <button onclick="window.usersComponent.editUser('${user.id}')" 
                                class="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110" 
                                title="Edit User">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                            <button onclick="window.usersComponent.deleteUser('${user.id}', '${user.name}')" 
                                    class="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110" 
                                    title="Delete User">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    createPagination() {
        const totalPages = Math.ceil(this.total / this.limit);
        if (totalPages <= 1) return '';

        const startItem = (this.currentPage - 1) * this.limit + 1;
        const endItem = Math.min(this.currentPage * this.limit, this.total);

        // Create pagination controls
        let paginationHTML = `
            <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <!-- Results info -->
                    <div class="text-sm text-gray-600">
                        Showing <span class="font-bold text-gray-900">${startItem}</span>
                        to <span class="font-bold text-gray-900">${endItem}</span>
                        of <span class="font-bold text-gray-900">${this.total}</span> results
                    </div>
                    
                    <!-- Pagination controls -->
                    <div class="flex items-center space-x-2">
                        <!-- First page -->
                        <button onclick="window.usersComponent.goToPage(1)" 
                                ${this.currentPage <= 1 ? 'disabled' : ''} 
                                class="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200 ${this.currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:shadow-md'}"
                                title="First page">
                            <i class="fas fa-angle-double-left text-gray-600"></i>
                        </button>

                        <!-- Previous page -->
                        <button onclick="window.usersComponent.goToPage(${this.currentPage - 1})" 
                                ${this.currentPage <= 1 ? 'disabled' : ''} 
                                class="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200 ${this.currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:shadow-md'}"
                                title="Previous page">
                            <i class="fas fa-chevron-left text-gray-600"></i>
                        </button>
                        
                        <!-- Page numbers -->
                        ${this.createPageNumbers(totalPages)}
                        
                        <!-- Next page -->
                        <button onclick="window.usersComponent.goToPage(${this.currentPage + 1})" 
                                ${this.currentPage >= totalPages ? 'disabled' : ''} 
                                class="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200 ${this.currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:shadow-md'}"
                                title="Next page">
                            <i class="fas fa-chevron-right text-gray-600"></i>
                        </button>

                        <!-- Last page -->
                        <button onclick="window.usersComponent.goToPage(${totalPages})" 
                                ${this.currentPage >= totalPages ? 'disabled' : ''} 
                                class="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200 ${this.currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:shadow-md'}"
                                title="Last page">
                            <i class="fas fa-angle-double-right text-gray-600"></i>
                        </button>
                    </div>
                </div>

                <!-- Mobile pagination summary -->
                <div class="mt-4 sm:hidden">
                    <div class="text-center text-sm text-gray-600">
                        Page ${this.currentPage} of ${totalPages}
                    </div>
                </div>
            </div>
        `;

        return paginationHTML;
    }

    createPageNumbers(totalPages) {
        let pageNumbers = '';
        
        // Calculate which pages to show
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, this.currentPage + 2);
        
        // Adjust if we're near the beginning
        if (this.currentPage <= 3) {
            endPage = Math.min(5, totalPages);
        }
        
        // Adjust if we're near the end
        if (this.currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }

        // Add ellipsis and first page if needed
        if (startPage > 1) {
            pageNumbers += `
                <button onclick="window.usersComponent.goToPage(1)" 
                        class="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-400 hover:shadow-md font-semibold transition-all duration-200">
                    1
                </button>
            `;
            if (startPage > 2) {
                pageNumbers += `<span class="px-2 py-2 text-gray-500">...</span>`;
            }
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers += `
                <button onclick="window.usersComponent.goToPage(${i})" 
                        class="w-10 h-10 rounded-md border flex items-center justify-center font-semibold transition-all duration-200
                               ${i === this.currentPage ? 
                                 'bg-blue-600 border-blue-600 text-white shadow-md' : 
                                 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-400 hover:shadow-md'}">
                    ${i}
                </button>
            `;
        }

        // Add ellipsis and last page if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers += `<span class="px-2 py-2 text-gray-500">...</span>`;
            }
            pageNumbers += `
                <button onclick="window.usersComponent.goToPage(${totalPages})" 
                        class="w-10 h-10 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-400 hover:shadow-md font-semibold transition-all duration-200">
                    ${totalPages}
                </button>
            `;
        }

        return pageNumbers;
    }

    createUserModal() {
        return `
            <!-- Fixed Modal with proper positioning -->
            <div id="user-modal" class="hidden fixed inset-0 z-50" style="background-color: rgba(0, 0, 0, 0.5);">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <!-- Modal Header -->
                        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-xl font-bold text-gray-800" id="modal-title">Edit User</h3>
                                <button onclick="window.usersComponent.closeModal()" 
                                        class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center transition-all duration-200">
                                    <i class="fas fa-times text-gray-600"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Modal Content -->
                        <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <form id="user-form">
                                <div id="modal-content">
                                    <!-- Dynamic content will be loaded here -->
                                </div>
                                <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200" id="modal-buttons">
                                    <button type="button" onclick="window.usersComponent.closeModal()" class="btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" class="btn-primary">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="bg-white rounded-lg shadow-lg p-12 text-center max-w-md mx-auto mt-20">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-3">Failed to Load Users</h2>
                    <p class="text-gray-600 mb-6">There was an error loading the user data. Please try again.</p>
                    <button onclick="window.adminApp.loadPage('users')" class="btn-primary">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    async postRender() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality with debounce
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', window.utils.debounce(() => {
                this.filters.search = searchInput.value;
                this.applyFilters();
            }, 500));
        }

        // Filter change listeners
        const roleFilter = document.getElementById('role-filter');
        const statusFilter = document.getElementById('status-filter');
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => {
                this.filters.role = roleFilter.value;
                this.applyFilters();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filters.status = statusFilter.value;
                this.applyFilters();
            });
        }

        // Make methods available to onclick handlers
        window.usersComponent = this;
    }

    // User actions
    async viewUser(userId) {
        try {
            const user = await window.adminAPI.getUser(userId);
            this.showUserModal(user, 'view');
        } catch (error) {
            console.error('Error loading user:', error);
            window.showNotification('Failed to load user details', 'error');
        }
    }

    async editUser(userId) {
        try {
            const user = await window.adminAPI.getUser(userId);
            this.showUserModal(user, 'edit');
        } catch (error) {
            console.error('Error loading user:', error);
            window.showNotification('Failed to load user details', 'error');
        }
    }

    showUserModal(user, mode = 'edit') {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        const buttons = document.getElementById('modal-buttons');
        
        title.textContent = mode === 'view' ? 'User Details' : 'Edit User';
        
        content.innerHTML = `
            <div class="space-y-6">
                <!-- User Avatar and Basic Info -->
                <div class="text-center mb-6">
                    <div class="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                        <span class="text-white font-bold text-2xl">${user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800">${user.name}</h4>
                    <p class="text-gray-600">${user.email}</p>
                </div>
                
                <!-- Form Fields -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <input type="text" name="name" value="${user.name}" 
                               ${mode === 'view' ? 'readonly' : ''} 
                               class="form-input w-full ${mode === 'view' ? 'bg-gray-50' : ''}">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input type="email" name="email" value="${user.email}" 
                               ${mode === 'view' ? 'readonly' : ''} 
                               class="form-input w-full ${mode === 'view' ? 'bg-gray-50' : ''}">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">User Role</label>
                        <select name="role" ${mode === 'view' ? 'disabled' : ''} 
                                class="form-input w-full ${mode === 'view' ? 'bg-gray-50' : ''}">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>👤 User</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>⚡ Admin</option>
                            <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>🛡️ Moderator</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Account Balance</label>
                        <input type="number" name="balance" value="${user.balance}" step="0.01" 
                               ${mode === 'view' ? 'readonly' : ''} 
                               class="form-input w-full ${mode === 'view' ? 'bg-gray-50' : ''}">
                    </div>
                </div>
                
                <!-- Statistics (Read-only) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Total Operations</label>
                        <div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 font-semibold">
                            ${window.utils.formatNumber(user.totalOperations)}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Total Spent</label>
                        <div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 font-semibold">
                            ${window.utils.formatCurrency(user.totalSpent)}
                        </div>
                    </div>
                </div>
                
                <!-- Status Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Email Status</label>
                        <div class="flex items-center space-x-2">
                            <span class="inline-flex items-center px-3 py-2 rounded-md text-sm font-bold
                                         ${user.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${user.isEmailVerified ? '✅ Email Verified' : '❌ Email Unverified'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                        <div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 font-semibold">
                            ${window.utils.formatDate(user.createdAt, true)}
                        </div>
                    </div>
                </div>
                
                <input type="hidden" name="userId" value="${user.id}">
            </div>
        `;
        
        // Show/hide form buttons based on mode
        if (mode === 'view') {
            buttons.innerHTML = `
                <button type="button" onclick="window.usersComponent.closeModal()" class="btn-primary">
                    Close
                </button>
            `;
        } else {
            buttons.innerHTML = `
                <button type="button" onclick="window.usersComponent.closeModal()" class="btn-secondary">
                    Cancel
                </button>
                <button type="submit" class="btn-primary">
                    Save Changes
                </button>
            `;
        }
        
        modal.classList.remove('hidden');
        
        // Setup form submission
        if (mode === 'edit') {
            const form = document.getElementById('user-form');
            form.onsubmit = (e) => this.handleUserFormSubmit(e);
        }
    }

    async handleUserFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userId = formData.get('userId');
        const newRole = formData.get('role');
        const newBalance = parseFloat(formData.get('balance'));
        
        try {
            // Update role if changed
            const currentUser = this.users.find(u => u.id === userId);
            if (currentUser.role !== newRole) {
                await window.adminAPI.updateUser(userId, 'update_role', newRole);
            }
            
            // Update balance if changed
            if (currentUser.balance !== newBalance) {
                await window.adminAPI.updateUser(userId, 'update_balance', newBalance);
            }
            
            window.showNotification('User updated successfully', 'success');
            this.closeModal();
            this.refreshUsers();
            
        } catch (error) {
            console.error('Error updating user:', error);
            window.showNotification('Failed to update user: ' + error.message, 'error');
        }
    }

    closeModal() {
        const modal = document.getElementById('user-modal');
        modal.classList.add('hidden');
    }

    async deleteUser(userId, userName) {
        // Show detailed confirmation for user deletion
        const confirmMessage = `
            ⚠️ Delete User: ${userName}
            
            This will permanently remove:
            • User account and profile
            • Transaction history
            • API keys and sessions
            • All associated data
            
            This action cannot be undone!
            
            Are you sure you want to proceed?
        `;

        window.showConfirmation(
            confirmMessage,
            async () => {
                try {
                    // Show loading notification
                    const progressNotification = window.showProgress('Deleting user and associated data...');
                    
                    // First, try to clean up associated data
                    await this.cleanupUserData(userId);
                    
                    // Then delete the user
                    await window.adminAPI.deleteUser(userId);
                    
                    progressNotification.update('User deleted successfully', 'success');
                    
                    // Refresh the users list
                    this.refreshUsers();
                    
                } catch (error) {
                    console.error('Error deleting user:', error);
                    
                    // Handle foreign key constraint error specifically
                    if (error.message.includes('FOREIGN KEY constraint failed')) {
                        window.showNotification(
                            `Cannot delete user "${userName}" because they have active records (transactions, API keys, etc.). Please contact support for manual cleanup.`, 
                            'error', 
                            10000
                        );
                    } else {
                        window.showNotification('Failed to delete user: ' + error.message, 'error');
                    }
                }
            }
        );
    }

    async cleanupUserData(userId) {
        // This method would ideally clean up associated data
        // For now, we'll let the backend handle it
        // In a real implementation, you might:
        // - Delete user sessions
        // - Delete API keys
        // - Archive transactions instead of deleting
        // - etc.
        
        console.log('Cleaning up user data for user:', userId);
        // Implementation would depend on your backend API
    }

    // Pagination and filtering
    async goToPage(page) {
        const totalPages = Math.ceil(this.total / this.limit);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        await this.loadUsers();
        this.updateTable();
        
        // Scroll to top of table
        document.querySelector('.admin-table').scrollIntoView({ behavior: 'smooth' });
    }

    async changeLimit() {
        const limitSelect = document.getElementById('limit-select');
        this.limit = parseInt(limitSelect.value);
        this.currentPage = 1; // Reset to first page
        await this.loadUsers();
        this.updateTable();
    }

    async applyFilters() {
        this.currentPage = 1; // Reset to first page when filtering
        await this.loadUsers();
        this.updateTable();
    }

    async refreshUsers() {
        await this.loadUsers();
        this.updateTable();
        window.showNotification('Users refreshed successfully', 'success');
    }

    updateTable() {
        const tableBody = document.getElementById('users-table-body');
        const paginationContainer = document.getElementById('pagination-container');
        
        if (tableBody) {
            tableBody.innerHTML = this.createUsersTableRows();
        }
        
        if (paginationContainer) {
            paginationContainer.innerHTML = this.createPagination();
        }

        // Update user count in header
        const userCountElements = document.querySelectorAll('.text-sm.text-gray-600');
        userCountElements.forEach(el => {
            if (el.textContent.includes('users found')) {
                el.textContent = `${window.utils.formatNumber(this.total)} users found`;
            }
        });
    }

    exportUsers() {
        // Export users to CSV
        const csvData = this.users.map(user => ({
            Name: user.name,
            Email: user.email,
            Role: user.role,
            Balance: user.balance,
            'Total Operations': user.totalOperations,
            'Total Spent': user.totalSpent,
            'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
            'Joined': window.utils.formatDate(user.createdAt, true)
        }));
        
        const csv = this.convertToCSV(csvData);
        window.utils.downloadFile(csv, `users-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        window.showNotification('Users exported successfully', 'success');
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    cleanup() {
        // Cleanup when component is destroyed
        window.usersComponent = null;
    }
}

// Export to global scope
window.UsersComponent = UsersComponent;