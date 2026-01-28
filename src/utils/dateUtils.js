/**
 * Date utility functions for consistent date handling
 */

/**
 * Format a date string to Azerbaijani locale
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    // Parse the date string and handle timezone issues
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string received:', dateString);
      return '-';
    }
    
    // Format: "dd.MM.yyyy" - "20.08.2025"
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;
    
    console.log('Date formatting:', { input: dateString, output: formatted, parsedDate: date });
    return formatted;
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', dateString);
    return '-';
  }
};

/**
 * Format a date string to include time in Azerbaijani locale
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string received for datetime formatting:', dateString);
      return '-';
    }
    
    // Format: "dd.MM.yyyy HH:mm" - "20.08.2025 14:30"
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formatted = `${day}.${month}.${year} ${hours}:${minutes}`;
    
    console.log('DateTime formatting:', { input: dateString, output: formatted, parsedDate: date });
    return formatted;
  } catch (error) {
    console.error('DateTime formatting error:', error, 'Input:', dateString);
    return '-';
  }
};

/**
 * Convert a date to ISO string format for datetime-local input
 * @param {Date|string} date - Date object or string
 * @returns {string} ISO string in local timezone for datetime-local input
 */
export const toLocalISOString = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date for local ISO conversion:', date);
      return '';
    }
    
    // Get local timezone offset in minutes
    const offset = dateObj.getTimezoneOffset();
    
    // Create a new date adjusted for timezone
    const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
    
    const result = localDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    console.log('Local ISO conversion:', { input: date, output: result, offset, localDate });
    return result;
  } catch (error) {
    console.error('Date conversion error:', error, 'Input:', date);
    return '';
  }
};

/**
 * Check if a task is overdue
 * @param {string} dueDate - Due date string
 * @returns {boolean} True if task is overdue
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  
  try {
    const due = new Date(dueDate);
    const now = new Date();
    
    if (isNaN(due.getTime())) {
      console.warn('Invalid due date for overdue check:', dueDate);
      return false;
    }
    
    const result = due < now;
    console.log('Overdue check:', { dueDate, due, now, isOverdue: result });
    return result;
  } catch (error) {
    console.error('Overdue check error:', error, 'Input:', dueDate);
    return false;
  }
};
