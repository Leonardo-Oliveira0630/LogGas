
import React, { useState } from 'react';
import { Customer, Sale } from '../types';
import { Search, User, Phone, MapPin, Calendar, TrendingUp, History, MessageSquare, ExternalLink, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { getCustomerProjections } from '../services/geminiService';

interface CustomersProps {
  customers: Customer[];
  sales: Sale[];
}

const Customers: React.FC<CustomersProps> = ({ customers, sales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [aiProjection, setAiProjection] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm)
  );

  const handleOpenDetail = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setAiProjection('');
    setLoadingAi(true);
    const projection = await getCustomerProjections(customer, sales);
    setAiProjection(projection);
    setLoadingAi(false);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Clientes</h2>
          <p className="text-slate-500 mt-1">Monitore o comportamento de compra e fidelize seus clientes.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <TrendingUp size={16} />
            Lembretes Automáticos Ativos
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total de Clientes</p>
          <h4 className="text-3xl font-bold text-slate-900">{customers.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Média de Gasto</p>
          <h4 className="text-3xl font-bold text-slate-900">R$ 145,20</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-slate-500">Próximos da Recompra</p>
          <h4 className="text-3xl font-bold text-orange-600">12 Clientes</h4>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, documento ou telefone..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Última Compra</th>
                <th className="px-6 py-4">Frequência</th>
                <th className="px-6 py-4 text-right">Total Gasto</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.status === 'active' ? 'Ativo' : 'Inadimplente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString('pt-BR') : 'Nunca comprou'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">~{c.averageIntervalDays || 30} dias</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    R$ {c.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenDetail(c)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl transition-all"
                    >
                      Ver Métricas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-bold"><Phone size={12} /> {selectedCustomer.phone}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-bold"><MapPin size={12} /> {selectedCustomer.address}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <AlertCircle size={24} className="rotate-45 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
              {/* Left Side: Stats & History */}
              <div className="flex-1 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Compras</p>
                    <p className="text-xl font-black text-slate-900">{selectedCustomer.purchaseCount}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Fidelidade</p>
                    <p className="text-xl font-black text-emerald-600">Alta</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Inadimplência</p>
                    <p className="text-xl font-black text-emerald-600">Zero</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <History size={18} />
                    Histórico Recente
                  </h4>
                  <div className="space-y-3">
                    {sales.filter(s => s.customerId === selectedCustomer.id).map(sale => (
                      <div key={sale.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{new Date(sale.date).toLocaleDateString('pt-BR')}</p>
                            <p className="text-xs text-slate-400">{sale.items.length} itens • {sale.paymentMethod}</p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900">R$ {sale.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: AI Projections & Reminders */}
              <div className="w-full lg:w-[400px] space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Sparkles size={100} />
                  </div>
                  <h4 className="font-black text-lg mb-4 flex items-center gap-2">
                    <Sparkles size={20} />
                    Projeção IA
                  </h4>
                  
                  {loadingAi ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <p className="text-xs text-blue-100 animate-pulse">Calculando consumo...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line text-blue-50 border border-white/10">
                        {aiProjection}
                      </div>
                      <button className="w-full py-3 bg-white text-blue-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                        <MessageSquare size={16} />
                        Enviar Lembrete WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-orange-500" />
                    Próximo Lembrete Automático
                  </h4>
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 text-sm font-bold flex items-center gap-3">
                    <Clock size={20} />
                    Agendado para 15/11/2023
                  </div>
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                    Nossa IA detectou que este cliente compra água a cada 10 dias. O lembrete será enviado às 09:00.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
