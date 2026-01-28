
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings,
  Truck,
  LogOut,
  Globe,
  ShieldCheck,
  CreditCard,
  Zap,
  LucideIcon
} from 'lucide-react';

// MenuItem interface explicitly defines common properties and the optional badge property
interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onlineOrdersCount?: number;
  isSuperAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, onlineOrdersCount = 0, isSuperAdmin }) => {
  
  const superAdminItems: MenuItem[] = [
    { id: 'super_admin', label: 'Painel Global', icon: ShieldCheck },
    { id: 'system_metrics', label: 'Infraestrutura', icon: Zap },
  ];

  const adminItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'online_orders', label: 'Pedidos Online', icon: Globe, badge: onlineOrdersCount },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'deliveries', label: 'Entregas', icon: Truck },
    { id: 'reports', label: 'Relatórios', icon: TrendingUp },
    { id: 'billing', label: 'Meu Plano SaaS', icon: CreditCard },
  ];

  const menuItems = isSuperAdmin ? superAdminItems : adminItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0A3D62] text-white flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[#E58E26] p-2 rounded-lg shadow-lg">
          <Truck size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">LogGas</h1>
      </div>

      <nav className="flex-1 mt-4 px-4 space-y-2">
        <div className="mb-4">
           <p className="px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
              Menu {isSuperAdmin ? 'Plataforma' : 'Distribuidora'}
           </p>
           {menuItems.map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                 activeTab === item.id 
                   ? 'bg-[#E58E26] text-white shadow-lg shadow-orange-900/20' 
                   : 'text-slate-300 hover:bg-[#2D3436] hover:text-white'
               }`}
             >
               <item.icon size={20} />
               <span className="font-medium">{item.label}</span>
               {item.badge !== undefined && item.badge > 0 && (
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-[#0A3D62]">
                   {item.badge}
                 </span>
               )}
             </button>
           ))}
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-[#2D3436] hover:text-white rounded-xl transition-colors">
          <Settings size={20} />
          <span className="font-medium">Configurações</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
