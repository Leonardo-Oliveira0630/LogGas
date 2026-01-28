
import React, { useState, useMemo } from 'react';
import { Sale, SaleStatus, DeliveryDriver, DeliveryRoute } from '../types';
import { Truck, MapPin, Navigation, CheckCircle2, Clock, Users, Plus, List, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { optimizeDeliveryRoute } from '../services/geminiService';

interface DeliveriesProps {
  sales: Sale[];
  onUpdateSaleStatus: (saleId: string, status: SaleStatus) => void;
}

const DRIVERS: DeliveryDriver[] = [
  { id: 'd1', name: 'Carlos Santos', vehicle: 'Fiat Fiorino', plate: 'ABC-1234', status: 'available' },
  { id: 'd2', name: 'Marcos Oliveira', vehicle: 'Moto Cargo', plate: 'XYZ-9876', status: 'delivering' },
];

const Deliveries: React.FC<DeliveriesProps> = ({ sales, onUpdateSaleStatus }) => {
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [activeDriver, setActiveDriver] = useState<string>(DRIVERS[0].id);
  const [routeInsight, setRouteInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Pedidos que precisam de entrega (Preparando ou Em Rota)
  const pendingDeliveries = useMemo(() => 
    sales.filter(s => s.status === SaleStatus.PREPARING || s.status === SaleStatus.SHIPPED),
    [sales]
  );

  const handleToggleSale = (saleId: string) => {
    setSelectedSales(prev => 
      prev.includes(saleId) ? prev.filter(id => id !== saleId) : [...prev, saleId]
    );
  };

  const handleOptimize = async () => {
    if (selectedSales.length === 0) return;
    setLoadingAi(true);
    const salesToOptimize = sales.filter(s => selectedSales.includes(s.id));
    const insight = await optimizeDeliveryRoute(salesToOptimize);
    setRouteInsight(insight);
    setLoadingAi(false);
  };

  const handleCreateRoute = () => {
    selectedSales.forEach(id => {
      onUpdateSaleStatus(id, SaleStatus.SHIPPED);
    });
    setSelectedSales([]);
    setRouteInsight('');
    alert('Rota criada e motorista notificado via App!');
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Entregas</h2>
          <p className="text-slate-500 mt-1">Crie rotas inteligentes e monitore seus entregadores em tempo real.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Users size={16} />
            {DRIVERS.filter(d => d.status === 'available').length} Motoristas Disponíveis
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Pedidos Pendentes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Clock className="text-orange-500" size={20} />
                Pedidos Aguardando Rota
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pendingDeliveries.length} pedidos</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {pendingDeliveries.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Truck size={48} className="mx-auto mb-4 opacity-10" />
                  <p>Não há pedidos pendentes de entrega no momento.</p>
                </div>
              ) : (
                pendingDeliveries.map(sale => (
                  <div 
                    key={sale.id} 
                    onClick={() => handleToggleSale(sale.id)}
                    className={`p-6 flex items-center gap-6 cursor-pointer transition-all hover:bg-slate-50 ${selectedSales.includes(sale.id) ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedSales.includes(sale.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-white'}`}>
                      {selectedSales.includes(sale.id) && <CheckCircle2 size={14} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-slate-900">{sale.customerName}</h4>
                        <span className="text-xs font-black text-slate-300">#{sale.id}</span>
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {sale.customerAddress}
                      </p>
                      <div className="flex gap-2 mt-3">
                        {sale.items.map((item, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600">
                            {item.quantity}x {item.productName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${sale.status === SaleStatus.SHIPPED ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Montagem de Rota */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 flex flex-col gap-6 sticky top-24">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Navigation className="text-blue-600" />
              Montar Rota
            </h3>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Selecionar Motorista</label>
              <div className="space-y-2">
                {DRIVERS.map(driver => (
                  <button
                    key={driver.id}
                    onClick={() => setActiveDriver(driver.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${activeDriver === driver.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{driver.name}</p>
                      <p className="text-xs text-slate-400">{driver.vehicle} • {driver.plate}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${driver.status === 'available' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600">Pedidos Selecionados</span>
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                  {selectedSales.length}
                </span>
              </div>
              
              <button 
                disabled={selectedSales.length < 2 || loadingAi}
                onClick={handleOptimize}
                className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                {loadingAi ? <Clock className="animate-spin" size={16} /> : <Sparkles size={16} />}
                OTIMIZAR ROTA COM IA
              </button>
            </div>

            {routeInsight && (
              <div className="bg-indigo-600 rounded-2xl p-4 text-white text-xs leading-relaxed animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-2 font-black border-b border-white/20 pb-2">
                  <Sparkles size={14} /> Sugestão da Logística IA
                </div>
                {routeInsight}
              </div>
            )}

            <button
              disabled={selectedSales.length === 0}
              onClick={handleCreateRoute}
              className={`w-full py-5 rounded-[20px] font-black text-lg flex items-center justify-center gap-3 transition-all ${selectedSales.length > 0 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              Iniciar Rota de Entrega
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4">
            <AlertCircle className="text-orange-500 shrink-0" />
            <div>
              <h4 className="text-orange-900 font-bold text-sm">Atenção Logística</h4>
              <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                Pedidos com mais de 2 horas de espera aparecem no topo da lista com prioridade alta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;
