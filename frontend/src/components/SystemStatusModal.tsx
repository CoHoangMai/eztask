import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Database, 
  Radio, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  Activity 
} from 'lucide-react';
import { isBackendAvailable } from '../api/apiClient';

interface SystemStatusModalProps {
  isOnline: boolean;
  onClose: () => void;
  onRefreshHealth: () => Promise<void>;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({
  isOnline,
  onClose,
  onRefreshHealth
}) => {
  const [checking, setChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toLocaleTimeString());

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await onRefreshHealth();
      setLastCheckTime(new Date().toLocaleTimeString());
    } finally {
      setTimeout(() => setChecking(false), 400);
    }
  };

  const services = [
    {
      name: 'Spring Cloud Gateway',
      port: ':8080',
      description: 'Reverse proxy, JWT token verification & route aggregation',
      icon: <Server size={16} className="text-blue-500" />,
      status: isOnline ? 'ONLINE' : 'STANDALONE_FALLBACK',
    },
    {
      name: 'Identity Service (IAM)',
      port: ':8082',
      description: 'User registration, role-based access & JWT minting',
      icon: <ShieldCheck size={16} className="text-indigo-500" />,
      status: isOnline ? 'ONLINE' : 'STANDALONE_FALLBACK',
    },
    {
      name: 'Task Service',
      port: ':8081',
      description: 'Board, Column, Card persistence & Kafka event publishing',
      icon: <Layers size={16} className="text-emerald-500" />,
      status: isOnline ? 'ONLINE' : 'STANDALONE_FALLBACK',
    },
    {
      name: 'Notification Service',
      port: ':8083',
      description: 'Kafka event consumer, Redis cache & WebSocket broadcasting',
      icon: <Radio size={16} className="text-amber-500" />,
      status: isOnline ? 'ONLINE' : 'STANDALONE_FALLBACK',
    },
    {
      name: 'PostgreSQL Cluster',
      port: ':5432',
      description: 'Relational data stores for Identity DB, Task DB & Notification DB',
      icon: <Database size={16} className="text-cyan-500" />,
      status: isOnline ? 'ONLINE' : 'STANDALONE_FALLBACK',
    }
  ];

  return (
    <div 
      id="system-status-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        id="system-status-modal-card"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">System & Cluster Architecture</h2>
              <p className="text-[11px] text-slate-400">EzTask Microservices Infrastructure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Cluster Status Banner */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-950' : 'bg-amber-50 border-amber-100 text-amber-950'
        }`}>
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <CheckCircle2 size={20} className="text-emerald-600" />
            ) : (
              <AlertCircle size={20} className="text-amber-600" />
            )}
            <div>
              <div className="text-xs font-bold">
                {isOnline ? 'Cluster Live & Connected' : 'Standalone Local / Demo Mode'}
              </div>
              <div className="text-[11px] opacity-80">
                {isOnline 
                  ? 'Requests are routed through Spring Cloud Gateway :8080' 
                  : 'Backend cluster unreachable. Operating with high-performance local storage cache.'}
              </div>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={checking}
            className="px-2.5 py-1.5 rounded-lg bg-white shadow-xs border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={12} className={checking ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span>{checking ? 'Checking...' : 'Ping'}</span>
          </button>
        </div>

        {/* Services List */}
        <div className="p-4 space-y-2.5 max-h-80 overflow-y-auto">
          {services.map((svc) => (
            <div 
              key={svc.name}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs mt-0.5">
                  {svc.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{svc.name}</span>
                    <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                      {svc.port}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{svc.description}</p>
                </div>
              </div>

              <div>
                {svc.status === 'ONLINE' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    LOCAL
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Last health check: {lastCheckTime}</span>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
