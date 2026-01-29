
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import OnlineOrders from './pages/OnlineOrders';
import Deliveries from './pages/Deliveries';
import Reports from './pages/Reports';
import Login from './pages/Login';
import PublicStore from './pages/PublicStore';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Billing from './pages/Billing';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { 
  subscribeToCollection, 
  dbAddProduct, 
  dbUpdateProduct, 
  dbAddSale, 
  dbUpdateSaleStatus, 
  dbAddTransaction,
  dbUpdateCustomerStats,
  dbGetUserProfile
} from './services/firebaseService';
import { Product, Sale, Transaction, User, Customer, SaleStatus } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [storeId, setStoreId] = useState<string | null>(null);
  
  // Estados Sincronizados
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Detectar se é um acesso de cliente via link (SaaS Mode)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dist = params.get('dist');
    if (dist) {
      setStoreId(dist);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await dbGetUserProfile(firebaseUser.uid);
        if (profile) {
          setCurrentUser(profile);
          if (profile.role === 'super_admin') setActiveTab('super_admin');
        } else {
          setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário LogGas',
            email: firebaseUser.email || '',
            role: 'admin'
          });
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sincronização: Se for Admin logado OU se for um Cliente acessando uma StoreId específica
  useEffect(() => {
    // Para simplificar no demo, se tiver storeId ou for admin, carregamos as coleções
    // Em produção real, os produtos seriam filtrados por 'distributorId'
    if (currentUser || storeId) {
      const unsubProducts = subscribeToCollection("products", setProducts);
      
      // Apenas Admins veem vendas, transações e clientes globais
      let unsubSales = () => {};
      let unsubTransactions = () => {};
      let unsubCustomers = () => {};

      if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
        unsubSales = subscribeToCollection("sales", setSales);
        unsubTransactions = subscribeToCollection("transactions", setTransactions);
        unsubCustomers = subscribeToCollection("customers", setCustomers);
      }

      return () => {
        unsubProducts(); unsubSales(); unsubTransactions(); unsubCustomers();
      };
    }
  }, [currentUser, storeId]);

  const handleAddProduct = async (newProduct: Product) => {
    const { id, ...data } = newProduct;
    await dbAddProduct(data);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const { id, ...data } = updatedProduct;
    await dbUpdateProduct(id, data);
  };

  const handleRestockProduct = async (productId: string, quantity: number, totalCost: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    await dbUpdateProduct(productId, { stock: product.stock + quantity });
    await dbAddTransaction({
      date: new Date().toISOString(),
      description: `Reposição: ${product.name} (+${quantity})`,
      type: 'expense',
      amount: totalCost,
      category: 'Estoque'
    });
  };

  const handleToggleOnline = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) await dbUpdateProduct(productId, { showOnline: !product.showOnline });
  };

  const handleProcessSale = async (newSale: Sale) => {
    const { id, ...saleData } = newSale;
    await dbAddSale(saleData);
    
    // Baixa de estoque
    for (const item of newSale.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) await dbUpdateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) });
    }

    // Registro financeiro
    await dbAddTransaction({
      date: newSale.date,
      description: `Venda ${newSale.origin} - ${newSale.customerName}`,
      type: 'income',
      amount: newSale.total,
      category: 'Vendas'
    });

    // Atualiza/Cria Cliente para o CRM do Admin
    // Se for venda online, usamos o telefone como ID único simplificado
    const customerUniqueId = newSale.customerId !== '0' ? newSale.customerId : (newSale.customerPhone || 'guest');
    
    await dbUpdateCustomerStats(customerUniqueId, {
      name: newSale.customerName,
      address: newSale.customerAddress || '',
      phone: newSale.customerPhone || '',
      purchaseCount: 1, // O service faz o merge/incremento
      totalSpent: newSale.total,
      lastPurchaseDate: newSale.date,
      status: 'active'
    });
  };

  const handleUpdateSaleStatus = async (saleId: string, status: SaleStatus) => {
    await dbUpdateSaleStatus(saleId, status);
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  // 1. Prioridade: Se houver storeId na URL, mostra a Loja Pública (Independente de login)
  if (storeId) {
    return (
      <PublicStore 
        storeId={storeId} 
        products={products} 
        onProcessSale={handleProcessSale} 
      />
    );
  }

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#0A3D62] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">LogGas SaaS Infrastructure</p>
      </div>
    );
  }

  // 2. Se não estiver logado e não for link de loja, pede login
  if (!currentUser) {
    return <Login onLogin={(u) => setCurrentUser(u)} />;
  }

  // 3. Painel Administrativo
  const onlineOrdersPending = sales.filter(s => s.origin === 'online' && s.status === SaleStatus.PENDING).length;

  const renderContent = () => {
    if (currentUser.role === 'super_admin') {
      switch(activeTab) {
        case 'super_admin': return <SuperAdminDashboard />;
        default: return <SuperAdminDashboard />;
      }
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard products={products} sales={sales} transactions={transactions} />;
      case 'online_orders': return <OnlineOrders sales={sales} onUpdateStatus={handleUpdateSaleStatus} />;
      case 'inventory': return <Inventory products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onRestockProduct={handleRestockProduct} onToggleOnline={handleToggleOnline} />;
      case 'sales': return <Sales sales={sales} products={products} onProcessSale={handleProcessSale} />;
      case 'customers': return <Customers customers={customers} sales={sales} />;
      case 'deliveries': return <Deliveries sales={sales} onUpdateSaleStatus={handleUpdateSaleStatus} />;
      case 'reports': return <Reports sales={sales} transactions={transactions} products={products} />;
      case 'billing': return <Billing user={currentUser} />;
      case 'finance':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Fluxo de Caixa</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
                      <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default: return <Dashboard products={products} sales={sales} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        onlineOrdersCount={onlineOrdersPending}
        isSuperAdmin={currentUser.role === 'super_admin'}
      />
      
      <main className="flex-1 ml-64 flex flex-col min-h-screen print:ml-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
        
        <footer className="p-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest border-t border-slate-200 print:hidden">
          SaaS Instance: {currentUser.companyName || 'LogGas Cloud'} • ID: {currentUser.id.slice(0,8)}
        </footer>
      </main>
    </div>
  );
};

export default App;
