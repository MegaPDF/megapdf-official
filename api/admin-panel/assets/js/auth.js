// Admin Authentication Handler
class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        // Check if user is already authenticated
        const token = localStorage.getItem('admin_token');
        if (token) {
            const isValid = await window.adminAPI.validateToken();
            if (isValid) {
                this.isAuthenticated = true;
                this.showAdminPanel();
            } else {
                this.showLoginForm();
            }
        } else {
            this.showLoginForm();
        }
        
        this.hideLoadingScreen();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        
        // Hide previous errors
        errorDiv.classList.add('hidden');
        
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        try {
            const response = await window.adminAPI.login(email, password);
            
            if (response && response.token) {
                // Check if user is admin
                if (response.user && response.user.role === 'admin') {
                    this.isAuthenticated = true;
                    this.showAdminPanel();
                    window.showNotification('Login successful!', 'success');
                } else {
                    throw new Error('Admin access required');
                }
            } else {
                throw new Error('Invalid login credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = error.message || 'Login failed. Please try again.';
            errorDiv.classList.remove('hidden');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleLogout(event) {
        event.preventDefault();
        
        try {
            await window.adminAPI.logout();
            this.isAuthenticated = false;
            this.showLoginForm();
            window.showNotification('Logged out successfully', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            // Still logout locally even if server request fails
            window.adminAPI.clearToken();
            this.isAuthenticated = false;
            this.showLoginForm();
        }
    }

    showLoginForm() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
        
        // Clear form
        const form = document.getElementById('admin-login-form');
        if (form) {
            form.reset();
        }
        
        // Clear any errors
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }

    showAdminPanel() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        
        // Initialize admin panel if not already done
        if (window.adminApp && !window.adminApp.initialized) {
            window.adminApp.init();
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // Check authentication status
    isLoggedIn() {
        return this.isAuthenticated;
    }

    // Require authentication for certain actions
    requireAuth(callback) {
        if (this.isAuthenticated) {
            callback();
        } else {
            this.showLoginForm();
            window.showNotification('Please log in to access this feature', 'warning');
        }
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminAuth = new AdminAuth();
});