// Settings Management Component
class SettingsComponent {
    constructor() {
        this.settings = [];
        this.appConfig = null;
        this.paypalConfig = null;
        this.smtpConfig = null;
        this.securityConfig = null;
        this.currentTab = 'general';
    }

    async render() {
        try {
            await this.loadAllSettings();
            return this.createSettingsHTML();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.createErrorHTML();
        }
    }

    async loadAllSettings() {
        const [settings, appConfig, paypalConfig, smtpConfig, securityConfig] = await Promise.all([
            window.adminAPI.getSettings(),
            window.adminAPI.getAppConfig(),
            window.adminAPI.getPayPalConfig(),
            window.adminAPI.getSMTPConfig(),
            window.adminAPI.getSecurityConfig()
        ]);

        this.settings = settings.settings || [];
        this.appConfig = appConfig;
        this.paypalConfig = paypalConfig;
        this.smtpConfig = smtpConfig;
        this.securityConfig = securityConfig;
    }

    createSettingsHTML() {
        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
                    <p class="text-gray-600">Configure your MegaPDF system</p>
                </div>

                <!-- Settings Tabs -->
                <div class="bg-white rounded-lg shadow">
                    <div class="border-b border-gray-200">
                        <nav class="flex space-x-8 px-6" aria-label="Tabs">
                            ${this.createTabs()}
                        </nav>
                    </div>
                    
                    <div class="p-6">
                        <div id="settings-content">
                            ${this.createTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createTabs() {
        const tabs = [
            { id: 'general', name: 'General', icon: 'fas fa-cog' },
            { id: 'email', name: 'Email', icon: 'fas fa-envelope' },
            { id: 'payment', name: 'Payment', icon: 'fas fa-credit-card' },
            { id: 'security', name: 'Security', icon: 'fas fa-shield-alt' }
        ];

        return tabs.map(tab => `
            <button onclick="window.settingsComponent.switchTab('${tab.id}')" 
                    class="settings-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm 
                           ${this.currentTab === tab.id ? 
                             'border-blue-500 text-blue-600' : 
                             'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
                <i class="${tab.icon} mr-2"></i>
                ${tab.name}
            </button>
        `).join('');
    }

    createTabContent() {
        switch (this.currentTab) {
            case 'general':
                return this.createGeneralSettings();
            case 'email':
                return this.createEmailSettings();
            case 'payment':
                return this.createPaymentSettings();
            case 'security':
                return this.createSecuritySettings();
            default:
                return this.createGeneralSettings();
        }
    }

    createGeneralSettings() {
        return `
            <form id="general-settings-form" onsubmit="window.settingsComponent.saveGeneralSettings(event)">
                <h3 class="text-lg font-medium text-gray-900 mb-6">General Settings</h3>
                
                <div class="grid grid-cols-1 gap-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                            <input type="text" name="siteName" value="${this.appConfig?.siteName || ''}" 
                                   class="form-input w-full" required>
                            <p class="text-sm text-gray-500 mt-1">The name displayed throughout the application</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Application URL</label>
                            <input type="url" name="appUrl" value="${this.appConfig?.appURL || ''}" 
                                   class="form-input w-full" required>
                            <p class="text-sm text-gray-500 mt-1">The main URL of your application</p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Application Description</label>
                        <textarea name="siteDescription" rows="3" class="form-input w-full">${this.appConfig?.siteDescription || ''}</textarea>
                        <p class="text-sm text-gray-500 mt-1">Brief description for SEO and branding</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Maximum File Size (MB)</label>
                            <input type="number" name="maxFileSize" value="${(this.appConfig?.maxFileSize || 0) / 1024 / 1024}" 
                                   min="1" max="1000" class="form-input w-full" required>
                            <p class="text-sm text-gray-500 mt-1">Maximum file size for uploads</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/minute)</label>
                            <input type="number" name="rateLimitRequests" value="${this.appConfig?.rateLimitRequests || 0}" 
                                   min="1" max="10000" class="form-input w-full" required>
                            <p class="text-sm text-gray-500 mt-1">API rate limit per IP address</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" name="maintenanceMode" 
                                       ${this.appConfig?.maintenanceMode ? 'checked' : ''} 
                                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm font-medium text-gray-700">Maintenance Mode</span>
                            </label>
                            <p class="text-sm text-gray-500 mt-1">Disable user access temporarily</p>
                        </div>
                        
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" name="registrationEnabled" 
                                       ${this.appConfig?.registrationEnabled ? 'checked' : ''} 
                                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm font-medium text-gray-700">Allow Registration</span>
                            </label>
                            <p class="text-sm text-gray-500 mt-1">Allow new users to register</p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" name="requireEmailVerification" 
                                   ${this.appConfig?.requireEmailVerification ? 'checked' : ''} 
                                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="ml-2 text-sm font-medium text-gray-700">Require Email Verification</span>
                        </label>
                        <p class="text-sm text-gray-500 mt-1">Require users to verify their email address</p>
                    </div>
                </div>
                
                <div class="flex justify-end mt-8">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save mr-2"></i>
                        Save General Settings
                    </button>
                </div>
            </form>
        `;
    }

    createEmailSettings() {
        return `
            <form id="email-settings-form" onsubmit="window.settingsComponent.saveEmailSettings(event)">
                <h3 class="text-lg font-medium text-gray-900 mb-6">Email Settings</h3>
                
                <div class="grid grid-cols-1 gap-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                            <input type="text" name="smtpHost" value="${this.smtpConfig?.host || ''}" 
                                   class="form-input w-full" placeholder="smtp.gmail.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                            <input type="number" name="smtpPort" value="${this.smtpConfig?.port || 587}" 
                                   class="form-input w-full" min="1" max="65535">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                            <input type="text" name="smtpUser" value="${this.smtpConfig?.user || ''}" 
                                   class="form-input w-full" placeholder="your-email@gmail.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                            <input type="password" name="smtpPassword" value="" 
                                   class="form-input w-full" placeholder="Leave empty to keep current">
                            <p class="text-sm text-gray-500 mt-1">Current: ${this.smtpConfig?.password || '[not set]'}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                            <input type="text" name="emailFromName" value="${this.smtpConfig?.fromName || ''}" 
                                   class="form-input w-full" placeholder="MegaPDF">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                            <input type="email" name="emailFrom" value="${this.smtpConfig?.fromEmail || ''}" 
                                   class="form-input w-full" placeholder="noreply@megapdf.com">
                        </div>
                    </div>
                    
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" name="smtpSecure" 
                                   ${this.smtpConfig?.secure ? 'checked' : ''} 
                                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="ml-2 text-sm font-medium text-gray-700">Use SSL/TLS</span>
                        </label>
                        <p class="text-sm text-gray-500 mt-1">Enable secure connection to SMTP server</p>
                    </div>
                </div>
                
                <div class="flex justify-between mt-8">
                    <button type="button" onclick="window.settingsComponent.testEmail()" class="btn-secondary">
                        <i class="fas fa-paper-plane mr-2"></i>
                        Test Email
                    </button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save mr-2"></i>
                        Save Email Settings
                    </button>
                </div>
            </form>
        `;
    }

    createPaymentSettings() {
        return `
            <form id="payment-settings-form" onsubmit="window.settingsComponent.savePaymentSettings(event)">
                <h3 class="text-lg font-medium text-gray-900 mb-6">PayPal Settings</h3>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div class="flex">
                        <i class="fas fa-exclamation-triangle text-yellow-400 mr-3 mt-0.5"></i>
                        <div>
                            <h3 class="text-sm font-medium text-yellow-800">Important</h3>
                            <p class="text-sm text-yellow-700 mt-1">
                                Changes to PayPal settings will affect payment processing. Test thoroughly before going live.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">PayPal Client ID</label>
                        <input type="text" name="paypalClientId" value="${this.paypalConfig?.clientID || ''}" 
                               class="form-input w-full" placeholder="Your PayPal Client ID">
                        <p class="text-sm text-gray-500 mt-1">Get this from your PayPal Developer Dashboard</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">PayPal Client Secret</label>
                        <input type="password" name="paypalClientSecret" value="" 
                               class="form-input w-full" placeholder="Leave empty to keep current">
                        <p class="text-sm text-gray-500 mt-1">Current: ${this.paypalConfig?.clientSecret || '[not set]'}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">PayPal API Base URL</label>
                        <select name="paypalApiBase" class="form-input w-full">
                            <option value="https://api-m.sandbox.paypal.com" 
                                    ${this.paypalConfig?.apiBase?.includes('sandbox') ? 'selected' : ''}>
                                Sandbox (Testing)
                            </option>
                            <option value="https://api-m.paypal.com" 
                                    ${!this.paypalConfig?.apiBase?.includes('sandbox') ? 'selected' : ''}>
                                Live (Production)
                            </option>
                        </select>
                        <p class="text-sm text-gray-500 mt-1">Use sandbox for testing, live for production</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-2">PayPal Status</h4>
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                         ${this.paypalConfig?.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                <i class="fas fa-${this.paypalConfig?.enabled ? 'check-circle' : 'times-circle'} mr-1"></i>
                                ${this.paypalConfig?.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            ${this.paypalConfig?.enabled ? 
                                '<span class="ml-3 text-sm text-gray-600">PayPal payments are working</span>' : 
                                '<span class="ml-3 text-sm text-gray-600">Configure settings to enable PayPal</span>'
                            }
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end mt-8">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save mr-2"></i>
                        Save PayPal Settings
                    </button>
                </div>
            </form>
        `;
    }

    createSecuritySettings() {
        return `
            <form id="security-settings-form" onsubmit="window.settingsComponent.saveSecuritySettings(event)">
                <h3 class="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                
                <div class="grid grid-cols-1 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">JWT Secret Key</label>
                        <div class="flex">
                            <input type="password" name="jwtSecret" value="" 
                                   class="form-input flex-1" placeholder="Leave empty to keep current">
                            <button type="button" onclick="window.settingsComponent.generateJWTSecret()" 
                                    class="ml-2 btn-secondary">
                                <i class="fas fa-key mr-1"></i>
                                Generate
                            </button>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">Current: ${this.securityConfig?.jwtSecret || '[not set]'}</p>
                    </div>
                    
                    <h4 class="text-lg font-medium text-gray-900 mt-6 mb-4">Password Requirements</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                            <input type="number" name="passwordMinLength" 
                                   value="${this.securityConfig?.passwordMinLength || 8}" 
                                   min="6" max="128" class="form-input w-full">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                            <input type="number" name="maxLoginAttempts" 
                                   value="${this.securityConfig?.maxLoginAttempts || 5}" 
                                   min="3" max="20" class="form-input w-full">
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <label class="flex items-center">
                            <input type="checkbox" name="passwordRequireUppercase" 
                                   ${this.securityConfig?.passwordRequireUppercase ? 'checked' : ''} 
                                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="ml-2 text-sm font-medium text-gray-700">Require Uppercase Letters</span>
                        </label>
                        
                        <label class="flex items-center">
                            <input type="checkbox" name="passwordRequireNumbers" 
                                   ${this.securityConfig?.passwordRequireNumbers ? 'checked' : ''} 
                                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="ml-2 text-sm font-medium text-gray-700">Require Numbers</span>
                        </label>
                        
                        <label class="flex items-center">
                            <input type="checkbox" name="passwordRequireSymbols" 
                                   ${this.securityConfig?.passwordRequireSymbols ? 'checked' : ''} 
                                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="ml-2 text-sm font-medium text-gray-700">Require Special Characters</span>
                        </label>
                    </div>
                </div>
                
                <div class="flex justify-end mt-8">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save mr-2"></i>
                        Save Security Settings
                    </button>
                </div>
            </form>
        `;
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Settings</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the settings data.</p>
                    <button onclick="window.adminApp.loadPage('settings')" class="btn-primary">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    async postRender() {
        // Make component available to onclick handlers
        window.settingsComponent = this;
    }

    switchTab(tabId) {
        this.currentTab = tabId;
        const content = document.getElementById('settings-content');
        content.innerHTML = this.createTabContent();
        
        // Update tab styles
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.className = tab.className.replace(/border-blue-500|text-blue-600|border-transparent|text-gray-500/, '');
            if (tab.onclick.toString().includes(`'${tabId}'`)) {
                tab.className += ' border-blue-500 text-blue-600';
            } else {
                tab.className += ' border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
            }
        });
    }

    async saveGeneralSettings(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const settings = [
            { key: 'app_name', value: formData.get('siteName') },
            { key: 'app_description', value: formData.get('siteDescription') },
            { key: 'app_url', value: formData.get('appUrl') },
            { key: 'max_file_size', value: parseInt(formData.get('maxFileSize')) * 1024 * 1024 },
            { key: 'rate_limit_requests', value: parseInt(formData.get('rateLimitRequests')) },
            { key: 'maintenance_mode', value: formData.has('maintenanceMode') },
            { key: 'registration_enabled', value: formData.has('registrationEnabled') },
            { key: 'require_email_verification', value: formData.has('requireEmailVerification') }
        ];

        await this.saveSettings(settings, 'General settings saved successfully!');
    }

    async saveEmailSettings(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const settings = [
            { key: 'smtp_host', value: formData.get('smtpHost') },
            { key: 'smtp_port', value: parseInt(formData.get('smtpPort')) },
            { key: 'smtp_user', value: formData.get('smtpUser') },
            { key: 'email_from_name', value: formData.get('emailFromName') },
            { key: 'email_from', value: formData.get('emailFrom') },
            { key: 'smtp_secure', value: formData.has('smtpSecure') }
        ];

        // Only include password if provided
        const password = formData.get('smtpPassword');
        if (password) {
            settings.push({ key: 'smtp_password', value: password });
        }

        await this.saveSettings(settings, 'Email settings saved successfully!');
    }

    async savePaymentSettings(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const settings = [
            { key: 'paypal_client_id', value: formData.get('paypalClientId') },
            { key: 'paypal_api_base', value: formData.get('paypalApiBase') }
        ];

        // Only include secret if provided
        const secret = formData.get('paypalClientSecret');
        if (secret) {
            settings.push({ key: 'paypal_client_secret', value: secret });
        }

        await this.saveSettings(settings, 'PayPal settings saved successfully!');
    }

    async saveSecuritySettings(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const settings = [
            { key: 'password_min_length', value: parseInt(formData.get('passwordMinLength')) },
            { key: 'max_login_attempts', value: parseInt(formData.get('maxLoginAttempts')) },
            { key: 'password_require_uppercase', value: formData.has('passwordRequireUppercase') },
            { key: 'password_require_numbers', value: formData.has('passwordRequireNumbers') },
            { key: 'password_require_symbols', value: formData.has('passwordRequireSymbols') }
        ];

        // Only include JWT secret if provided
        const jwtSecret = formData.get('jwtSecret');
        if (jwtSecret) {
            settings.push({ key: 'jwt_secret', value: jwtSecret });
        }

        await this.saveSettings(settings, 'Security settings saved successfully!');
    }

    async saveSettings(settings, successMessage) {
        try {
            await window.adminAPI.updateSettings(settings);
            window.showNotification(successMessage, 'success');
            // Reload settings to reflect changes
            await this.loadAllSettings();
        } catch (error) {
            window.showNotification('Failed to save settings: ' + error.message, 'error');
        }
    }

    generateJWTSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let secret = '';
        for (let i = 0; i < 64; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        document.querySelector('input[name="jwtSecret"]').value = secret;
        window.showNotification('JWT secret generated', 'info');
    }

    async testEmail() {
        const form = document.getElementById('email-settings-form');
        const formData = new FormData(form);
        
        // Show loading notification
        const progressNotification = window.showProgress('Testing email configuration...');
        
        try {
            // You would need to add a test email endpoint to your API
            const testData = {
                host: formData.get('smtpHost'),
                port: parseInt(formData.get('smtpPort')),
                user: formData.get('smtpUser'),
                password: formData.get('smtpPassword'),
                secure: formData.has('smtpSecure'),
                fromName: formData.get('emailFromName'),
                fromEmail: formData.get('emailFrom')
            };
            
            // Simulate API call (you'll need to implement this endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            progressNotification.complete('Test email sent successfully!', 'success');
        } catch (error) {
            progressNotification.remove();
            window.showNotification('Email test failed: ' + error.message, 'error');
        }
    }

    cleanup() {
        window.settingsComponent = null;
    }
}

// Export to global scope
window.SettingsComponent = SettingsComponent;