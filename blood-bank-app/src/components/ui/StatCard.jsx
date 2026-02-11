import React from 'react';

const StatCard = ({ title, value, detail, icon: Icon, iconColor = 'text-blue-600' }) => {
  // Extract color for gradient
  const colorMap = {
    'text-red-600': 'from-red-500/20 to-red-600/10 hover:from-red-500/30 hover:to-red-600/20 hover:border-red-300/50 dark:from-red-500/10 dark:to-red-600/5 dark:hover:from-red-500/15 dark:hover:to-red-600/10 dark:hover:border-red-400/30',
    'text-blue-600': 'from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20 hover:border-blue-300/50 dark:from-blue-500/10 dark:to-blue-600/5 dark:hover:from-blue-500/15 dark:hover:to-blue-600/10 dark:hover:border-blue-400/30',
    'text-emerald-600': 'from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20 hover:border-emerald-300/50 dark:from-emerald-500/10 dark:to-emerald-600/5 dark:hover:from-emerald-500/15 dark:hover:to-emerald-600/10 dark:hover:border-emerald-400/30',
    'text-amber-600': 'from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 hover:border-amber-300/50 dark:from-amber-500/10 dark:to-amber-600/5 dark:hover:from-amber-500/15 dark:hover:to-amber-600/10 dark:hover:border-amber-400/30',
    'text-purple-600': 'from-purple-500/20 to-purple-600/10 hover:from-purple-500/30 hover:to-purple-600/20 hover:border-purple-300/50 dark:from-purple-500/10 dark:to-purple-600/5 dark:hover:from-purple-500/15 dark:hover:to-purple-600/10 dark:hover:border-purple-400/30',
    'text-cyan-600': 'from-cyan-500/20 to-cyan-600/10 hover:from-cyan-500/30 hover:to-cyan-600/20 hover:border-cyan-300/50 dark:from-cyan-500/10 dark:to-cyan-600/5 dark:hover:from-cyan-500/15 dark:hover:to-cyan-600/10 dark:hover:border-cyan-400/30',
    'text-zinc-400': 'from-zinc-400/10 to-zinc-500/5 hover:from-zinc-400/15 hover:to-zinc-500/10 hover:border-zinc-300/30 dark:from-zinc-400/5 dark:to-zinc-500/2 dark:hover:from-zinc-400/10 dark:hover:to-zinc-500/5 dark:hover:border-zinc-600/30'
  };

  const gradientClass = colorMap[iconColor] || colorMap['text-blue-600'];

  return (
    <div className={`glass-card bg-gradient-to-br ${gradientClass} rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-zinc-700 dark:text-gray-300 text-sm font-semibold tracking-wide uppercase">{title}</p>
          <p className="text-4xl font-black bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mt-3">{value}</p>
          {detail && <p className="text-sm text-zinc-600 dark:text-gray-400 mt-2 font-medium">{detail}</p>}
        </div>
        {Icon && (
          <div className={`${iconColor} bg-white/30 dark:bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-white/10 group-hover:scale-110 group-hover:bg-white/40 dark:group-hover:bg-white/10 transition-all duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
