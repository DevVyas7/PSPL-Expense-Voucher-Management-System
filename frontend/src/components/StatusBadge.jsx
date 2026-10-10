import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-draft';

  switch (status) {
    case 'Pending Approval':
      badgeClass = 'badge-pending';
      break;
    case 'Approved':
      badgeClass = 'badge-approved';
      break;
    case 'Rejected':
      badgeClass = 'badge-rejected';
      break;
    case 'Draft':
    default:
      badgeClass = 'badge-draft';
      break;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot" />
      {status || 'Draft'}
    </span>
  );
};

export default StatusBadge;
