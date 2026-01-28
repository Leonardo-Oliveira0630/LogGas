
import React, { useState, useEffect } from 'react';
import { dbGetGlobalStats } from '../services/firebaseService';
import { SaaSMetrics } from '../types';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Search,
  ArrowUpRight,
  Zap,
  Layout
} from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await dbGetGlobalStats();
      setMetrics(data as SaaSMetrics);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Carregando painel de controle da plataforma...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#0A3D62] tracking-tighter">Super Admin Central</h2>
          <p className="text-slate-500 mt-1">Gestão global da plataforma LogGas SaaS.</p>
        </div>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 uppercase tracking-widest">
          <ShieldCheck size={16} /> Sistema Operacional
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlobalStatCard 
          label="Total de Distribuidoras" 
          value={metrics?.totalDistributors || 0} 
          icon={<Layout className="text-[#0A3D62]" />}
        />
        <GlobalStatCard 
          label="Assinaturas Ativas" 
          value={metrics?.activeSubscriptions || 0} 
          icon={<Zap className="text-[#E58E26]" />}
        />
        <GlobalStatCard 
          label="MRR (Receita Mensal)" 
          value={`R$ ${metrics?.monthlyRecurringRevenue.toLocaleString('pt-BR')}`} 
          icon={<CreditCard className="text-emerald-600" />}
        />
        <GlobalStatCard 
          label="Crescimento (30d)" 
          value="+14%" 
          icon={<TrendingUp className="text-blue-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-[#0A3D62]">Últimos Tenant Onboardings</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                placeholder="Buscar distribuidora..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs outline-none"
              />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Distribuidora</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <TenantRow name="Gás do Sul" plan="Pro" status="active" />
              <TenantRow name="Água Cristalina" plan="Free" status="active" />
              <TenantRow name="Distribuidora Express" plan="Enterprise" status="active" />
              <TenantRow name="Norte Gás" plan="Pro" status="past_due" />
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0A3D62] p-8 rounded-[32px] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity size={120} />
             </div>
             <h4 className="text-lg font-black mb-4">Saúde do Sistema</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Banco de Dados (Firestore)</span>
                   <span className="text-emerald-400 font-bold">Operacional</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Autenticação (Auth)</span>
                   <span className="text-emerald-400 font-bold">Operacional</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Gemini AI Engine</span>
                   <span className="text-emerald-400 font-bold">Operacional</span>
                </div>
             </div>
             <button className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-white/10">
                Ver Logs Técnicos
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GlobalStatCard = ({ label, value, icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">{label}</p>
      <h4 className="text-xl font-black text-[#0A3D62]">{value}</h4>
    </div>
  </div>
);

const TenantRow = ({ name, plan, status }: any) => (
  <tr className="hover:bg-slate-50 transition-colors">
    <td className="px-6 py-4">
      <p className="font-bold text-slate-800 text-sm">{name}</p>
    </td>
    <td className="px-6 py-4">
      <span className="text-xs font-bold text-slate-500">{plan}</span>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {status}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <button className="p-2 text-slate-300 hover:text-[#0A3D62] transition-all">
        <ArrowUpRight size={18} />
      </button>
    </td>
  </tr>
);

export default SuperAdminDashboard;
