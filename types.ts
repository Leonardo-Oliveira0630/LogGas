
export enum Category {
  GAS = 'Gás',
  WATER = 'Água',
  BEVERAGE = 'Bebida'
}

export enum PaymentMethod {
  CASH = 'Dinheiro',
  PIX = 'PIX',
  CREDIT_CARD = 'Cartão de Crédito',
  DEBIT_CARD = 'Cartão de Débito',
  BOLETO = 'Boleto',
  ONLINE = 'Pagamento Online'
}

export enum SaleStatus {
  PENDING = 'Pendente',
  PREPARING = 'Preparando Envio',
  SHIPPED = 'Em Rota de Entrega',
  COMPLETED = 'Concluída',
  CANCELLED = 'Cancelada'
}

export type UserRole = 'admin' | 'customer' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  address?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  subscriptionStatus?: 'active' | 'past_due' | 'canceled';
  companyName?: string;
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  address: string;
  phone: string;
  customerName?: string;
  creditLimit: number;
  status: 'active' | 'debtor';
  lastPurchaseDate?: string;
  purchaseCount: number;
  totalSpent: number;
  averageIntervalDays?: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  sku: string;
  stock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  unit: string;
  active: boolean;
  showOnline: boolean;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  customerAddress?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  origin: 'presencial' | 'online';
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
}

export interface SaaSMetrics {
  totalDistributors: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  systemHealth: 'perfect' | 'warning' | 'critical';
}

// Added missing DeliveryDriver and DeliveryRoute interfaces to fix import errors in Deliveries.tsx
export interface DeliveryDriver {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  status: 'available' | 'delivering' | 'offline';
}

export interface DeliveryRoute {
  id: string;
  driverId: string;
  saleIds: string[];
  status: 'pending' | 'in_progress' | 'completed';
  date: string;
}
