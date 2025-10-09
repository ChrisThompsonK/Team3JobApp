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
 * Toggle sorting for a specific column
 * Cycles through: no sort -> ascending -> descending -> no sort
 */
function toggleSort(column) {
  const urlParams = new URLSearchParams(window.location.search);
  const currentSortField = urlParams.get('sortBy');
  const currentSortOrder = urlParams.get('sortOrder');

  // Determine the next sort state
  let newSortField = null;
  let newSortOrder = null;

  if (currentSortField === column) {
    // Same column clicked
    if (currentSortOrder === 'asc') {
      // Change to descending
      newSortField = column;
      newSortOrder = 'desc';
    } else if (currentSortOrder === 'desc') {
      // Remove sorting (go back to no sort)
      newSortField = null;
      newSortOrder = null;
    }
  } else {
    // Different column clicked, start with ascending
    newSortField = column;
    newSortOrder = 'asc';
  }

  // Update URL parameters
  if (newSortField && newSortOrder) {
    urlParams.set('sortBy', newSortField);
    urlParams.set('sortOrder', newSortOrder);
  } else {
    urlParams.delete('sortBy');
    urlParams.delete('sortOrder');
  }

  // Redirect with new sort parameters
  const queryString = urlParams.toString();
  window.location.href = queryString ? `/jobs?${queryString}` : '/jobs';
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

// Export functions for potential future use
if (module?.exports) {
  module.exports = { searchJobs, searchJobsByCapability, initializeJobSearch };
}
