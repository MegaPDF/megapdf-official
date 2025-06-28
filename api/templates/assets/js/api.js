// Admin Panel API Communication Layer
class AdminAPI {
    constructor() {
        this.baseURL = window.API_BASE_URL || 'http://localhost:8080';
        this.token = localStorage.getItem('admin_token') || '';
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('admin_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = '';
        localStorage.removeItem('admin_token');
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            // Handle authentication errors
            if (response.status === 401) {
                this.clearToken();
                window.location.reload();
                return null;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (response && response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async validateToken() {
        try {
            const response = await this.request('/api/validate-token');
            return response && response.valid;
        } catch (error) {
            return false;
        }
    }

    async logout() {
        try {
            await this.request('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
        }
    }

    // Dashboard methods
    async getDashboard() {
        return await this.request('/api/admin/dashboard');
    }

    // Settings methods
    async getSettings(category = '') {
        const query = category ? `?category=${category}` : '';
        return await this.request(`/api/admin/settings${query}`);
    }

    async updateSettings(settings) {
        return await this.request('/api/admin/settings', {
            method: 'PUT',
            body: JSON.stringify({ settings }),
        });
    }

    // Configuration methods
    async getAppConfig() {
        return await this.request('/api/admin/config/app');
    }

    async getPayPalConfig() {
        return await this.request('/api/admin/config/paypal');
    }

    async getSMTPConfig() {
        return await this.request('/api/admin/config/smtp');
    }

    async getSecurityConfig() {
        return await this.request('/api/admin/config/security');
    }

    // User management methods
    async getUsers(page = 1, limit = 20) {
        return await this.request(`/api/admin/users?page=${page}&limit=${limit}`);
    }

    async getUser(userId) {
        return await this.request(`/api/admin/users/${userId}`);
    }

    async updateUser(userId, action, value) {
        return await this.request(`/api/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ action, value }),
        });
    }

    async deleteUser(userId) {
        return await this.request(`/api/admin/users/${userId}`, {
            method: 'DELETE',
        });
    }

    // PDF Tools management methods
    async getPDFTools() {
        return await this.request('/api/admin/tools');
    }

    async updateToolStatus(toolId, enabled) {
        return await this.request(`/api/admin/tools/${toolId}`, {
            method: 'PUT',
            body: JSON.stringify({ enabled }),
        });
    }

    async enableAllTools() {
        return await this.request('/api/admin/tools/enable-all', {
            method: 'POST',
        });
    }

    async disableAllTools() {
        return await this.request('/api/admin/tools/disable-all', {
            method: 'POST',
        });
    }

    // Pricing management methods
    async getPricing() {
        return await this.request('/api/admin/pricing');
    }

    async updatePricing(pricing) {
        return await this.request('/api/admin/pricing', {
            method: 'PUT',
            body: JSON.stringify(pricing),
        });
    }
}

// Create global API instance
window.adminAPI = new AdminAPI();