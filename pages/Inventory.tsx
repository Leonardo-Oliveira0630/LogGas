
import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Plus, Filter, Search, Edit2, Trash2, RefreshCw, PackagePlus, Globe, GlobeLock } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';
import RestockModal from '../components/RestockModal';
import EditProductModal from '../components/EditProductModal';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onRestockProduct: (productId: string, quantity: number, totalCost: number) => void;
  onToggleOnline: (productId: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct, onRestockProduct, onToggleOnline }) => {
  const [filter, setFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase()) || p.sku.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenRestock = (product: Product) => {
    setSelectedProduct(product);
    setIsRestockModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Estoque</h2>
          <p className="text-slate-500">Gerencie seus produtos e monitore os níveis de suprimento.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-all">
            <RefreshCw size={18} />
            Sincronizar
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus size={18} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas as Categorias</option>
            <option value={Category.GAS}>Gás</option>
            <option value={Category.WATER}>Água</option>
            <option value={Category.BEVERAGE}>Bebidas</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
            <Filter size={18} />
            Mais Filtros
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">SKU / Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Qtd Atual</th>
                <th className="px-6 py-4 text-right">Preço Venda</th>
                <th className="px-6 py-4 text-center">Loja Online</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="text-xs text-slate-400 font-mono tracking-tight">{p.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      p.category === Category.GAS ? 'bg-orange-100 text-orange-700' :
                      p.category === Category.WATER ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${p.stock <= p.minStock ? 'text-red-500' : 'text-slate-900'}`}>
                        {p.stock}
                      </span>
                      <span className="text-slate-400 text-sm">{p.unit}</span>
                      {p.stock <= p.minStock && (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-semibold text-slate-900">
                    R$ {p.sellPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => onToggleOnline(p.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                        p.showOnline 
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {p.showOnline ? <Globe size={12} /> : <GlobeLock size={12} />}
                      {p.showOnline ? 'Visível' : 'Oculto'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenRestock(p)}
                      title="Repor Estoque"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <PackagePlus size={18} />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={onAddProduct} 
      />

      <RestockModal 
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        product={selectedProduct}
        onRestock={onRestockProduct}
      />

      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onSave={onUpdateProduct}
        />
      )}
    </div>
  );
};

export default Inventory;
