
import React, { useState } from 'react';
import { X, Save, Globe } from 'lucide-react';
import { Product, Category } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: Category.GAS,
    sku: '',
    stock: 0,
    minStock: 0,
    costPrice: 0,
    sellPrice: 0,
    unit: 'un',
    active: true,
    showOnline: true
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
    };
    onSave(newProduct);
    onClose();
    setFormData({
      name: '',
      category: Category.GAS,
      sku: '',
      stock: 0,
      minStock: 0,
      costPrice: 0,
      sellPrice: 0,
      unit: 'un',
      active: true,
      showOnline: true
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Cadastrar Novo Produto</h3>
            <p className="text-sm text-slate-500">Insira os detalhes técnicos e comerciais do item.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Nome do Produto</label>
              <input
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Botijão de Gás P13"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Categoria</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">SKU / Código Interno</label>
              <input
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="GAS-001"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Estoque Inicial</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Estoque Mínimo (Alerta)</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.minStock}
                onChange={e => setFormData({...formData, minStock: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Preço de Custo (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.costPrice}
                onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Preço de Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                value={formData.sellPrice}
                onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <input 
                type="checkbox" 
                id="showOnline"
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                checked={formData.showOnline}
                onChange={e => setFormData({...formData, showOnline: e.target.checked})}
              />
              <label htmlFor="showOnline" className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <Globe size={18} className="text-blue-500" />
                Exibir este produto na Loja Online da distribuidora
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Save size={20} />
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
