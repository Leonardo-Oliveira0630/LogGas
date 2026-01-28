
import React, { useState } from 'react';
import { Truck, Lock, Mail, User as UserIcon, ArrowRight, Loader2, Building, ChevronLeft } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { dbCreateUserProfile } from "../services/firebaseService";
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Busca perfil no Firestore (App.tsx já faz isso no onAuthStateChanged, mas aqui retornamos para onLogin imediato)
        const userProfile: User = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || 'Usuário LogGas',
          email: email,
          role: role,
        };
        onLogin(userProfile);
      } else {
        // Fluxo de Cadastro
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        const newProfile: User = {
          id: userCredential.user.uid,
          name: name,
          email: email,
          role: role,
          companyName: role === 'admin' ? companyName : undefined,
          plan: role === 'admin' ? 'free' : undefined,
          subscriptionStatus: role === 'admin' ? 'active' : undefined
        };

        await dbCreateUserProfile(userCredential.user.uid, newProfile);
        onLogin(newProfile);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha na autenticação. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 min-h-[600px]">
        
        {/* Lado Esquerdo - Visual SaaS */}
        <div className="md:w-5/12 bg-[#0A3D62] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="bg-[#E58E26] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Truck size={28} />
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              LogGas <br /> Cloud SaaS
            </h1>
            <p className="mt-6 text-slate-300 font-medium">
              {mode === 'login' 
                ? 'Gerencie sua logística em tempo real com a plataforma líder do setor.' 
                : 'Crie sua conta e comece a escalar sua distribuidora em minutos.'}
            </p>
          </div>
          
          <div className="mt-12 space-y-4 relative z-10">
             <div className="flex items-center gap-3 text-sm font-semibold bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                Infraestrutura Multi-Tenant Ativa
             </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="md:w-7/12 p-12 bg-white flex flex-col justify-center">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-[#2D3436]">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Comece agora'}
              </h2>
              <p className="text-slate-500 mt-2">
                {mode === 'login' ? 'Escolha sua porta de entrada' : 'Preencha os dados da sua distribuidora'}
              </p>
            </div>
            {mode === 'register' && (
              <button 
                onClick={() => setMode('login')}
                className="text-[#0A3D62] font-bold text-sm flex items-center gap-1 hover:underline"
              >
                <ChevronLeft size={16} /> Já tenho conta
              </button>
            )}
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setRole('customer')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${role === 'customer' ? 'bg-white text-[#0A3D62] shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Cliente / Loja
            </button>
            <button 
              onClick={() => setRole('admin')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${role === 'admin' ? 'bg-white text-[#0A3D62] shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dono de Distribuidora
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Seu Nome</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      placeholder="Ex: João Silva"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#0A3D62] focus:bg-white rounded-xl outline-none transition-all font-medium"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
                {role === 'admin' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome da Empresa</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        placeholder="Ex: Gás & Água Express"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#0A3D62] focus:bg-white rounded-xl outline-none transition-all font-medium"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#0A3D62] focus:bg-white rounded-xl outline-none transition-all font-medium"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#0A3D62] focus:bg-white rounded-xl outline-none transition-all font-medium"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-[#E58E26] text-white rounded-xl font-bold text-lg hover:bg-[#d17d1f] shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  {mode === 'login' ? 'Entrar no Hub' : 'Criar minha Distribuidora'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm font-medium">
                Sua distribuidora ainda não usa LogGas? <br />
                <button 
                  onClick={() => setMode('register')}
                  className="text-[#0A3D62] font-black hover:underline mt-1"
                >
                  Cadastre sua Empresa e Teste Grátis
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
