// API configuration
const API_BASE_URL = "http://localhost:8888/api";

// DOM elements
const rowCountEl = document.getElementById("rowCount");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("errorMessage");
const tableContainerEl = document.getElementById("tableContainer");
const emptyStateEl = document.getElementById("emptyState");
const tableHeaderEl = document.getElementById("tableHeader");
const tableBodyEl = document.getElementById("tableBody");
const refreshBtnEl = document.getElementById("refreshBtn");

/**
 * Setup dual scrollbar functionality
 */
function setupDualScrollbars() {
  const topScrollbar = document.querySelector(".top-scrollbar");
  const tableWrapper = document.querySelector(".table-wrapper");
  const topScrollbarContent = document.querySelector(".top-scrollbar-content");
  const table = document.getElementById("dataTable");

  if (!topScrollbar || !tableWrapper || !topScrollbarContent || !table) {
    return;
  }

  // Set the width of the top scrollbar content to match the table width
  const updateScrollbarWidth = () => {
    const tableWidth = table.scrollWidth;
    topScrollbarContent.style.width = `${tableWidth}px`;
  };

  // Sync scrolling between top and bottom scrollbars
  const syncScrolling = (source, target) => {
    target.scrollLeft = source.scrollLeft;
  };

  // Event listeners for scroll synchronization
  topScrollbar.addEventListener("scroll", () => {
    syncScrolling(topScrollbar, tableWrapper);
  });

  tableWrapper.addEventListener("scroll", () => {
    syncScrolling(tableWrapper, topScrollbar);
  });

  // Update scrollbar width when window resizes
  window.addEventListener("resize", updateScrollbarWidth);

  // Initial setup
  updateScrollbarWidth();
}

/**
 * Read all entries from the API
 */
async function readAllEntries() {
  try {
    const response = await fetch(`${API_BASE_URL}/docs`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch data");
    }

    console.log(`Found ${result.count} entries:`, result.data);
    return result.data;
  } catch (error) {
    console.error("Error reading from API:", error);
    throw error;
  }
}

/**
 * Get entry count from API
 */
async function getEntryCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/docs/count`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.count;
  } catch (error) {
    console.error("Error getting count from API:", error);
    throw error;
  }
}

/**
 * Show error message in the UI
 */
function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = "block";
  loadingEl.style.display = "none";
  tableContainerEl.style.display = "none";
  emptyStateEl.style.display = "none";
}

/**
 * Hide error message
 */
function hideError() {
  errorEl.style.display = "none";
}

/**
 * Update row count display
 */
function updateRowCount(count) {
  rowCountEl.textContent = `Total entries: ${count}`;
}

/**
 * Get column headers from the first data row
 */
function getTableHeaders(data) {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
}

/**
 * Format cell value for display
 */
function formatCellValue(key, value) {
  if (value === null || value === undefined) {
    return "<em>null</em>";
  }

  // Handle vector arrays
  if (Array.isArray(value) && key.toLowerCase().includes("vector")) {
    return `[${value
      .slice(0, 5)
      .map(v => v.toFixed(3))
      .join(", ")}${value.length > 5 ? "..." : ""}]`;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  // Handle objects
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  // Handle long strings
  if (typeof value === "string" && value.length > 100) {
    return value.substring(0, 100) + "...";
  }

  return String(value);
}

/**
 * Get CSS class for cell based on column type
 */
function getCellClass(key, value) {
  if (Array.isArray(value) && key.toLowerCase().includes("vector")) {
    return "vector-cell";
  }
  if (typeof value === "string" && value.length > 50) {
    return "text-cell";
  }
  return "";
}

/**
 * Populate the table with data
 */
function populateTable(data) {
  if (data.length === 0) {
    showEmptyState();
    return;
  }

  const headers = getTableHeaders(data);

  // Create table headers
  tableHeaderEl.innerHTML = "";
  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    tableHeaderEl.appendChild(th);
  });

  // Create table rows
  tableBodyEl.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(header => {
      const td = document.createElement("td");
      const value = row[header];
      const cellClass = getCellClass(header, value);

      if (cellClass) {
        td.className = cellClass;
      }

      td.innerHTML = formatCellValue(header, value);
      tr.appendChild(td);
    });
    tableBodyEl.appendChild(tr);
  });

  // Show table and row count
  loadingEl.style.display = "none";
  rowCountEl.style.display = "block";
  tableContainerEl.style.display = "block";
  emptyStateEl.style.display = "none";

  // Setup dual scrollbars after table is rendered
  setTimeout(() => {
    setupDualScrollbars();
  }, 100);
}

/**
 * Show empty state
 */
function showEmptyState() {
  loadingEl.style.display = "none";
  rowCountEl.style.display = "none";
  tableContainerEl.style.display = "none";
  emptyStateEl.style.display = "block";
}

/**
 * Load and display data
 */
async function loadData() {
  try {
    hideError();
    loadingEl.style.display = "block";
    tableContainerEl.style.display = "none";
    emptyStateEl.style.display = "none";

    rowCountEl.textContent = "Loading...";

    const data = await readAllEntries();

    updateRowCount(data.length);
    populateTable(data);
  } catch (error) {
    console.error("Failed to load data:", error);

    // Show user-friendly error message
    let errorMessage = "Failed to load database entries.";
    if (error.message.includes("fetch")) {
      errorMessage = "Could not connect to the API server. Make sure it's running on port 8888.";
    } else if (error.message.includes("not found") || error.message.includes("does not exist")) {
      errorMessage = `Table "docs" not found. Please check if the database and table exist.`;
    } else if (error.message.includes("HTTP error")) {
      errorMessage = `Server error: ${error.message}`;
    }

    showError(errorMessage);
    updateRowCount(0);
  }
}

// Event listeners
refreshBtnEl.addEventListener("click", loadData);

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  console.log("LanceDB Viewer initialized");
  loadData();
});

// Export functions for potential external use
export { readAllEntries, getEntryCount, loadData };
