
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle2, Package, MapPin, User, Phone, ArrowRight, ChevronLeft } from 'lucide-react';
import { Product, Sale, SaleItem, Category, PaymentMethod, SaleStatus } from '../types';

interface PublicStoreProps {
  storeId: string;
  products: Product[];
  onProcessSale: (sale: Sale) => void;
}

const PublicStore: React.FC<PublicStoreProps> = ({ storeId, products, onProcessSale }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [checkoutStep, setCheckoutStep] = useState<'browsing' | 'details' | 'success'>('browsing');
  
  // Dados do Cliente (Anônimo)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.active && 
      p.showOnline && 
      (activeCategory === 'all' || p.category === activeCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search, activeCategory]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, quantity: 1, price: product.sellPrice }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = item.quantity + delta;
        if (newQty > 0 && product && newQty <= product.stock) return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleFinalizeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    const sale: Sale = {
      id: `WEB-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      date: new Date().toISOString(),
      customerId: '0', // Cliente anônimo
      customerName: customerInfo.name,
      customerAddress: customerInfo.address,
      customerPhone: customerInfo.phone,
      items: cart,
      total,
      paymentMethod: PaymentMethod.PIX, 
      status: SaleStatus.PENDING, 
      origin: 'online'
    };

    onProcessSale(sale);
    setCart([]);
    setCheckoutStep('success');
  };

  if (checkoutStep === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black text-[#0A3D62] mb-2">Pedido Recebido!</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Olá {customerInfo.name}, seu pedido já está no nosso sistema. 
          Em instantes nossa equipe entrará em contato via WhatsApp no número {customerInfo.phone}.
        </p>
        <button 
          onClick={() => { setCheckoutStep('browsing'); setCustomerInfo({name:'', phone:'', address:''}); }}
          className="px-8 py-4 bg-[#0A3D62] text-white rounded-2xl font-black hover:bg-[#06243a] transition-all"
        >
          Voltar para a Loja
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar Minimalista */}
      <header className="bg-[#0A3D62] text-white h-20 flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#E58E26] p-2 rounded-xl text-white">
            <Package size={20} />
          </div>
          <h1 className="text-lg font-black tracking-tight uppercase">LogGas <span className="text-[#E58E26]">Store</span></h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loja Oficial</p>
              <p className="text-sm font-bold">Distribuidora LogGas</p>
           </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Lado Esquerdo: Navegação ou Formulário */}
        <div className="flex-[2] space-y-6">
          {checkoutStep === 'browsing' ? (
            <>
              {/* Busca e Categorias */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="O que você precisa hoje?"
                    className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#E58E26] transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['all', ...Object.values(Category)].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap text-sm transition-all ${
                        activeCategory === cat ? 'bg-[#0A3D62] text-white' : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'Todos' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Produtos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 ${
                      p.category === Category.GAS ? 'bg-orange-50 text-[#E58E26]' : 'bg-blue-50 text-[#0A3D62]'
                    }`}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 leading-tight">{p.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{p.category}</p>
                      <p className="text-lg font-black text-slate-900 mt-1">R$ {p.sellPrice.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(p)}
                      className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-[#E58E26] hover:text-white transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* PASSO: Detalhes da Entrega */
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm animate-in slide-in-from-left duration-300">
               <button onClick={() => setCheckoutStep('browsing')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-[#0A3D62]">
                  <ChevronLeft size={18} /> Voltar para a loja
               </button>
               <h2 className="text-2xl font-black text-[#0A3D62] mb-2">Dados para Entrega</h2>
               <p className="text-slate-500 mb-8">Precisamos dessas informações para levar seu pedido até você.</p>
               
               <form id="checkout-form" onSubmit={handleFinalizeOrder} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Seu Nome Completo</label>
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                           required
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#0A3D62] focus:bg-white rounded-2xl outline-none transition-all"
                           placeholder="Ex: Maria Oliveira"
                           value={customerInfo.name}
                           onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">WhatsApp / Telefone</label>
                     <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                           required
                           type="tel"
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#0A3D62] focus:bg-white rounded-2xl outline-none transition-all"
                           placeholder="(00) 00000-0000"
                           value={customerInfo.phone}
                           onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Endereço de Entrega</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                        <textarea 
                           required
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#0A3D62] focus:bg-white rounded-2xl outline-none transition-all min-h-[120px]"
                           placeholder="Rua, Número, Bairro e Complemento..."
                           value={customerInfo.address}
                           onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                        />
                     </div>
                  </div>
               </form>
            </div>
          )}
        </div>

        {/* Lado Direito: Carrinho e Total */}
        <div className="lg:w-[380px]">
          <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-xl sticky top-28 flex flex-col max-h-[calc(100vh-140px)]">
             <h3 className="text-lg font-black text-[#0A3D62] mb-6 flex items-center gap-2">
                <ShoppingCart className="text-[#E58E26]" size={20} />
                Meu Pedido
             </h3>

             <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-300">
                    <ShoppingCart size={48} className="mx-auto mb-2 opacity-10" />
                    <p className="text-sm font-medium">Carrinho Vazio</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.productId} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-slate-800 text-xs leading-tight">{item.productName}</span>
                          <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                       </div>
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-100">
                             <button onClick={() => updateQuantity(item.productId, -1)} className="hover:text-[#E58E26]"><Minus size={12}/></button>
                             <span className="text-xs font-black">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.productId, 1)} className="hover:text-[#E58E26]"><Plus size={12}/></button>
                          </div>
                          <span className="font-black text-slate-900 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                    </div>
                  ))
                )}
             </div>

             <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total</span>
                   <span className="text-3xl font-black text-[#0A3D62]">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {checkoutStep === 'browsing' ? (
                  <button 
                    disabled={cart.length === 0}
                    onClick={() => setCheckoutStep('details')}
                    className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                      cart.length > 0 ? 'bg-[#0A3D62] text-white hover:bg-[#06243a] shadow-lg shadow-blue-900/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Confirmar Pedido
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button 
                    form="checkout-form"
                    type="submit"
                    className="w-full py-5 bg-[#E58E26] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 hover:bg-[#d17d1f] transition-all"
                  >
                    Finalizar e Enviar
                    <CheckCircle2 size={24} />
                  </button>
                )}
                
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                  Pague no PIX ou Cartão ao receber o produto
                </p>
             </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest border-t border-slate-100">
        Tecnologia LogGas Cloud • Sincronizado em Tempo Real
      </footer>
    </div>
  );
};

export default PublicStore;
