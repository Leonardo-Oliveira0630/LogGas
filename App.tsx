
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
import CustomerStore from './pages/CustomerStore';
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
  
  // Estados Sincronizados
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await dbGetUserProfile(firebaseUser.uid);
        if (profile) {
          setCurrentUser(profile);
          // Se for super_admin, mudar aba padrão
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

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'customer')) {
      const unsubProducts = subscribeToCollection("products", setProducts);
      const unsubSales = subscribeToCollection("sales", setSales);
      const unsubTransactions = subscribeToCollection("transactions", setTransactions);
      const unsubCustomers = subscribeToCollection("customers", setCustomers);

      return () => {
        unsubProducts(); unsubSales(); unsubTransactions(); unsubCustomers();
      };
    }
  }, [currentUser]);

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
    for (const item of newSale.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) await dbUpdateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) });
    }
    await dbAddTransaction({
      date: newSale.date,
      description: `Venda ${newSale.origin} #${newSale.id} - ${newSale.customerName}`,
      type: 'income',
      amount: newSale.total,
      category: 'Vendas'
    });
    if (newSale.customerId !== '0') {
      const customer = customers.find(c => c.id === newSale.customerId);
      await dbUpdateCustomerStats(newSale.customerId, {
        purchaseCount: (customer?.purchaseCount || 0) + 1,
        totalSpent: (customer?.totalSpent || 0) + newSale.total,
        lastPurchaseDate: newSale.date,
        name: newSale.customerName
      });
    }
  };

  const handleUpdateSaleStatus = async (saleId: string, status: SaleStatus) => {
    await dbUpdateSaleStatus(saleId, status);
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#0A3D62] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Sincronizando LogGas SaaS...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={(u) => setCurrentUser(u)} />;
  }

  if (currentUser.role === 'customer') {
    return <CustomerStore user={currentUser} products={products} onProcessSale={handleProcessSale} onLogout={handleLogout} />;
  }

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
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Fluxo de Caixa da Distribuidora</h2>
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
          LogGas SaaS Infrastructure • {currentUser.companyName || 'Distribuidora LogGas'}
        </footer>
      </main>
    </div>
  );
};

export default App;
