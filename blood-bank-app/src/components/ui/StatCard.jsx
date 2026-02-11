import React from 'react';

const StatCard = ({ title, value, detail, icon: Icon, iconColor = 'text-blue-600' }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.15] hover:shadow-2xl group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/70 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {detail && <p className="text-sm text-white/50 mt-2">{detail}</p>}
        </div>
        {Icon && (
          <div className={`${iconColor} bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 group-hover:bg-white/15 transition-all duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
