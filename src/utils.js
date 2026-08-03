/**
 * InstaPlayer Helper Utilities
 */

/**
 * Convert a duration in seconds to a minutes-and-seconds string.
 * @param {number} seconds - The duration to format.
 * @return {string} The formatted duration, or `"0:00"` for invalid, infinite, or negative values.
 */
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Creates a function that delays execution until calls stop for the specified interval.
 * @param {Function} func - The function to invoke after the delay.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} A debounced function that invokes `func` with the latest arguments.
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
