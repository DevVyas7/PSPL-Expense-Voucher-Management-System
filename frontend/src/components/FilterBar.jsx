import React from 'react';

const FilterBar = ({
  filters,
  onChange,
  onReset,
  showStatusFilter = true,
  showEmployeeSearch = true
}) => {
  const departments = [
    'Investment Banking',
    'Operations',
    'Research & Equity',
    'IT & Systems',
    'Human Resources',
    'Accounts & Finance',
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
    <div className="filter-card">
      <div className="filter-grid">
        {/* Search Input */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            {showEmployeeSearch ? 'Search # or Name' : 'Search Voucher #'}
          </label>
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            placeholder={showEmployeeSearch ? 'e.g. EXP-2026 or Rahul' : 'e.g. EXP-2026-0001'}
            className="form-control"
          />
        </div>

        {/* Department Filter */}
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

        {/* Category Filter */}
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

        {/* Status Filter */}
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

        {/* Sort By */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Sort By</label>
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

        {/* Start Date */}
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

        {/* End Date */}
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

        {/* Amount Range Min & Max */}
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

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Max Amount (₹)</label>
          <input
            type="number"
            name="maxAmount"
            min="0"
            value={filters.maxAmount || ''}
            onChange={handleInputChange}
            placeholder="Max"
            className="form-control"
          />
        </div>

        {/* Reset Actions */}
        <div className="filter-actions" style={{ alignSelf: 'flex-end', height: '42px' }}>
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary"
            style={{ width: '100%', height: '100%' }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
