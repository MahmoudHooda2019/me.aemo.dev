/**
 * Global Error Handler Module
 * Provides centralized error handling and user feedback
 * @module ErrorHandler
 */

/**
 * Error types for categorization
 */
export const ErrorTypes = {
    NETWORK: 'network',
    VALIDATION: 'validation',
    RUNTIME: 'runtime',
    PERMISSION: 'permission',
    NOT_FOUND: 'not_found'
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Global error handler class
 */
class ErrorHandler {
    constructor() {
        this.errorContainer = null;
        this.errorQueue = [];
        this.maxErrors = 5;
        this.init();
    }

    /**
     * Initialize error handler
     */
    init() {
        this.createErrorContainer();
        this.setupGlobalErrorHandlers();
    }

    /**
     * Create error display container
     */
    createErrorContainer() {
        if (document.getElementById('error-container')) return;

        const container = document.createElement('div');
        container.id = 'error-container';
        container.className = 'error-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Error notifications');
        document.body.appendChild(container);
        this.errorContainer = container;
    }

    /**
     * Setup global error event listeners
     */
    setupGlobalErrorHandlers() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: ErrorTypes.RUNTIME,
                severity: ErrorSeverity.HIGH,
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: ErrorTypes.RUNTIME,
                severity: ErrorSeverity.MEDIUM,
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack
            });
        });
    }

    /**
     * Handle and display error
     * @param {Object} errorInfo - Error information object
     */
    handleError(errorInfo) {
        const error = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            ...errorInfo
        };

        // Log to console for debugging
        console.error('Error handled:', error);

        // Add to queue
        this.errorQueue.push(error);
        if (this.errorQueue.length > this.maxErrors) {
            this.errorQueue.shift();
        }

        // Display error to user
        this.displayError(error);

        // Auto-remove after delay based on severity
        const delay = this.getAutoRemoveDelay(error.severity);
        setTimeout(() => this.removeError(error.id), delay);
    }

    /**
     * Display error in UI
     * @param {Object} error - Error object
     */
    displayError(error) {
        if (!this.errorContainer) return;

        const errorElement = document.createElement('div');
        errorElement.className = `error-message error-${error.severity}`;
        errorElement.setAttribute('role', 'alert');
        errorElement.dataset.errorId = error.id;

        const icon = this.getErrorIcon(error.type);
        const message = this.formatErrorMessage(error);

        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">${icon}</span>
                <span class="error-text">${message}</span>
                <button class="error-close" onclick="errorHandler.removeError('${error.id}')" aria-label="Close error">×</button>
            </div>
        `;

        this.errorContainer.appendChild(errorElement);

        // Animate in
        requestAnimationFrame(() => {
            errorElement.classList.add('error-visible');
        });
    }

    /**
     * Remove error from display
     * @param {string} errorId - Error ID to remove
     */
    removeError(errorId) {
        const errorElement = document.querySelector(`[data-error-id="${errorId}"]`);
        if (errorElement) {
            errorElement.classList.add('error-removing');
            setTimeout(() => {
                errorElement.remove();
            }, 300);
        }
    }

    /**
     * Get appropriate icon for error type
     * @param {string} type - Error type
     * @returns {string} Icon HTML
     */
    getErrorIcon(type) {
        const icons = {
            [ErrorTypes.NETWORK]: '🌐',
            [ErrorTypes.VALIDATION]: '⚠️',
            [ErrorTypes.RUNTIME]: '🐛',
            [ErrorTypes.PERMISSION]: '🔒',
            [ErrorTypes.NOT_FOUND]: '❓'
        };
        return icons[type] || '❌';
    }

    /**
     * Format error message for display
     * @param {Object} error - Error object
     * @returns {string} Formatted message
     */
    formatErrorMessage(error) {
        let message = error.message || 'An unexpected error occurred';
        
        // Sanitize message to prevent XSS
        message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Add context if available
        if (error.source && error.line) {
            message += ` (${error.source}:${error.line})`;
        }
        
        return message;
    }

    /**
     * Get auto-remove delay based on severity
     * @param {string} severity - Error severity
     * @returns {number} Delay in milliseconds
     */
    getAutoRemoveDelay(severity) {
        const delays = {
            [ErrorSeverity.LOW]: 3000,
            [ErrorSeverity.MEDIUM]: 5000,
            [ErrorSeverity.HIGH]: 8000,
            [ErrorSeverity.CRITICAL]: 0 // Don't auto-remove critical errors
        };
        return delays[severity] || 5000;
    }

    /**
     * Clear all errors
     */
    clearAllErrors() {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = '';
        }
        this.errorQueue = [];
    }

    /**
     * Get error history
     * @returns {Array} Array of error objects
     */
    getErrorHistory() {
        return [...this.errorQueue];
    }
}

// Create global instance
const errorHandler = new ErrorHandler();

// Export for use in other modules
export default errorHandler;

// Make available globally for inline event handlers
window.errorHandler = errorHandler;
