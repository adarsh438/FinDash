/**
 * Security utilities for input sanitization and XSS prevention.
 */

/**
 * Sanitizes input string by stripping HTML tags and escaping special characters.
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    return input
        .replace(/<[^>]*>?/gm, '') // Strip HTML tags
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Validates email format.
 */
export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
}

/**
 * Validates password strength (min 6 chars).
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password || password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long.' };
    }
    return { isValid: true };
}
