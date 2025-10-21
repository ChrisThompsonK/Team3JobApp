/**
 * Job search functionality for the home page
 */

/**
 * Redirects to the jobs page with optional search query
 */
function searchJobs() {
  const searchTerm = document.getElementById('jobSearchInput')?.value.trim();
  if (searchTerm) {
    // Redirect to jobs page with search query
    window.location.href = `/jobs?search=${encodeURIComponent(searchTerm)}`;
  } else {
    // If no search term, just go to jobs page
    window.location.href = '/jobs';
  }
}

/**
 * Redirects to the jobs page with selected capability filter
 * Called from HTML: onclick="searchJobsByCapability()" in index.njk
 */
function searchJobsByCapability() {
  const selectedCapability = document.getElementById('jobCapabilitySelect').value;
  if (selectedCapability) {
    // Redirect to jobs page with capability filter
    window.location.href = `/jobs?capability=${encodeURIComponent(selectedCapability)}`;
  } else {
    // If no capability selected, just go to jobs page
    window.location.href = '/jobs';
  }
}

/**
 * Initialize job search functionality
 */
function initializeJobSearch() {
  // Allow Enter key to trigger search (for legacy text input)
  const searchInput = document.getElementById('jobSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchJobs();
      }
    });
  }

  // Handle capability dropdown change
  const capabilitySelect = document.getElementById('jobCapabilitySelect');
  if (capabilitySelect) {
    capabilitySelect.addEventListener('change', () => {
      // Optional: Auto-filter on selection change
      // searchJobsByCapability();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeJobSearch);