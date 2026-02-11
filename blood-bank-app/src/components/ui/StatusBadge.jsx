import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'approved':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          icon: CheckCircle
        };
      case 'reserved':
      case 'pending':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          icon: Clock
        };
      case 'used':
      case 'fulfilled':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          icon: CheckCircle
        };
      case 'contaminated':
      case 'rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: XCircle
        };
      default:
        return {
          bg: 'bg-zinc-100',
          text: 'text-zinc-700',
          icon: AlertTriangle
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
};

export default StatusBadge;
