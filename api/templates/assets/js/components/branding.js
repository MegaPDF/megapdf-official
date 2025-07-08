// Create this file: api/templates/assets/js/components/branding.js

// Admin Panel Branding Management Component
class BrandingComponent {
    constructor() {
        this.branding = null;
        this.unsavedChanges = false;
    }

    async render() {
        try {
            this.branding = await window.adminAPI.getBranding();
            return this.createBrandingHTML();
        } catch (error) {
            console.error('Failed to load branding:', error);
            return this.createErrorHTML();
        }
    }

    createBrandingHTML() {
        return `
            <div class="page-transition">
                <!-- Page Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Branding Management</h1>
                    <p class="text-gray-600">Configure your app's branding, logos, and identity</p>
                </div>

                <!-- Branding Form -->
                <form id="branding-form" onsubmit="window.brandingComponent.saveBranding(event)">
                    <div class="space-y-8">
                        
                        <!-- Basic App Information -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        App Name *
                                    </label>
                                    <input type="text" name="appName" 
                                           value="${this.escapeHtml(this.branding?.appName || '')}" 
                                           maxlength="100" required
                                           class="form-input w-full" 
                                           placeholder="MegaPDF">
                                    <p class="text-sm text-gray-500 mt-1">
                                        The name of your application (max 100 characters)
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        App Tagline
                                    </label>
                                    <input type="text" name="appTagline" 
                                           value="${this.escapeHtml(this.branding?.appTagline || '')}" 
                                           maxlength="200"
                                           class="form-input w-full" 
                                           placeholder="Transform your PDFs with ease">
                                    <p class="text-sm text-gray-500 mt-1">
                                        Short tagline for your app (max 200 characters)
                                    </p>
                                </div>
                                
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        App Description *
                                    </label>
                                    <textarea name="appDescription" rows="3" 
                                              maxlength="500" required
                                              class="form-input w-full" 
                                              placeholder="Professional PDF tools and document processing platform">${this.escapeHtml(this.branding?.appDescription || '')}</textarea>
                                    <p class="text-sm text-gray-500 mt-1">
                                        Brief description of your app (max 500 characters)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Logos & Icons -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-6">Logos & Icons</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Logo URL
                                    </label>
                                    <input type="url" name="logoUrl" 
                                           value="${this.escapeHtml(this.branding?.logoUrl || '')}" 
                                           class="form-input w-full" 
                                           placeholder="/images/logo.png">
                                    <p class="text-sm text-gray-500 mt-1">
                                        URL to your main logo image
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Logo Alt Text
                                    </label>
                                    <input type="text" name="logoAltText" 
                                           value="${this.escapeHtml(this.branding?.logoAltText || '')}" 
                                           class="form-input w-full" 
                                           placeholder="MegaPDF Logo">
                                    <p class="text-sm text-gray-500 mt-1">
                                        Alt text for accessibility (required if logo URL is provided)
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Favicon URL
                                    </label>
                                    <input type="url" name="faviconUrl" 
                                           value="${this.escapeHtml(this.branding?.faviconUrl || '')}" 
                                           class="form-input w-full" 
                                           placeholder="/favicon.ico">
                                    <p class="text-sm text-gray-500 mt-1">
                                        URL to your favicon
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        App Icon URL
                                    </label>
                                    <input type="url" name="iconUrl" 
                                           value="${this.escapeHtml(this.branding?.iconUrl || '')}" 
                                           class="form-input w-full" 
                                           placeholder="/images/icon.png">
                                    <p class="text-sm text-gray-500 mt-1">
                                        URL to your app icon (for mobile/PWA)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- SEO Settings -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-6">SEO & Meta Tags</h3>
                            
                            <div class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Title
                                        </label>
                                        <input type="text" name="seoMetaTitle" 
                                               value="${this.escapeHtml(this.branding?.seo?.metaTitle || '')}" 
                                               maxlength="60"
                                               class="form-input w-full" 
                                               placeholder="MegaPDF - Professional PDF Tools">
                                        <p class="text-sm text-gray-500 mt-1">
                                            SEO title for search engines (max 60 chars for optimal display)
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Keywords
                                        </label>
                                        <input type="text" name="seoMetaKeywords" 
                                               value="${this.escapeHtml((this.branding?.seo?.metaKeywords || []).join(', '))}" 
                                               class="form-input w-full" 
                                               placeholder="PDF, tools, convert, merge, split">
                                        <p class="text-sm text-gray-500 mt-1">
                                            SEO keywords separated by commas
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea name="seoMetaDescription" rows="3" 
                                              maxlength="160"
                                              class="form-input w-full" 
                                              placeholder="Professional PDF tools for converting, merging, splitting, and editing PDF documents. Free online PDF tools with premium features.">${this.escapeHtml(this.branding?.seo?.metaDescription || '')}</textarea>
                                    <p class="text-sm text-gray-500 mt-1">
                                        SEO description (max 160 chars for optimal display)
                                    </p>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Open Graph Image URL
                                        </label>
                                        <input type="url" name="seoOgImage" 
                                               value="${this.escapeHtml(this.branding?.seo?.ogImage || '')}" 
                                               class="form-input w-full" 
                                               placeholder="/images/og-image.png">
                                        <p class="text-sm text-gray-500 mt-1">
                                            Image for social media sharing (1200x630px recommended)
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Twitter Handle
                                        </label>
                                        <input type="text" name="seoTwitterSite" 
                                               value="${this.escapeHtml(this.branding?.seo?.twitterSite || '')}" 
                                               class="form-input w-full" 
                                               placeholder="@megapdf">
                                        <p class="text-sm text-gray-500 mt-1">
                                            Your Twitter handle (include @)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Social Media -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-6">Social Media Links</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fab fa-twitter mr-2 text-blue-400"></i>
                                        Twitter
                                    </label>
                                    <input type="url" name="socialTwitter" 
                                           value="${this.escapeHtml(this.branding?.socialMedia?.twitter || '')}" 
                                           class="form-input w-full" 
                                           placeholder="https://twitter.com/megapdf">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fab fa-facebook mr-2 text-blue-600"></i>
                                        Facebook
                                    </label>
                                    <input type="url" name="socialFacebook" 
                                           value="${this.escapeHtml(this.branding?.socialMedia?.facebook || '')}" 
                                           class="form-input w-full" 
                                           placeholder="https://facebook.com/megapdf">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fab fa-github mr-2 text-gray-700"></i>
                                        GitHub
                                    </label>
                                    <input type="url" name="socialGithub" 
                                           value="${this.escapeHtml(this.branding?.socialMedia?.github || '')}" 
                                           class="form-input w-full" 
                                           placeholder="https://github.com/megapdf">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fab fa-linkedin mr-2 text-blue-500"></i>
                                        LinkedIn
                                    </label>
                                    <input type="url" name="socialLinkedin" 
                                           value="${this.escapeHtml(this.branding?.socialMedia?.linkedin || '')}" 
                                           class="form-input w-full" 
                                           placeholder="https://linkedin.com/company/megapdf">
                                </div>
                            </div>
                        </div>

                        <!-- Contact Information -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-6">Contact Information</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Email
                                    </label>
                                    <input type="email" name="contactEmail" 
                                           value="${this.escapeHtml(this.branding?.contact?.email || '')}" 
                                           class="form-input w-full" 
                                           placeholder="hello@megapdf.com">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Support URL
                                    </label>
                                    <input type="url" name="contactSupportUrl" 
                                           value="${this.escapeHtml(this.branding?.contact?.supportUrl || '')}" 
                                           class="form-input w-full" 
                                           placeholder="/support">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input type="tel" name="contactPhone" 
                                           value="${this.escapeHtml(this.branding?.contact?.phone || '')}" 
                                           class="form-input w-full" 
                                           placeholder="+1 (555) 123-4567">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Documentation URL
                                    </label>
                                    <input type="url" name="contactDocumentationUrl" 
                                           value="${this.escapeHtml(this.branding?.contact?.documentationUrl || '')}" 
                                           class="form-input w-full" 
                                           placeholder="/docs">
                                </div>
                            </div>
                        </div>

                        <!-- Footer Settings -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-6">Footer Configuration</h3>
                            
                            <div class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Company Name *
                                        </label>
                                        <input type="text" name="footerCompanyName" 
                                               value="${this.escapeHtml(this.branding?.footer?.companyName || '')}" 
                                               required
                                               class="form-input w-full" 
                                               placeholder="MegaPDF">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Copyright Text
                                        </label>
                                        <input type="text" name="footerCopyright" 
                                               value="${this.escapeHtml(this.branding?.footer?.copyright || '')}" 
                                               class="form-input w-full" 
                                               placeholder="© 2024 MegaPDF. All rights reserved.">
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Custom Footer Text
                                    </label>
                                    <textarea name="footerCustomText" rows="2" 
                                              class="form-input w-full" 
                                              placeholder="Additional footer text or disclaimers">${this.escapeHtml(this.branding?.footer?.customText || '')}</textarea>
                                </div>
                                
                                <div>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="footerShowBranding" 
                                               ${this.branding?.footer?.showBranding ? 'checked' : ''}
                                               class="form-checkbox h-4 w-4 text-blue-600">
                                        <span class="ml-2 text-sm text-gray-700">
                                            Show "Powered by MegaPDF" branding
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end space-x-4">
                            <button type="button" 
                                    onclick="window.brandingComponent.resetToDefaults()" 
                                    class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                <i class="fas fa-undo mr-2"></i>
                                Reset to Defaults
                            </button>
                            <button type="submit" 
                                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-save mr-2"></i>
                                Save Branding
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    createErrorHTML() {
        return `
            <div class="page-transition">
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Failed to Load Branding</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the branding data.</p>
                    <button onclick="window.adminApp.loadPage('branding')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-redo mr-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    async postRender() {
        // Make component available to onclick handlers
        window.brandingComponent = this;
        
        // Setup form change detection
        this.setupChangeDetection();
    }

