
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle2, Package, MapPin, User, Phone, ArrowRight, ChevronLeft, Star, Clock, ShieldCheck } from 'lucide-react';
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
      customerId: '0',
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-[#0A3D62] mb-4">Pedido Confirmado!</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg">
          Olá <span className="text-[#0A3D62] font-bold">{customerInfo.name}</span>, recebemos sua solicitação. 
          Nossa equipe entrará em contato via WhatsApp no número <span className="text-[#E58E26] font-bold">{customerInfo.phone}</span>.
        </p>
        <button 
          onClick={() => { setCheckoutStep('browsing'); setCustomerInfo({name:'', phone:'', address:''}); }}
          className="px-10 py-5 bg-[#0A3D62] text-white rounded-2xl font-black hover:bg-[#06243a] transition-all shadow-xl shadow-blue-900/20"
        >
          Voltar para a Loja
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header Estilo Marketplace */}
      <header className="bg-white border-b border-slate-100 h-24 flex items-center sticky top-0 z-50 shadow-sm px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#0A3D62] p-2.5 rounded-2xl text-white shadow-lg">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0A3D62] tracking-tighter leading-none">LogGas</h1>
              <span className="text-[10px] font-black uppercase text-[#E58E26] tracking-widest">Loja Digital</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-12">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="O que você está procurando?"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#0A3D62]/10 outline-none transition-all text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block mr-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atendimento 24h</p>
                <p className="text-sm font-bold text-[#0A3D62]">Distribuidora Oficial</p>
             </div>
             <button className="relative p-3 bg-slate-50 text-[#0A3D62] rounded-2xl hover:bg-slate-100 transition-all">
                <ShoppingCart size={22} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E58E26] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cart.length}
                  </span>
                )}
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
        {checkoutStep === 'browsing' ? (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Categorias e Produtos */}
            <div className="flex-1 space-y-12">
              {/* Hero Banner Minimalista */}
              <div className="bg-gradient-to-r from-[#0A3D62] to-[#1e5d8a] rounded-[40px] p-10 md:p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Star size={200} />
                </div>
                <div className="relative z-10 max-w-md">
                   <span className="bg-[#E58E26] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Sua Região</span>
                   <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">Gás e Água na sua porta.</h2>
                   <p className="text-blue-100/80 text-lg font-medium mb-8">Entrega rápida em menos de 45 minutos para toda a cidade.</p>
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                         <Clock size={18} className="text-[#E58E26]" />
                         <span className="text-sm font-bold">Rápido</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <ShieldCheck size={18} className="text-[#E58E26]" />
                         <span className="text-sm font-bold">Seguro</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Navegação */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-[#0A3D62] tracking-tight">Nossas Coleções</h3>
                  <div className="flex gap-2">
                    {['all', ...Object.values(Category)].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                          activeCategory === cat ? 'bg-[#0A3D62] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200 shadow-sm'
                        }`}
                      >
                        {cat === 'all' ? 'Ver Tudo' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white rounded-[32px] p-6 border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
                      <div className={`aspect-square rounded-[24px] mb-6 flex items-center justify-center text-4xl font-black relative overflow-hidden ${
                        p.category === Category.GAS ? 'bg-orange-50 text-[#E58E26]' : 'bg-blue-50 text-[#0A3D62]'
                      }`}>
                        {p.name.charAt(0)}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all"></div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#E58E26] uppercase tracking-widest">{p.category}</span>
                        <h4 className="text-xl font-black text-[#0A3D62] tracking-tight">{p.name}</h4>
                        <p className="text-sm text-slate-400 font-medium">Pronta Entrega</p>
                      </div>
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Preço Unitário</p>
                          <p className="text-2xl font-black text-[#0A3D62]">R$ {p.sellPrice.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => addToCart(p)}
                          className="w-14 h-14 bg-[#0A3D62] text-white rounded-2xl flex items-center justify-center hover:bg-[#E58E26] transition-all shadow-lg hover:shadow-orange-500/30"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar de Resumo - Estilo Wine */}
            <div className="lg:w-[400px]">
              <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl sticky top-32">
                <h3 className="text-2xl font-black text-[#0A3D62] mb-8 flex items-center gap-3">
                  <ShoppingCart className="text-[#E58E26]" /> Seu Carrinho
                </h3>
                
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-8 scrollbar-hide">
                  {cart.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                       <ShoppingCart size={64} className="mx-auto text-slate-100" strokeWidth={1} />
                       <p className="text-slate-400 font-bold">Nenhum item selecionado</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.productId} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-[#0A3D62] shrink-0 border border-slate-100">
                          {item.productName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-[#0A3D62] text-sm leading-tight">{item.productName}</h5>
                          <div className="flex items-center gap-3 mt-2">
                             <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg">
                                <button onClick={() => updateQuantity(item.productId, -1)} className="text-slate-400 hover:text-[#0A3D62]"><Minus size={12}/></button>
                                <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.productId, 1)} className="text-slate-400 hover:text-[#0A3D62]"><Plus size={12}/></button>
                             </div>
                             <span className="text-xs font-black text-slate-900 ml-auto">R$ {(item.price * item.quantity).toFixed(2)}</span>
                             <button onClick={() => removeFromCart(item.productId)} className="text-slate-200 hover:text-red-500"><Trash2 size={14}/></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total do Pedido</span>
                    <span className="text-4xl font-black text-[#0A3D62] tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <button 
                    disabled={cart.length === 0}
                    onClick={() => setCheckoutStep('details')}
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                      cart.length > 0 ? 'bg-[#0A3D62] text-white shadow-xl shadow-blue-900/20 hover:bg-[#06243a]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Confirmar Pedido <ArrowRight size={20} />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                    Pague na entrega via PIX ou Cartão
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout Step - Dados do Cliente */
          <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white rounded-[40px] p-10 md:p-16 border border-slate-100 shadow-2xl animate-in slide-in-from-bottom duration-500">
               <button onClick={() => setCheckoutStep('browsing')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-10 hover:text-[#0A3D62] transition-colors">
                  <ChevronLeft size={18} /> Alterar meu pedido
               </button>

               <div className="mb-12">
                  <h2 className="text-4xl font-black text-[#0A3D62] tracking-tighter">Finalize sua Compra</h2>
                  <p className="text-slate-500 mt-2 text-lg">Informe onde devemos entregar o seu produto.</p>
               </div>

               <form onSubmit={handleFinalizeOrder} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Seu Nome</label>
                        <div className="relative">
                           <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input 
                              required
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-[#0A3D62] focus:bg-white rounded-2xl outline-none transition-all font-medium"
                              placeholder="Como quer ser chamado?"
                              value={customerInfo.name}
                              onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Telefone WhatsApp</label>
                        <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input 
                              required
                              type="tel"
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-[#0A3D62] focus:bg-white rounded-2xl outline-none transition-all font-medium"
                              placeholder="(00) 00000-0000"
                              value={customerInfo.phone}
                              onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Endereço Completo</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-5 text-slate-300" size={18} />
                        <textarea 
                           required
                           className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-transparent focus:border-[#0A3D62] focus:bg-white rounded-2xl outline-none transition-all font-medium min-h-[140px]"
                           placeholder="Rua, Número, Bairro e Ponto de Referência..."
                           value={customerInfo.address}
                           onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="pt-6">
                     <button 
                        type="submit"
                        className="w-full py-6 bg-[#E58E26] text-white rounded-2xl font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-orange-500/30 hover:bg-[#d17d1f] hover:-translate-y-1 transition-all"
                     >
                        Finalizar e Enviar Pedido
                        <CheckCircle2 size={24} />
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-3 grayscale opacity-50">
              <Package size={24} />
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">LogGas Cloud</h1>
           </div>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tecnologia Multi-Tenant Logística • 2023</p>
           <div className="flex gap-6 text-slate-300">
              <ShieldCheck size={20} />
              <Star size={20} />
           </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicStore;
