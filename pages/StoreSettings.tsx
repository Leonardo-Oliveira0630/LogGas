
import React, { useState } from 'react';
import { User, Product } from '../types';
import { ExternalLink, Copy, Check, Globe, Layout, Share2, Smartphone, Monitor, Eye } from 'lucide-react';
import PublicStore from './PublicStore';

interface StoreSettingsProps {
  user: User;
  products: Product[];
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ user, products }) => {
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const storeUrl = `${window.location.origin}/?dist=${user.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#0A3D62] tracking-tighter">Minha Loja Digital</h2>
          <p className="text-slate-500 mt-1">Configure sua vitrine pública e compartilhe com seus clientes.</p>
        </div>
        <a 
          href={storeUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-slate-100 text-[#0A3D62] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
        >
          Acessar Loja <ExternalLink size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Link e Configurações */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-8">
              <div className="space-y-4">
                 <div className="w-12 h-12 bg-blue-50 text-[#0A3D62] rounded-2xl flex items-center justify-center">
                    <Share2 size={24} />
                 </div>
                 <h3 className="text-xl font-black text-[#0A3D62]">Link de Vendas</h3>
                 <p className="text-sm text-slate-500 font-medium">Divulgue este link no seu WhatsApp, Instagram e materiais impressos para receber pedidos online.</p>
                 
                 <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                    <input 
                      readOnly 
                      value={storeUrl}
                      className="flex-1 bg-transparent text-xs font-bold text-slate-400 px-3 outline-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className={`p-3 rounded-xl transition-all flex items-center gap-2 font-black text-xs ${copied ? 'bg-emerald-500 text-white' : 'bg-[#0A3D62] text-white hover:bg-[#06243a]'}`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-6">
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Configurações Rápidas</h4>
                 <div className="space-y-4">
                    <ToggleItem label="Aceitar Pedidos Online" defaultChecked />
                    <ToggleItem label="Mostrar Estoque para Cliente" />
                    <ToggleItem label="Permitir Pagamento Online (PIX)" defaultChecked />
                 </div>
              </div>
           </div>

           <div className="bg-[#E58E26] rounded-[32px] p-8 text-white shadow-xl shadow-orange-500/20">
              <Globe className="mb-4 opacity-50" size={32} />
              <h4 className="text-lg font-black mb-2 tracking-tight">Dica de Conversão</h4>
              <p className="text-sm font-medium text-white/80 leading-relaxed">
                Distribuidoras que usam o link da LogGas no WhatsApp vendem até 40% mais por não precisarem atender cada ligação manualmente.
              </p>
           </div>
        </div>

        {/* Preview da Loja */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-4 shadow-2xl overflow-hidden flex flex-col h-[800px]">
              <div className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-500 text-[10px] font-bold ml-4 uppercase tracking-widest">Live Preview da sua Loja</span>
                 </div>
                 <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      <Monitor size={18} />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      <Smartphone size={18} />
                    </button>
                 </div>
              </div>

              <div className="flex-1 bg-white rounded-[32px] overflow-hidden relative">
                 <div className={`mx-auto h-full transition-all duration-500 shadow-2xl ${previewMode === 'mobile' ? 'max-w-[375px] border-x-[8px] border-slate-900' : 'max-w-full'}`}>
                    <div className="h-full overflow-y-auto pointer-events-none scale-90 origin-top">
                       <PublicStore 
                          storeId={user.id} 
                          products={products} 
                          onProcessSale={() => {}} 
                       />
                    </div>
                    {/* Overlay para indicar que é preview */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest pointer-events-none">
                       <Eye size={16} /> Modo de Visualização
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ label, defaultChecked }: any) => (
  <div className="flex items-center justify-between py-2">
     <span className="text-sm font-bold text-[#0A3D62]">{label}</span>
     <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${defaultChecked ? 'bg-[#E58E26]' : 'bg-slate-200'}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-all ${defaultChecked ? 'translate-x-6' : 'translate-x-0'}`}></div>
     </div>
  </div>
);

export default StoreSettings;
