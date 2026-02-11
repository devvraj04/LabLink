import React from 'react';

const StatCard = ({ title, value, detail, icon: Icon, iconColor = 'text-blue-600' }) => {
  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">{title}</p>
          <p className="text-5xl font-black text-gray-900 mt-3 leading-tight">{value}</p>
          {detail && <p className="text-sm text-gray-600 mt-2 font-medium">{detail}</p>}
        </div>
        {Icon && (
          <div className={`${iconColor} bg-white/40 p-4 rounded-xl border border-white/60 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
