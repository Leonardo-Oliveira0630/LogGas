
import React from 'react';
import { User } from '../types';
import { CreditCard, CheckCircle2, Zap, Layout, Globe, Star, ShieldCheck } from 'lucide-react';

interface BillingProps {
  user: User;
}

const Billing: React.FC<BillingProps> = ({ user }) => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-[#0A3D62] tracking-tighter">Faturamento LogGas</h2>
        <p className="text-slate-500 mt-1">Gerencie sua assinatura, planos e custos do software.</p>
      </div>

      {/* Plano Atual */}
      <div className="bg-[#0A3D62] rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-blue-900/20">
         <div className="absolute top-0 right-0 p-12 opacity-5">
            <ShieldCheck size={200} />
         </div>
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-[#E58E26] rounded-3xl flex items-center justify-center shadow-lg">
               <Zap size={40} />
            </div>
            <div>
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Seu Plano Atual</p>
               <h3 className="text-3xl font-black capitalize">{user.plan || 'Gratuito'}</h3>
               <p className="text-emerald-400 text-sm font-bold mt-1">Status: Assinatura Ativa</p>
            </div>
         </div>
         <div className="relative z-10 text-right">
            <p className="text-slate-400 text-sm font-medium mb-2">Próxima cobrança: 15/12/2023</p>
            <h4 className="text-4xl font-black">R$ 199,00<span className="text-sm font-medium text-slate-400">/mês</span></h4>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <PlanCard 
            name="LogGas Starter" 
            price="R$ 0" 
            features={['Até 50 vendas/mês', 'Gestão de Estoque Básica', '1 Usuário Admin', 'Loja Online Simples']}
            current={user.plan === 'free'}
         />
         <PlanCard 
            name="LogGas Pro" 
            price="R$ 199" 
            recommended 
            features={['Vendas Ilimitadas', 'Insights Gemini AI', 'Gestão de Entregas c/ Rota', 'Multi-usuários', 'Relatórios Avançados']}
            current={user.plan === 'pro'}
         />
         <PlanCard 
            name="LogGas Enterprise" 
            price="R$ 499" 
            features={['API de Integração', 'Suporte Prioritário 24/7', 'Múltiplas Unidades (Filiais)', 'Treinamento Equipe', 'Custom Branding']}
            current={user.plan === 'enterprise'}
         />
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-slate-200">
         <h4 className="text-lg font-black text-[#0A3D62] mb-6 flex items-center gap-2">
            <CreditCard className="text-[#E58E26]" /> Histórico de Faturas
         </h4>
         <div className="space-y-4">
            <InvoiceRow date="15/11/2023" status="Pago" value="R$ 199,00" />
            <InvoiceRow date="15/10/2023" status="Pago" value="R$ 199,00" />
            <InvoiceRow date="15/09/2023" status="Pago" value="R$ 199,00" />
         </div>
      </div>
    </div>
  );
};

const PlanCard = ({ name, price, features, recommended, current }: any) => (
  <div className={`bg-white rounded-[32px] p-8 border-2 flex flex-col transition-all relative ${recommended ? 'border-[#E58E26] shadow-xl' : 'border-slate-100 hover:border-slate-200'}`}>
    {recommended && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E58E26] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
        Mais Popular
      </span>
    )}
    <h4 className="text-xl font-black text-[#0A3D62] mb-1">{name}</h4>
    <div className="mb-8">
      <span className="text-4xl font-black text-[#2D3436]">{price}</span>
      <span className="text-slate-400 text-sm font-medium">/mês</span>
    </div>
    
    <div className="flex-1 space-y-4 mb-8">
      {features.map((f: string) => (
        <div key={f} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          {f}
        </div>
      ))}
    </div>

    <button 
      disabled={current}
      className={`w-full py-4 rounded-2xl font-black transition-all ${current ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-[#0A3D62] text-white hover:bg-[#06243a] shadow-lg shadow-blue-900/20'}`}
    >
      {current ? 'Seu Plano Atual' : 'Fazer Upgrade'}
    </button>
  </div>
);

const InvoiceRow = ({ date, status, value }: any) => (
   <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border-b border-slate-50 last:border-none">
      <div className="flex items-center gap-4">
         <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={20} />
         </div>
         <div>
            <p className="font-bold text-slate-800 text-sm">Fatura de {date}</p>
            <p className="text-xs text-slate-400">Assinatura LogGas Pro</p>
         </div>
      </div>
      <div className="text-right">
         <p className="font-black text-slate-900 text-sm">{value}</p>
         <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Download PDF</button>
      </div>
   </div>
)

export default Billing;
