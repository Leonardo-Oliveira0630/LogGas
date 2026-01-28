
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc,
  getDoc,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import { Product, Sale, Transaction, Customer, User } from "../types";

// Observadores de Coleções (Real-time)
export const subscribeToCollection = (collName: string, callback: (data: any[]) => void) => {
  const q = query(collection(db, collName));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
};

// Produtos
export const dbAddProduct = async (product: Omit<Product, 'id'>) => {
  return await addDoc(collection(db, "products"), product);
};

export const dbUpdateProduct = async (id: string, product: Partial<Product>) => {
  const docRef = doc(db, "products", id);
  return await updateDoc(docRef, product);
};

// Vendas
export const dbAddSale = async (sale: Omit<Sale, 'id'>) => {
  return await addDoc(collection(db, "sales"), sale);
};

export const dbUpdateSaleStatus = async (id: string, status: string) => {
  const docRef = doc(db, "sales", id);
  return await updateDoc(docRef, { status });
};

// Transações (Financeiro)
export const dbAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  return await addDoc(collection(db, "transactions"), transaction);
};

// Clientes
export const dbUpdateCustomerStats = async (customerId: string, stats: Partial<Customer>) => {
  const docRef = doc(db, "customers", customerId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return await updateDoc(docRef, stats);
  } else {
    return await setDoc(docRef, stats, { merge: true });
  }
};

// Usuários e Perfis
export const dbGetUserProfile = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as User) : null;
};

export const dbCreateUserProfile = async (uid: string, profile: User) => {
  const docRef = doc(db, "users", uid);
  return await setDoc(docRef, profile);
};

// Métricas SaaS para Super Admin
export const dbGetGlobalStats = async () => {
  const usersSnap = await getDocs(collection(db, "users"));
  const distributors = usersSnap.docs.filter(d => d.data().role === 'admin').length;
  return {
    totalDistributors: distributors,
    activeSubscriptions: distributors, // Simplificação
    monthlyRecurringRevenue: distributors * 199.00, // Exemplo: Plano Pro R$ 199
    systemHealth: 'perfect'
  };
};
