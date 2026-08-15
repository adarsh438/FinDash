/**
 * Utility functions for timezone-safe local date handling.
 * Avoids UTC mismatch issues caused by `new Date("YYYY-MM-DD")` parsing.
 */

export const getLocalDateString = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return new Date(year, month, day);
        }
    }
    return new Date(dateStr);
};

export const isSameMonth = (dateStr: string, refDate: Date = new Date()): boolean => {
    if (!dateStr) return false;
    const d = parseLocalDate(dateStr);
    return d.getMonth() === refDate.getMonth() && d.getFullYear() === refDate.getFullYear();
};

export const formatRelativeDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const target = parseLocalDate(dateStr);
    const now = new Date();

    // Reset time components for accurate day comparison
    const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const diffDays = Math.round((nowMidnight - targetMidnight) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 0) return dateStr; // Future date

    return target.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
