import React from 'react';

const StatCard = ({ title, value, detail, icon: Icon, iconColor = 'text-blue-600' }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-zinc-200 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-zinc-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">{value}</p>
          {detail && <p className="text-sm text-zinc-500 mt-2">{detail}</p>}
        </div>
        {Icon && (
          <div className={`${iconColor} bg-zinc-50 p-3 rounded-lg`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