    setupChangeDetection() {
        const form = document.getElementById('branding-form');
        if (!form) return;

        // Track changes to warn user before leaving
        form.addEventListener('input', () => {
            this.unsavedChanges = true;
        });

        // Warn before leaving page with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    async saveBranding(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        
        // Build branding object
        const branding = {
            appName: formData.get('appName'),
            appDescription: formData.get('appDescription'),
            appTagline: formData.get('appTagline'),
            logoUrl: formData.get('logoUrl'),
            logoAltText: formData.get('logoAltText'),
            faviconUrl: formData.get('faviconUrl'),
            iconUrl: formData.get('iconUrl'),
            seo: {
                metaTitle: formData.get('seoMetaTitle'),
                metaDescription: formData.get('seoMetaDescription'),
                metaKeywords: formData.get('seoMetaKeywords') ? 
                    formData.get('seoMetaKeywords').split(',').map(k => k.trim()).filter(k => k) : [],
                ogImage: formData.get('seoOgImage'),
                twitterSite: formData.get('seoTwitterSite'),
            },
            socialMedia: {
                twitter: formData.get('socialTwitter'),
                facebook: formData.get('socialFacebook'),
                github: formData.get('socialGithub'),
                linkedin: formData.get('socialLinkedin'),
            },
            contact: {
                email: formData.get('contactEmail'),
                phone: formData.get('contactPhone'),
                supportUrl: formData.get('contactSupportUrl'),
                documentationUrl: formData.get('contactDocumentationUrl'),
            },
            footer: {
                companyName: formData.get('footerCompanyName'),
                copyright: formData.get('footerCopyright'),
                customText: formData.get('footerCustomText'),
                showBranding: formData.get('footerShowBranding') === 'on',
                links: this.branding?.footer?.links || [],
                legalLinks: this.branding?.footer?.legalLinks || [],
            }
        };
        
        try {
            await window.adminAPI.updateBranding(branding);
            window.showNotification('Branding configuration saved successfully!', 'success');
            this.branding = branding;
            this.unsavedChanges = false;
        } catch (error) {
            window.showNotification('Failed to save branding: ' + error.message, 'error');
        }
    }

    async resetToDefaults() {
        window.showConfirmation(
            'Are you sure you want to reset branding to default values? This will remove all custom branding settings.',
            async () => {
                try {
                    await window.adminAPI.resetBranding();
                    window.showNotification('Branding reset to defaults successfully', 'success');
                    window.adminApp.loadPage('branding', false);
                } catch (error) {
                    window.showNotification('Failed to reset branding: ' + error.message, 'error');
                }
            }
        );
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    cleanup() {
        this.unsavedChanges = false;
        window.brandingComponent = null;
    }
}

// Export to global scope
window.BrandingComponent = BrandingComponent;