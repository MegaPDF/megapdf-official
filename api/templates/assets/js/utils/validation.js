// Validation Utilities for Admin Panel

class FormValidator {
    constructor() {
        this.rules = {};
        this.errors = {};
    }

    // Add validation rule
    addRule(field, rule, message) {
        if (!this.rules[field]) {
            this.rules[field] = [];
        }
        this.rules[field].push({ rule, message });
        return this;
    }

    // Validate form data
    validate(data) {
        this.errors = {};
        
        for (const [field, rules] of Object.entries(this.rules)) {
            const value = data[field];
            
            for (const { rule, message } of rules) {
                if (!rule(value, data)) {
                    if (!this.errors[field]) {
                        this.errors[field] = [];
                    }
                    this.errors[field].push(message);
                }
            }
        }
        
        return Object.keys(this.errors).length === 0;
    }

    // Get validation errors
    getErrors() {
        return this.errors;
    }

    // Get first error for a field
    getFirstError(field) {
        return this.errors[field] ? this.errors[field][0] : null;
    }

    // Check if field has errors
    hasError(field) {
        return !!this.errors[field];
    }

    // Clear errors
    clearErrors() {
        this.errors = {};
    }
}

// Common validation rules
const ValidationRules = {
    required: (value) => {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined && value !== '';
    },

    email: (value) => {
        if (!value) return true; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    url: (value) => {
        if (!value) return true; // Optional field
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },

    minLength: (min) => (value) => {
        if (!value) return true; // Optional field
        return value.toString().length >= min;
    },

    maxLength: (max) => (value) => {
        if (!value) return true; // Optional field
        return value.toString().length <= max;
    },

    min: (min) => (value) => {
        if (!value && value !== 0) return true; // Optional field
        return parseFloat(value) >= min;
    },

    max: (max) => (value) => {
        if (!value && value !== 0) return true; // Optional field
        return parseFloat(value) <= max;
    },

    numeric: (value) => {
        if (!value && value !== 0) return true; // Optional field
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    integer: (value) => {
        if (!value && value !== 0) return true; // Optional field
        return Number.isInteger(parseFloat(value));
    },

    positive: (value) => {
        if (!value && value !== 0) return true; // Optional field
        return parseFloat(value) > 0;
    },

    phone: (value) => {
        if (!value) return true; // Optional field
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/\s/g, ''));
    },

    password: (value) => {
        if (!value) return true; // Optional field
        return value.length >= 8;
    },

    strongPassword: (value) => {
        if (!value) return true; // Optional field
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        return value.length >= 8 && hasUpper && hasLower && hasNumber && hasSymbol;
    },

    matchField: (fieldName) => (value, data) => {
        return value === data[fieldName];
    },

    in: (allowedValues) => (value) => {
        if (!value) return true; // Optional field
        return allowedValues.includes(value);
    },

    notIn: (disallowedValues) => (value) => {
        if (!value) return true; // Optional field
        return !disallowedValues.includes(value);
    },

    regex: (pattern) => (value) => {
        if (!value) return true; // Optional field
        return pattern.test(value);
    },

    date: (value) => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        return date instanceof Date && !isNaN(date);
    },

    dateAfter: (afterDate) => (value) => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        const after = new Date(afterDate);
        return date > after;
    },

    dateBefore: (beforeDate) => (value) => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        const before = new Date(beforeDate);
        return date < before;
    }
};

