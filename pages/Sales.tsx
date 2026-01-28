
import React, { useState } from 'react';
import { Sale, Product, SaleStatus } from '../types';
import { Plus, ShoppingCart, Search, Filter, Eye, Printer } from 'lucide-react';
import NewSaleModal from '../components/NewSaleModal';

interface SalesProps {
  sales: Sale[];
  products: Product[];
  onProcessSale: (sale: Sale) => void;
}

const Sales: React.FC<SalesProps> = ({ sales, products, onProcessSale }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Vendas</h2>
          <p className="text-slate-500">Histórico e registro de transações comerciais.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus size={20} />
          Registrar Venda
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
             <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar por cliente ou ID de venda..." 
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
              <Filter size={18} />
              Filtros
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Data / ID</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Pagamento</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                        Nenhuma venda registrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    sales.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                            <span className="text-xs text-slate-400 font-mono">#{s.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{s.customerName}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm italic">{s.paymentMethod}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">R$ {s.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            s.status === SaleStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Eye size={18} /></button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><Printer size={18} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-500" />
              Resumo Hoje
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-slate-500">Vendas</span>
                <span className="font-bold">{sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-slate-500">Total Faturado</span>
                <span className="font-bold text-emerald-600">
                  R$ {sales
                    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
                    .reduce((acc, s) => acc + s.total, 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
              Gerar Relatório
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/20">
            <h3 className="font-bold mb-2">Próximos Passos</h3>
            <p className="text-sm text-blue-100">
              Em breve: Pagamentos via PIX Integrado e Cartão diretamente por aqui!
            </p>
          </div>
        </div>
      </div>

      <NewSaleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        products={products}
        onSave={onProcessSale}
      />
    </div>
  );
};

export default Sales;
