// Admin Panel Notifications System

class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        // Create or find notification container
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 5000) {
        const id = Date.now().toString();
        const notification = this.createNotification(id, message, type);
        
        // Add to container
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
            notification.classList.add('translate-x-0', 'opacity-100');
        }, 100);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    }

    createNotification(id, message, type) {
        const notification = document.createElement('div');
        notification.className = `
            transform transition-all duration-300 ease-in-out
            translate-x-full opacity-0
            max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto
            border-l-4 ${this.getTypeClasses(type).border}
        `;
        
        const typeClasses = this.getTypeClasses(type);
        
        notification.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="${typeClasses.icon} ${typeClasses.iconColor}"></i>
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">
                            ${this.escapeHtml(message)}
                        </p>
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none" 
                                onclick="window.notificationManager.remove('${id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return notification;
    }

    getTypeClasses(type) {
        const types = {
            success: {
                border: 'border-green-400',
                icon: 'fas fa-check-circle',
                iconColor: 'text-green-400'
            },
            error: {
                border: 'border-red-400',
                icon: 'fas fa-exclamation-circle',
                iconColor: 'text-red-400'
            },
            warning: {
                border: 'border-yellow-400',
                icon: 'fas fa-exclamation-triangle',
                iconColor: 'text-yellow-400'
            },
            info: {
                border: 'border-blue-400',
                icon: 'fas fa-info-circle',
                iconColor: 'text-blue-400'
            }
        };

        return types[type] || types.info;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        // Animate out
        notification.classList.remove('translate-x-0', 'opacity-100');
        notification.classList.add('translate-x-full', 'opacity-0');

        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }

    clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Progress notification for long operations
class ProgressNotification {
    constructor(message) {
        this.id = Date.now().toString();
        this.progress = 0;
        this.message = message;
        this.notification = this.createProgressNotification();
        
        const container = document.getElementById('toast-container');
        container.appendChild(this.notification);
        
        // Animate in
        setTimeout(() => {
            this.notification.classList.remove('translate-x-full', 'opacity-0');
            this.notification.classList.add('translate-x-0', 'opacity-100');
        }, 100);
    }

    createProgressNotification() {
        const notification = document.createElement('div');
        notification.className = `
            transform transition-all duration-300 ease-in-out
            translate-x-full opacity-0
            max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto
            border-l-4 border-blue-400
        `;
        
        notification.innerHTML = `
            <div class="p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-spinner fa-spin text-blue-400"></i>
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">
                            ${this.message}
                        </p>
                        <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                 style="width: 0%" id="progress-bar-${this.id}"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1" id="progress-text-${this.id}">0%</p>
                    </div>
                </div>
            </div>
        `;

        return notification;
    }

    updateProgress(progress, message = null) {
        this.progress = Math.min(100, Math.max(0, progress));
        
        const progressBar = document.getElementById(`progress-bar-${this.id}`);
        const progressText = document.getElementById(`progress-text-${this.id}`);
        
        if (progressBar) {
            progressBar.style.width = `${this.progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(this.progress)}%`;
        }
        
        if (message) {
            const messageElement = this.notification.querySelector('.text-sm.font-medium');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }

    complete(message = 'Completed!', type = 'success') {
        setTimeout(() => {
            this.remove();
            window.notificationManager.show(message, type);
        }, 500);
    }

    remove() {
        // Animate out
        this.notification.classList.remove('translate-x-0', 'opacity-100');
        this.notification.classList.add('translate-x-full', 'opacity-0');

        // Remove from DOM after animation
        setTimeout(() => {
            if (this.notification.parentNode) {
                this.notification.parentNode.removeChild(this.notification);
            }
        }, 300);
    }
}

// Confirmation modal
function showConfirmation(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mt-4">Confirmation</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500">${message}</p>
                </div>
                <div class="flex justify-center space-x-4 mt-4">
                    <button id="confirm-btn" class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700">
                        Confirm
                    </button>
                    <button id="cancel-btn" class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#confirm-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        if (onConfirm) onConfirm();
    });
    
    modal.querySelector('#cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        if (onCancel) onCancel();
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            if (onCancel) onCancel();
        }
    });
}

// Initialize notification manager
window.notificationManager = new NotificationManager();

// Global notification functions
window.showNotification = (message, type, duration) => {
    return window.notificationManager.show(message, type, duration);
};

window.showProgress = (message) => {
    return new ProgressNotification(message);
};

window.showConfirmation = showConfirmation;