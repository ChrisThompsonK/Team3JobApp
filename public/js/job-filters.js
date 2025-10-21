/**
 * Job filtering functionality for the job roles list page
 */

/**
 * Apply filters to job roles list
 * Constructs URL with query parameters and reloads the page
 */
function applyFilters() {
  const params = new URLSearchParams();

  // Get text input value
  const nameFilter = document.getElementById('nameFilter')?.value.trim();
  if (nameFilter) {
    params.append('name', nameFilter);
  }

  // Get selected dropdown values for each filter type
  const locationFilter = document.getElementById('locationFilter')?.value;
  if (locationFilter) {
    params.append('location', locationFilter);
  }

  const capabilityFilter = document.getElementById('capabilityFilter')?.value;
  if (capabilityFilter) {
    params.append('capability', capabilityFilter);
  }

  const bandFilter = document.getElementById('bandFilter')?.value;
  if (bandFilter) {
    params.append('band', bandFilter);
  }

  // Get sorting parameters
  const sortByFilter = document.getElementById('sortByFilter')?.value;
  const sortOrderFilter = document.getElementById('sortOrderFilter')?.value;

  // Only add sort parameters if sortBy is selected
  if (sortByFilter) {
    params.append('sortBy', sortByFilter);
    params.append('sortOrder', sortOrderFilter || 'asc');
  }

  // Reset to page 1 when filters change, keep default limit of 10
  params.append('page', '1');
  params.append('limit', '10');

  // Redirect to filtered URL
  const queryString = params.toString();
  window.location.href = queryString ? `/jobs?${queryString}` : '/jobs';
}

/**
 * Clear all filters and reload the page
 */
function clearFilters() {
  window.location.href = '/jobs';
}

/**
 * Auto-apply filters when any filter changes
 */
function autoApplyFilters() {
  // Small delay to ensure the UI updates
  setTimeout(applyFilters, 100);
}

/**
 * Initialize filter functionality
 */
function initializeFilters() {
  // Allow Enter key to trigger filter application in text input
  const nameFilter = document.getElementById('nameFilter');
  if (nameFilter) {
    nameFilter.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });

    // Auto-apply filters after user stops typing (debounced)
    let nameFilterTimeout;
    nameFilter.addEventListener('input', () => {
      clearTimeout(nameFilterTimeout);
      nameFilterTimeout = setTimeout(() => {
        autoApplyFilters();
      }, 500); // Wait 500ms after user stops typing
    });
  }

  // Add event listeners for dropdown changes
  const dropdowns = [
    'locationFilter',
    'capabilityFilter',
    'bandFilter',
    'sortByFilter',
    'sortOrderFilter',
  ];
  dropdowns.forEach((dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      dropdown.addEventListener('change', () => {
        // Auto-apply filters when dropdown selection changes
        autoApplyFilters();
      });
    }
  });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFilters);
} else {
  initializeFilters();
}
