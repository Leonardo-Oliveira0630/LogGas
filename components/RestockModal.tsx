
import React, { useState } from 'react';
import { X, PackagePlus, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onRestock: (productId: string, quantity: number, totalCost: number) => void;
}

const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, product, onRestock }) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(product?.costPrice || 0);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    onRestock(product.id, quantity, quantity * costPrice);
    onClose();
    setQuantity(0);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <PackagePlus size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Repor Estoque</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Produto Selecionado</p>
            <p className="font-bold text-blue-900">{product.name}</p>
            <p className="text-sm text-blue-700">Estoque atual: <span className="font-bold">{product.stock} {product.unit}</span></p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Quantidade Recebida ({product.unit})</label>
              <input
                type="number"
                required
                autoFocus
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold"
                value={quantity || ''}
                onChange={e => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Preço de Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={costPrice}
                onChange={e => setCostPrice(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl text-amber-800 text-xs border border-amber-100">
              <AlertCircle size={16} />
              <p>O custo total da reposição será de <b>R$ {(quantity * costPrice).toFixed(2)}</b> e será lançado como despesa.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={quantity <= 0}
              className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${quantity > 0 ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              Confirmar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
