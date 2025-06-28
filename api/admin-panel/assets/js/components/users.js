// Users Management Component
class UsersComponent {
    constructor() {
        this.users = [];
        this.currentPage = 1;
        this.limit = 20;
        this.total = 0;
        this.loading = false;
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
        const response = await window.adminAPI.getUsers(this.currentPage, this.limit);
        this.users = response.users;
        this.total = response.total;
        this.currentPage = response.page;
        this.limit = response.limit;
        this.loading = false;
    }

    createUsersHTML() {
        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
                            <p class="text-gray-600">Manage users and their accounts</p>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="this.exportUsers()" class="btn-secondary">
                                <i class="fas fa-download mr-2"></i>
                                Export
                            </button>
                            <button onclick="this.refreshUsers()" class="btn-primary">
                                <i class="fas fa-sync mr-2"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                            <div class="relative">
                                <input type="text" id="user-search" placeholder="Search by name or email..." 
                                       class="form-input w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md">
                                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Role Filter</label>
                            <select id="role-filter" class="form-input w-full">
                                <option value="">All Roles</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                            <select id="status-filter" class="form-input w-full">
                                <option value="">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                            <button onclick="this.applyFilters()" class="btn-primary w-full">
                                <i class="fas fa-filter mr-2"></i>
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Users Table -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-medium text-gray-900">
                                Users (${window.utils.formatNumber(this.total)})
                            </h3>
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-500">Show:</span>
                                <select id="limit-select" onchange="this.changeLimit()" class="text-sm border border-gray-300 rounded">
                                    <option value="20" ${this.limit === 20 ? 'selected' : ''}>20</option>
                                    <option value="50" ${this.limit === 50 ? 'selected' : ''}>50</option>
                                    <option value="100" ${this.limit === 100 ? 'selected' : ''}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="admin-table">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Balance</th>
                                    <th>Operations</th>
                                    <th>Total Spent</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.createUsersTableRows()}
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    ${this.createPagination()}
                </div>
            </div>

            <!-- User Edit Modal -->
            ${this.createUserModal()}
        `;
    }

    createUsersTableRows() {
        if (this.users.length === 0) {
            return `
                <tr>
                    <td colspan="8" class="text-center py-8 text-gray-500">
                        No users found
                    </td>
                </tr>
            `;
        }

        return this.users.map(user => `
            <tr class="hover:bg-gray-50">
                <td>
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <i class="fas fa-user text-gray-600"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.name}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                   user.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 
                                   'bg-gray-100 text-gray-800'}">
                        ${window.utils.capitalize(user.role)}
                    </span>
                </td>
                <td class="text-sm text-gray-900">${window.utils.formatCurrency(user.balance)}</td>
                <td class="text-sm text-gray-900">${window.utils.formatNumber(user.totalOperations)}</td>
                <td class="text-sm text-gray-900">${window.utils.formatCurrency(user.totalSpent)}</td>
                <td class="text-sm text-gray-500">${window.utils.formatDate(user.createdAt)}</td>
                <td>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                 ${user.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${user.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                </td>
                <td>
                    <div class="flex items-center space-x-2">
                        <button onclick="this.viewUser('${user.id}')" 
                                class="text-blue-600 hover:text-blue-900" title="View User">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="this.editUser('${user.id}')" 
                                class="text-green-600 hover:text-green-900" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                            <button onclick="this.deleteUser('${user.id}', '${user.name}')" 
                                    class="text-red-600 hover:text-red-900" title="Delete User">
                                <i class="fas fa-trash"></i>
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

        let paginationHTML = `
            <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button onclick="this.goToPage(${this.currentPage - 1})" 
                            ${this.currentPage <= 1 ? 'disabled' : ''} 
                            class="btn-secondary ${this.currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                        Previous
                    </button>
                    <button onclick="this.goToPage(${this.currentPage + 1})" 
                            ${this.currentPage >= totalPages ? 'disabled' : ''} 
                            class="btn-secondary ${this.currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                        Next
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Showing <span class="font-medium">${(this.currentPage - 1) * this.limit + 1}</span>
                            to <span class="font-medium">${Math.min(this.currentPage * this.limit, this.total)}</span>
                            of <span class="font-medium">${this.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        `;

        // Previous button
        paginationHTML += `
            <button onclick="this.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage <= 1 ? 'disabled' : ''} 
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${this.currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="this.goToPage(${i})" 
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium 
                               ${i === this.currentPage ? 'bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="this.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage >= totalPages ? 'disabled' : ''} 
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${this.currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationHTML += `
                        </nav>
                    </div>
                </div>
            </div>
        `;

        return paginationHTML;
    }

    createUserModal() {
        return `
            <div id="user-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-medium text-gray-900" id="modal-title">Edit User</h3>
                        <button onclick="this.closeModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="user-form">
                        <div id="modal-content">
                            <!-- Dynamic content will be loaded here -->
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="this.closeModal()" class="btn-secondary">Cancel</button>
                            <button type="submit" class="btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Users</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the user data.</p>
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
        // Search functionality
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', window.utils.debounce(() => {
                this.applyFilters();
            }, 500));
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
            window.showNotification('Failed to load user details', 'error');
        }
    }

    async editUser(userId) {
        try {
            const user = await window.adminAPI.getUser(userId);
            this.showUserModal(user, 'edit');
        } catch (error) {
            window.showNotification('Failed to load user details', 'error');
        }
    }

    showUserModal(user, mode = 'edit') {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = mode === 'view' ? 'User Details' : 'Edit User';
        
        content.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input type="text" name="name" value="${user.name}" 
                               ${mode === 'view' ? 'readonly' : ''} 
                               class="form-input w-full">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" name="email" value="${user.email}" 
                               ${mode === 'view' ? 'readonly' : ''} 
                               class="form-input w-full">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select name="role" ${mode === 'view' ? 'disabled' : ''} class="form-input w-full">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Balance</label>
                        <input type="number" name="balance" value="${user.balance}" step="0.01" 
                               ${mode === 'view' ? 'readonly' : ''} 
                               class="form-input w-full">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Total Operations</label>
                        <input type="text" value="${window.utils.formatNumber(user.totalOperations)}" readonly 
                               class="form-input w-full bg-gray-50">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Total Spent</label>
                        <input type="text" value="${window.utils.formatCurrency(user.totalSpent)}" readonly 
                               class="form-input w-full bg-gray-50">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email Verified</label>
                        <div class="text-sm ${user.isEmailVerified ? 'text-green-600' : 'text-red-600'}">
                            <i class="fas fa-${user.isEmailVerified ? 'check-circle' : 'times-circle'} mr-1"></i>
                            ${user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Joined</label>
                        <div class="text-sm text-gray-600">${window.utils.formatDate(user.createdAt, true)}</div>
                    </div>
                </div>
                
                <input type="hidden" name="userId" value="${user.id}">
            </div>
        `;
        
        // Show/hide form buttons based on mode
        const formButtons = modal.querySelector('.flex.justify-end');
        if (mode === 'view') {
            formButtons.innerHTML = '<button type="button" onclick="window.usersComponent.closeModal()" class="btn-primary">Close</button>';
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
            window.showNotification('Failed to update user: ' + error.message, 'error');
        }
    }

    closeModal() {
        const modal = document.getElementById('user-modal');
        modal.classList.add('hidden');
    }

    async deleteUser(userId, userName) {
        window.showConfirmation(
            `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
            async () => {
                try {
                    await window.adminAPI.deleteUser(userId);
                    window.showNotification('User deleted successfully', 'success');
                    this.refreshUsers();
                } catch (error) {
                    window.showNotification('Failed to delete user: ' + error.message, 'error');
                }
            }
        );
    }

    // Pagination and filtering
    async goToPage(page) {
        const totalPages = Math.ceil(this.total / this.limit);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        await this.loadUsers();
        this.updateTable();
    }

    async changeLimit() {
        const limitSelect = document.getElementById('limit-select');
        this.limit = parseInt(limitSelect.value);
        this.currentPage = 1;
        await this.loadUsers();
        this.updateTable();
    }

    async applyFilters() {
        // Implementation for filters would go here
        this.currentPage = 1;
        await this.loadUsers();
        this.updateTable();
    }

    async refreshUsers() {
        await this.loadUsers();
        this.updateTable();
        window.showNotification('Users refreshed', 'success');
    }

    updateTable() {
        const tableBody = document.querySelector('.admin-table tbody');
        const pagination = document.querySelector('.bg-white.px-4.py-3');
        
        if (tableBody) {
            tableBody.innerHTML = this.createUsersTableRows();
        }
        
        if (pagination) {
            pagination.outerHTML = this.createPagination();
        }
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
        window.utils.downloadFile(csv, 'users.csv', 'text/csv');
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