// Form validation helper
class LiveFormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.validator = new FormValidator();
        this.isLive = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Validate on form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateForm();
        });

        // Live validation on input change
        this.form.addEventListener('input', (e) => {
            if (this.isLive) {
                this.validateField(e.target);
            }
        });

        // Live validation on blur
        this.form.addEventListener('blur', (e) => {
            this.validateField(e.target);
            this.isLive = true; // Enable live validation after first blur
        }, true);
    }

    addRule(fieldName, rule, message) {
        this.validator.addRule(fieldName, rule, message);
        return this;
    }

    validateForm() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Handle checkboxes
        this.form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });

        const isValid = this.validator.validate(data);
        this.displayErrors();
        
        return isValid;
    }

    validateField(field) {
        if (!field.name) return;
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Handle checkbox
        if (field.type === 'checkbox') {
            data[field.name] = field.checked;
        }

        // Validate only this field
        const fieldRules = this.validator.rules[field.name];
        if (!fieldRules) return;

        this.validator.errors[field.name] = [];
        
        for (const { rule, message } of fieldRules) {
            if (!rule(data[field.name], data)) {
                this.validator.errors[field.name].push(message);
            }
        }

        if (this.validator.errors[field.name].length === 0) {
            delete this.validator.errors[field.name];
        }

        this.displayFieldError(field);
    }

    displayErrors() {
        // Clear all previous errors
        this.form.querySelectorAll('.error-message').forEach(el => el.remove());
        this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Display new errors
        for (const [field, errors] of Object.entries(this.validator.getErrors())) {
            const fieldElement = this.form.querySelector(`[name="${field}"]`);
            if (fieldElement) {
                this.showFieldError(fieldElement, errors[0]);
            }
        }
    }

    displayFieldError(field) {
        // Remove existing error for this field
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        field.classList.remove('error');

        // Show new error if exists
        const error = this.validator.getFirstError(field.name);
        if (error) {
            this.showFieldError(field, error);
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message text-red-600 text-sm mt-1';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }

    isValid() {
        return Object.keys(this.validator.getErrors()).length === 0;
    }

    getErrors() {
        return this.validator.getErrors();
    }

    clearErrors() {
        this.validator.clearErrors();
        this.form.querySelectorAll('.error-message').forEach(el => el.remove());
        this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
}

// Predefined validators for common forms
const AdminValidators = {
    // User form validator
    userForm: () => {
        const validator = new FormValidator();
        return validator
            .addRule('name', ValidationRules.required, 'Name is required')
            .addRule('name', ValidationRules.minLength(2), 'Name must be at least 2 characters')
            .addRule('email', ValidationRules.required, 'Email is required')
            .addRule('email', ValidationRules.email, 'Please enter a valid email address')
            .addRule('role', ValidationRules.required, 'Role is required')
            .addRule('role', ValidationRules.in(['user', 'admin', 'moderator']), 'Invalid role selected')
            .addRule('balance', ValidationRules.numeric, 'Balance must be a number')
            .addRule('balance', ValidationRules.min(0), 'Balance cannot be negative');
    },

    // Settings form validator
    settingsForm: () => {
        const validator = new FormValidator();
        return validator
            .addRule('siteName', ValidationRules.required, 'Site name is required')
            .addRule('siteName', ValidationRules.maxLength(100), 'Site name is too long')
            .addRule('appUrl', ValidationRules.required, 'App URL is required')
            .addRule('appUrl', ValidationRules.url, 'Please enter a valid URL')
            .addRule('maxFileSize', ValidationRules.required, 'Max file size is required')
            .addRule('maxFileSize', ValidationRules.numeric, 'Max file size must be a number')
            .addRule('maxFileSize', ValidationRules.min(1), 'Max file size must be at least 1 MB')
            .addRule('rateLimitRequests', ValidationRules.required, 'Rate limit is required')
            .addRule('rateLimitRequests', ValidationRules.integer, 'Rate limit must be a whole number')
            .addRule('rateLimitRequests', ValidationRules.min(1), 'Rate limit must be at least 1');
    },

    // Email settings validator
    emailForm: () => {
        const validator = new FormValidator();
        return validator
            .addRule('smtpHost', ValidationRules.required, 'SMTP host is required')
            .addRule('smtpPort', ValidationRules.required, 'SMTP port is required')
            .addRule('smtpPort', ValidationRules.integer, 'SMTP port must be a number')
            .addRule('smtpPort', ValidationRules.min(1), 'SMTP port must be greater than 0')
            .addRule('smtpPort', ValidationRules.max(65535), 'SMTP port must be less than 65536')
            .addRule('smtpUser', ValidationRules.required, 'SMTP username is required')
            .addRule('emailFromName', ValidationRules.required, 'From name is required')
            .addRule('emailFrom', ValidationRules.required, 'From email is required')
            .addRule('emailFrom', ValidationRules.email, 'Please enter a valid from email');
    },

    // Pricing form validator
    pricingForm: () => {
        const validator = new FormValidator();
        return validator
            .addRule('operationCost', ValidationRules.required, 'Operation cost is required')
            .addRule('operationCost', ValidationRules.numeric, 'Operation cost must be a number')
            .addRule('operationCost', ValidationRules.min(0), 'Operation cost cannot be negative')
            .addRule('operationCost', ValidationRules.max(10), 'Operation cost seems too high')
            .addRule('freeOperationsMonthly', ValidationRules.required, 'Free operations count is required')
            .addRule('freeOperationsMonthly', ValidationRules.integer, 'Free operations must be a whole number')
            .addRule('freeOperationsMonthly', ValidationRules.min(0), 'Free operations cannot be negative');
    },

    // Login form validator
    loginForm: () => {
        const validator = new FormValidator();
        return validator
            .addRule('email', ValidationRules.required, 'Email is required')
            .addRule('email', ValidationRules.email, 'Please enter a valid email address')
            .addRule('password', ValidationRules.required, 'Password is required');
    }
};

// CSS for error states
const errorStyles = `
    .form-input.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .error-message {
        animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

// Inject error styles
const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);

// Export to global scope
window.FormValidator = FormValidator;
window.LiveFormValidator = LiveFormValidator;
window.ValidationRules = ValidationRules;
window.AdminValidators = AdminValidators;