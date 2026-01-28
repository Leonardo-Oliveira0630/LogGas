
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Package, Loader2, Sparkles } from 'lucide-react';
import { Product, Sale, Transaction } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales, transactions }) => {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState<boolean>(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const insights = await getFinancialInsights(transactions, products, sales);
      setAiInsights(insights);
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [products, sales, transactions]);

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const criticalStock = products.filter(p => p.stock <= p.minStock);
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.sellPrice), 0);
  
  const chartData = [
    { name: 'Seg', sales: 4000 },
    { name: 'Ter', sales: 3000 },
    { name: 'Qua', sales: 2000 },
    { name: 'Qui', sales: 2780 },
    { name: 'Sex', sales: 1890 },
    { name: 'Sab', sales: 2390 },
    { name: 'Dom', sales: 3490 },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#2D3436] tracking-tight">Visão Geral</h2>
          <p className="text-slate-500 mt-1">Bem-vindo ao painel de controle da sua distribuidora.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm">
            Hoje: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Mensal" 
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          trend="+12.5%" 
          icon={<DollarSign className="text-[#0A3D62]" />}
          color="navy"
        />
        <StatCard 
          title="Estoque Crítico" 
          value={criticalStock.length.toString()} 
          subtitle="Produtos abaixo do mínimo"
          icon={<AlertTriangle className="text-[#E58E26]" />}
          color="orange"
          alert={criticalStock.length > 0}
        />
        <StatCard 
          title="Valor em Estoque" 
          value={`R$ ${totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<Package className="text-[#0A3D62]" />}
          color="navy"
        />
        <StatCard 
          title="Lucro Estimado" 
          value="R$ 4.250,00" 
          trend="+8%" 
          icon={<TrendingUp className="text-[#E58E26]" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#2D3436]">Desempenho de Vendas</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg p-2 outline-none">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A3D62" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0A3D62" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#0A3D62" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-br from-[#0A3D62] to-[#2D3436] p-6 rounded-2xl text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#E58E26] p-2 rounded-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold">Logística Inteligente</h3>
            </div>
            
            <div className="flex-1">
              {loadingInsights ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                  <Loader2 className="animate-spin text-[#E58E26]" size={32} />
                  <p className="text-slate-300 text-sm animate-pulse">Analisando dados...</p>
                </div>
              ) : (
                <div className="space-y-4 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                  {aiInsights}
                </div>
              )}
            </div>
            
            {!loadingInsights && (
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 w-full py-2 bg-[#E58E26] hover:bg-[#d17d1f] rounded-xl transition-colors text-sm font-semibold shadow-lg"
              >
                Atualizar Insights
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Table */}
      {criticalStock.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#E58E26]" />
              Atenção: Reposição Necessária
            </h3>
            <span className="bg-orange-100 text-[#E58E26] text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Prioridade Alta
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Estoque Atual</th>
                  <th className="px-6 py-4">Estoque Mínimo</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalStock.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-slate-600">{p.category}</td>
                    <td className="px-6 py-4">
                      <span className="text-[#E58E26] font-bold">{p.stock}</span> {p.unit}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{p.minStock} {p.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#0A3D62] hover:text-[#E58E26] font-semibold text-sm underline">Fazer Pedido</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'navy' | 'orange';
  alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, subtitle, icon, color, alert }) => {
  const colors = {
    navy: 'border-blue-100 bg-blue-50/50',
    orange: 'border-orange-100 bg-orange-50/50',
  };

  return (
    <div className={`p-6 bg-white rounded-2xl border ${alert ? 'ring-2 ring-[#E58E26] border-orange-200' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]} border shadow-sm`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-[#2D3436]">{value}</h4>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
