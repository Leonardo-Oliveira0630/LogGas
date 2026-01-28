
import React from 'react';
import { Sale, SaleStatus } from '../types';
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone, ExternalLink } from 'lucide-react';

interface OnlineOrdersProps {
  sales: Sale[];
  onUpdateStatus: (saleId: string, status: SaleStatus) => void;
}

const OnlineOrders: React.FC<OnlineOrdersProps> = ({ sales, onUpdateStatus }) => {
  const onlineSales = sales.filter(s => s.origin === 'online').sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pendingCount = onlineSales.filter(s => s.status === SaleStatus.PENDING).length;

  const getStatusColor = (status: SaleStatus) => {
    switch (status) {
      case SaleStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case SaleStatus.PREPARING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case SaleStatus.SHIPPED: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case SaleStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case SaleStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pedidos Online</h2>
          <p className="text-slate-500 mt-1">Gerencie as solicitações vindas do portal do cliente.</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
            <Clock size={16} />
            {pendingCount} Pedidos Pendentes
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {onlineSales.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-slate-400">
            <Package size={64} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum pedido online recebido ainda.</p>
          </div>
        ) : (
          onlineSales.map(order => (
            <div key={order.id} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="p-6 flex flex-col lg:flex-row gap-8">
                {/* Info do Pedido */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pedido #{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{order.customerName}</h3>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        {order.customerAddress || 'Endereço não informado'}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        Contato via WhatsApp
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-bold text-slate-700">
                        {item.quantity}x {item.productName}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status e Ações */}
                <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                  <div className="text-right mb-6 lg:mb-0">
                    <p className="text-xs text-slate-400 font-bold uppercase">Total a Receber</p>
                    <p className="text-3xl font-black text-slate-900">R$ {order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-tight">Pagamento: {order.paymentMethod}</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mt-4">
                    {order.status === SaleStatus.PENDING && (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(order.id, SaleStatus.PREPARING)}
                          className="bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Package size={16} /> Aceitar Pedido
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(order.id, SaleStatus.CANCELLED)}
                          className="bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                        >
                          Recusar
                        </button>
                      </>
                    )}
                    {order.status === SaleStatus.PREPARING && (
                      <button 
                        onClick={() => onUpdateStatus(order.id, SaleStatus.SHIPPED)}
                        className="bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Truck size={16} /> Saiu para Entrega
                      </button>
                    )}
                    {order.status === SaleStatus.SHIPPED && (
                      <button 
                        onClick={() => onUpdateStatus(order.id, SaleStatus.COMPLETED)}
                        className="bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Confirmar Entrega
                      </button>
                    )}
                    {order.status === SaleStatus.COMPLETED && (
                      <div className="text-center py-2 text-emerald-600 font-bold text-sm flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Finalizado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineOrders;
