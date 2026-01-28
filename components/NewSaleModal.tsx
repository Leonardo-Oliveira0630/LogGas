
import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Minus, Trash2, CheckCircle2, ShoppingCart, User } from 'lucide-react';
import { Product, Sale, SaleItem, PaymentMethod, SaleStatus } from '../types';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (sale: Sale) => void;
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({ isOpen, onClose, products, onSave }) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('Consumidor Final');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const filteredProducts = useMemo(() => {
    if (!search) return [];
    return products.filter(p => 
      (p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())) &&
      p.active && p.stock > 0
    );
  }, [search, products]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return; // Limite de estoque
      setCart(cart.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        productName: product.name, 
        quantity: 1, 
        price: product.sellPrice 
      }]);
    }
    setSearch('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = item.quantity + delta;
        if (newQty > 0 && product && newQty <= product.stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const handleFinish = () => {
    if (cart.length === 0) return;

    // Fixed: Added missing origin property
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 7).toUpperCase(),
      date: new Date().toISOString(),
      customerId: '0',
      customerName,
      items: cart,
      total,
      paymentMethod,
      status: SaleStatus.COMPLETED,
      origin: 'presencial'
    };

    onSave(sale);
    onClose();
    setCart([]);
    setCustomerName('Consumidor Final');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-600">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Nova Venda Presencial</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ponto de Venda (PDV)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Lado Esquerdo: Busca e Seleção */}
          <div className="flex-[1.5] p-8 border-r border-slate-100 flex flex-col gap-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Search size={16} />
                Pesquisar Produtos
              </label>
              <div className="relative">
                <input 
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium"
                  placeholder="Nome do produto ou SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 max-h-64 overflow-y-auto">
                    {filteredProducts.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="w-full p-4 hover:bg-slate-50 flex items-center justify-between border-b last:border-none"
                      >
                        <div className="text-left">
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.sku} • {p.stock} em estoque</p>
                        </div>
                        <span className="font-bold text-blue-600">R$ {p.sellPrice.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={16} />
                Cliente
              </label>
              <input 
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do cliente (opcional)"
              />
            </div>

            <div className="mt-auto bg-blue-50 p-6 rounded-[24px] border border-blue-100">
              <h4 className="text-blue-800 font-bold mb-3">Dica do PDV</h4>
              <p className="text-blue-700 text-sm">
                As vendas registradas aqui reduzem o estoque imediatamente e são lançadas no seu fluxo de caixa como 'Vendas'.
              </p>
            </div>
          </div>

          {/* Lado Direito: Carrinho e Checkout */}
          <div className="flex-1 bg-slate-50/50 p-8 flex flex-col">
            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
              Itens do Pedido
              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs">{cart.length} itens</span>
            </h4>

            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 text-sm leading-tight">{item.productName}</span>
                      <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"><Minus size={14}/></button>
                        <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"><Plus size={14}/></button>
                      </div>
                      <span className="font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Método</span>
                <select 
                  className="bg-transparent font-bold text-slate-900 outline-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value={PaymentMethod.CASH}>Dinheiro (Presencial)</option>
                  <option value={PaymentMethod.PIX}>PIX</option>
                  <option value={PaymentMethod.DEBIT_CARD}>Cartão de Débito</option>
                </select>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-medium pb-1">Total Geral</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <button 
                disabled={cart.length === 0}
                onClick={handleFinish}
                className={`w-full py-5 rounded-[20px] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 ${
                  cart.length > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 size={24} />
                FINALIZAR VENDA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSaleModal;