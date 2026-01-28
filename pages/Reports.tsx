
import React, { useState, useMemo } from 'react';
import { Sale, Transaction, Product, Category, PaymentMethod } from '../types';
import { 
  FileText, 
  Calendar, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign, 
  Printer, 
  Download, 
  ChevronRight, 
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp,
  Package,
  Clock
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface ReportsProps {
  sales: Sale[];
  transactions: Transaction[];
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ sales, transactions, products }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'daily' | 'period'>('daily');

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = s.date.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales, startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transDate = t.date.split('T')[0];
      return transDate >= startDate && transDate <= endDate;
    });
  }, [transactions, startDate, endDate]);

  const totalRevenue = useMemo(() => filteredSales.reduce((acc, s) => acc + s.total, 0), [filteredSales]);
  const totalExpenses = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), 
    [filteredTransactions]
  );
  const netProfit = totalRevenue - totalExpenses;

  const paymentMethodData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredSales.forEach(s => {
      data[s.paymentMethod] = (data[s.paymentMethod] || 0) + s.total;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const productPerformance = useMemo(() => {
    const data: Record<string, { quantity: number, revenue: number }> = {};
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        if (!data[item.productName]) {
          data[item.productName] = { quantity: 0, revenue: 0 };
        }
        data[item.productName].quantity += item.quantity;
        data[item.productName].revenue += item.quantity * item.price;
      });
    });
    return Object.entries(data)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  const COLORS = ['#0A3D62', '#E58E26', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 print:p-0 print:bg-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-[#2D3436] tracking-tight flex items-center gap-3">
            <FileText className="text-[#0A3D62]" />
            Relatórios & Fechamento
          </h2>
          <p className="text-slate-500 mt-1">Balanço detalhado da operação logística e financeira.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 text-[#2D3436] px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 shadow-sm transition-all"
          >
            <Printer size={18} />
            Imprimir
          </button>
          <button className="flex items-center gap-2 bg-[#0A3D62] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#06243a] shadow-lg shadow-blue-900/20 transition-all">
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 print:hidden">
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => {
              setReportType('daily');
              const today = new Date().toISOString().split('T')[0];
              setStartDate(today);
              setEndDate(today);
            }}
            className={`flex-1 md:w-32 py-2 rounded-xl text-sm font-bold transition-all ${reportType === 'daily' ? 'bg-white text-[#0A3D62] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Diário
          </button>
          <button 
            onClick={() => setReportType('period')}
            className={`flex-1 md:w-32 py-2 rounded-xl text-sm font-bold transition-all ${reportType === 'period' ? 'bg-white text-[#0A3D62] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Período
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3D62]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          {reportType === 'period' && (
            <>
              <span className="text-slate-400 font-bold">até</span>
              <div className="relative flex-1 md:w-48">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="date" 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3D62]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all border-l-8 border-l-emerald-500">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Entradas Brutas</span>
          <div>
            <h4 className="text-4xl font-black text-[#2D3436] tracking-tighter">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            <p className="text-sm text-slate-500 mt-2 font-medium">Faturamento total</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all border-l-8 border-l-red-500">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Saídas Totais</span>
          <div>
            <h4 className="text-4xl font-black text-[#2D3436] tracking-tighter">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            <p className="text-sm text-slate-500 mt-2 font-medium">Custos operacionais</p>
          </div>
        </div>

        <div className={`p-8 rounded-[32px] border shadow-xl flex flex-col justify-between transition-all ${netProfit >= 0 ? 'bg-[#0A3D62] border-[#0A3D62] text-white shadow-blue-900/20' : 'bg-red-600 border-red-500 text-white shadow-red-500/20'}`}>
          <span className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-4">Resultado Líquido</span>
          <div>
            <h4 className="text-4xl font-black tracking-tighter">R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            <p className="text-sm text-white/80 mt-2 font-bold uppercase tracking-wide">
              {netProfit >= 0 ? 'Lucro do Período' : 'Déficit no Período'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-[#2D3436] mb-8 flex items-center gap-2">
            <PieChartIcon className="text-[#0A3D62]" size={20} />
            Métodos de Recebimento
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-[#2D3436] mb-8 flex items-center gap-2">
            <TrendingUp className="text-[#E58E26]" size={20} />
            Top Produtos Vendidos
          </h3>
          <div className="space-y-4">
            {productPerformance.slice(0, 5).map((prod, index) => (
              <div key={prod.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-[#2D3436]">{prod.name}</span>
                    <span className="font-black text-[#0A3D62]">R$ {prod.revenue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#E58E26] h-full rounded-full" 
                      style={{ width: `${(prod.revenue / (productPerformance[0]?.revenue || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listagem detalhada */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[#2D3436] text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Data</th>
              <th className="px-8 py-4">Lançamento</th>
              <th className="px-8 py-4">Forma</th>
              <th className="px-8 py-4 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map(sale => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 text-sm text-slate-500">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-8 py-5">
                  <p className="font-bold text-[#2D3436]">{sale.customerName}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">VENDA #{sale.id}</p>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600">{sale.paymentMethod}</td>
                <td className="px-8 py-5 text-right font-black text-[#2D3436]">R$ {sale.total.toFixed(2)}</td>
              </tr>
            ))}
            {filteredTransactions.filter(t => t.type === 'expense').map(trans => (
              <tr key={trans.id} className="hover:bg-slate-50 transition-colors bg-red-50/10">
                <td className="px-8 py-5 text-sm text-slate-500">{new Date(trans.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-8 py-5">
                  <p className="font-bold text-[#2D3436]">{trans.description}</p>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">{trans.category}</p>
                </td>
                <td className="px-8 py-5 text-sm text-slate-400 italic">Despesa</td>
                <td className="px-8 py-5 text-right font-black text-red-600">- R$ {trans.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
