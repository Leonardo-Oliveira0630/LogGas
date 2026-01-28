
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle2, User as UserIcon, LogOut, Package } from 'lucide-react';
import { Product, Sale, SaleItem, Category, PaymentMethod, SaleStatus, User } from '../types';

interface CustomerStoreProps {
  user: User;
  products: Product[];
  onProcessSale: (sale: Sale) => void;
  onLogout: () => void;
}

const CustomerStore: React.FC<CustomerStoreProps> = ({ user, products, onProcessSale, onLogout }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [orderPlaced, setOrderPlaced] = useState(false);

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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const sale: Sale = {
      id: `WEB-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      date: new Date().toISOString(),
      customerId: user.id,
      customerName: user.name,
      customerAddress: user.address,
      items: cart,
      total,
      paymentMethod: PaymentMethod.PIX, 
      status: SaleStatus.PENDING, 
      origin: 'online'
    };

    onProcessSale(sale);
    setCart([]);
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar do Cliente */}
      <header className="bg-[#0A3D62] text-white h-20 flex items-center justify-between px-8 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-[#E58E26] p-2 rounded-xl text-white shadow-lg">
            <Package size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Log<span className="text-[#E58E26]">Gas</span></h1>
        </div>

        <div className="flex-1 max-w-xl mx-12 hidden md:block">
          <div className="relative text-[#2D3436]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="O que você precisa hoje?"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#E58E26] focus:bg-white transition-all text-white placeholder:text-slate-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{user.name}</p>
            <p className="text-xs text-slate-300">{user.address}</p>
          </div>
          <button onClick={onLogout} className="p-3 text-slate-300 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Lado Esquerdo: Produtos */}
        <div className="flex-[2.5] space-y-8">
          {orderPlaced && (
            <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={24} />
              <p className="font-bold text-lg">Seu pedido foi recebido e está aguardando confirmação!</p>
            </div>
          )}

          {/* Categorias */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {['all', ...Object.values(Category)].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-[#0A3D62] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-[#2D3436] hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          {/* Grid de Produtos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400">
                <p className="text-lg">Nenhum produto disponível no momento.</p>
              </div>
            ) : (
              filteredProducts.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
                  <div>
                    <div className={`w-full aspect-square rounded-2xl mb-4 flex items-center justify-center text-4xl font-black ${
                      p.category === Category.GAS ? 'bg-orange-50 text-[#E58E26]' : 
                      p.category === Category.WATER ? 'bg-blue-50 text-[#0A3D62]' : 'bg-purple-50 text-purple-400'
                    }`}>
                      {p.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-[#2D3436] text-lg">{p.name}</h3>
                    <p className="text-sm text-slate-400 font-medium mb-4">{p.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Preço</p>
                      <p className="text-2xl font-black text-[#2D3436]">R$ {p.sellPrice.toFixed(2)}</p>
                    </div>
                    <button 
                      disabled={p.stock <= 0}
                      onClick={() => addToCart(p)}
                      className={`p-3 rounded-2xl transition-all ${
                        p.stock > 0 ? 'bg-[#E58E26] text-white hover:bg-[#d17d1f] shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado Direito: Carrinho */}
        <div className="flex-1">
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl sticky top-28 h-[calc(100vh-140px)] flex flex-col">
            <h2 className="text-xl font-black text-[#2D3436] mb-8 flex items-center gap-3">
              <ShoppingCart className="text-[#E58E26]" />
              Seu Carrinho
            </h2>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 gap-4">
                  <ShoppingCart size={64} strokeWidth={1} />
                  <p className="font-medium text-lg">Seu carrinho <br /> está vazio.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-[#2D3436] text-sm leading-tight">{item.productName}</span>
                      <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-slate-100 rounded-lg"><Minus size={14}/></button>
                        <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-slate-100 rounded-lg"><Plus size={14}/></button>
                      </div>
                      <span className="font-bold text-[#2D3436]">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Total do Pedido</span>
                <span className="text-3xl font-black text-[#2D3436]">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <button 
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className={`w-full py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 transition-all ${
                  cart.length > 0 ? 'bg-[#0A3D62] text-white hover:bg-[#06243a] shadow-xl shadow-blue-900/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {cart.length > 0 ? 'Fechar Pedido' : 'Selecione um Produto'}
              </button>
              
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                Pagamento via PIX na Entrega
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerStore;
