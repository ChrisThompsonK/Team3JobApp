/**
 * Job search functionality for the home page
 */

/**
 * Redirects to the jobs page with search query
 */
function searchJobs() {
  const searchTerm = document.getElementById('jobSearchInput')?.value.trim();
  if (searchTerm) {
    // Redirect to jobs page with search query
    window.location.href = `/jobs?name=${encodeURIComponent(searchTerm)}`;
  } else {
    // If no search term, just go to jobs page
    window.location.href = '/jobs';
  }
}

/**

 * Redirects to the jobs page with selected capability filter
 * Called from HTML: onclick="searchJobsByCapability()" in index.njk
 */
function handleSearchKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchJobs();
  }
}

/**
 * Initialize job search functionality
 */
function initializeJobSearch() {
  // Get search input element
  const searchInput = document.getElementById('jobSearchInput');

  if (searchInput) {
    // Allow Enter key to trigger search
    searchInput.addEventListener('keypress', handleSearchKeyPress);

    // Optional: Add input validation or auto-suggestions here
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value;
      // Could add real-time validation or suggestions here
      if (value.length > 50) {
        e.target.setCustomValidity('Search term too long (max 50 characters)');
      } else {
        e.target.setCustomValidity('');
      }
    });

    // Focus on search input when page loads
    searchInput.focus();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeJobSearch);
