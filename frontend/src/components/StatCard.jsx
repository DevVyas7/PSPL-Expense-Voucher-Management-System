import React from 'react';

const StatCard = ({ title, value, icon, colorTheme = 'blue', subtitle }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {subtitle && (
          <span className="stat-subtitle">{subtitle}</span>
        )}
      </div>
      {icon && (
        <div className={`stat-icon-wrapper stat-icon-${colorTheme}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
