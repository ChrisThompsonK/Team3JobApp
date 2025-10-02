/**
 * Job search functionality for the home page
 */

/**
 * Redirects to the jobs page with optional search query
 */
function searchJobs() {
  const searchTerm = document.getElementById('jobSearchInput').value.trim();
  if (searchTerm) {
    // Redirect to jobs page with search query
    window.location.href = `/jobs?search=${encodeURIComponent(searchTerm)}`;
  } else {
    // If no search term, just go to jobs page
    window.location.href = '/jobs';
  }
}

/**
 * Initialize job search functionality
 */
function initializeJobSearch() {
  // Allow Enter key to trigger search
  const searchInput = document.getElementById('jobSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchJobs();
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeJobSearch);

// Export functions for potential future use
if (module?.exports) {
  module.exports = { searchJobs, initializeJobSearch };
}
