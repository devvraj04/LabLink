import React from 'react';

const StatCard = ({ title, value, detail, icon: Icon, iconColor = 'text-blue-600' }) => {
  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-zinc-700 text-sm font-bold tracking-wide uppercase opacity-70">{title}</p>
          <p className="text-4xl font-extrabold text-teal-900 mt-2 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">{value}</p>
        </div>
        {Icon && (
          <div className={`${iconColor} bg-white/40 p-3 rounded-2xl backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-8 w-8" />
          </div>
        )}
      </div>
      {detail && (
        <div className="mt-auto pt-4 border-t border-white/30">
          <p className="text-sm text-zinc-600 font-medium flex items-center gap-2">
            {detail}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatCard;
