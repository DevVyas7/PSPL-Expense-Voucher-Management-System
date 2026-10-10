import React, { useState } from 'react';

const FilterBar = ({
  filters,
  onChange,
  onReset,
  showStatusFilter = true,
  showEmployeeSearch = true
}) => {
  const [expanded, setExpanded] = useState(false);

  const departments = [
    'Finance',
    'Human Resources',
    'Technology',
    'Marketing',
    'Operations',
    'Investment Banking',
    'Research & Equity',
    'IT & Systems',
    'Compliance & Legal'
  ];

  const categories = [
    'Travel',
    'Food',
    'Accommodation',
    'Office Supplies',
    'Transportation',
    'Other'
  ];

  const statuses = [
    'Draft',
    'Pending Approval',
    'Approved',
    'Rejected'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value
    });
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* Primary Toolbar Row matching Reference Image */}
      <div className="table-toolbar">
        {/* Left Search with Icon */}
        <div className="toolbar-search-wrapper">
          <span className="toolbar-search-icon">🔍</span>
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            placeholder={showEmployeeSearch ? 'Search voucher ref or claimant name...' : 'Search voucher number...'}
            className="toolbar-search-input"
          />
        </div>

        {/* Right Toolbar Options */}
        <div className="toolbar-controls">
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${expanded ? 'btn-dark' : ''}`}
            onClick={() => setExpanded(!expanded)}
          >
            <span>⚡ Filters</span> {expanded ? '▲' : '▼'}
          </button>

          {(filters.search || filters.department || filters.category || filters.status || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onReset}
              title="Clear all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Extended Filters Card */}
      {expanded && (
        <div className="filter-card">
          <div className="filter-grid">
            {/* Department */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Department</label>
              <select
                name="department"
                value={filters.department || ''}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select
                name="category"
                value={filters.category || ''}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status (if applicable) */}
            {showStatusFilter && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={filters.status || ''}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((stat) => (
                    <option key={stat} value={stat}>
                      {stat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort order */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sort Order</label>
              <select
                name="sortBy"
                value={filters.sortBy || 'newest'}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_asc">Amount: Low to High</option>
                <option value="amount_desc">Amount: High to Low</option>
              </select>
            </div>

            {/* From Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            {/* To Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            {/* Min Amount */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Min Amount (₹)</label>
              <input
                type="number"
                name="minAmount"
                min="0"
                value={filters.minAmount || ''}
                onChange={handleInputChange}
                placeholder="0"
                className="form-control"
              />
            </div>

            {/* Max Amount */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Amount (₹)</label>
              <input
                type="number"
                name="maxAmount"
                min="0"
                value={filters.maxAmount || ''}
                onChange={handleInputChange}
                placeholder="No max"
                className="form-control"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
