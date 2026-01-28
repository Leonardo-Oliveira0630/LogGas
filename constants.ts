
import { Category, Product, Customer, Sale, SaleStatus, PaymentMethod, Transaction } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Botijão P13', category: Category.GAS, sku: 'GAS-P13', stock: 45, minStock: 20, costPrice: 85.00, sellPrice: 110.00, unit: 'un', active: true, showOnline: true },
  { id: '2', name: 'Galão Água 20L', category: Category.WATER, sku: 'AGU-20L', stock: 12, minStock: 30, costPrice: 6.50, sellPrice: 14.00, unit: 'un', active: true, showOnline: true },
  { id: '3', name: 'Cerveja Lata 350ml', category: Category.BEVERAGE, sku: 'BEV-CERV', stock: 120, minStock: 50, costPrice: 2.80, sellPrice: 4.50, unit: 'un', active: true, showOnline: true },
  { id: '4', name: 'Botijão P45', category: Category.GAS, sku: 'GAS-P45', stock: 5, minStock: 8, costPrice: 320.00, sellPrice: 450.00, unit: 'un', active: true, showOnline: false },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'João Silva', document: '123.456.789-00', address: 'Rua das Flores, 123', phone: '(11) 98888-7777', creditLimit: 500, status: 'active', purchaseCount: 0, totalSpent: 0 },
  { id: '2', name: 'Maria Santos', document: '987.654.321-11', address: 'Av. Paulista, 1000', phone: '(11) 97777-6666', creditLimit: 200, status: 'debtor', purchaseCount: 0, totalSpent: 0 },
];

export const INITIAL_SALES: Sale[] = [
  { 
    id: '101', 
    date: '2023-10-25', 
    customerId: '1', 
    customerName: 'João Silva', 
    total: 124.00, 
    paymentMethod: PaymentMethod.PIX, 
    status: SaleStatus.COMPLETED,
    origin: 'presencial',
    items: [
      { productId: '1', productName: 'Botijão P13', quantity: 1, price: 110.00 },
      { productId: '2', productName: 'Galão Água 20L', quantity: 1, price: 14.00 }
    ]
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-24', description: 'Venda João Silva', type: 'income', amount: 124.00, category: 'Vendas' },
  { id: 't2', date: '2023-10-24', description: 'Compra Fornecedor Gás', type: 'expense', amount: 1500.00, category: 'Estoque' },
  { id: 't3', date: '2023-10-23', description: 'Aluguel Galpão', type: 'expense', amount: 3000.00, category: 'Operacional' },
];
