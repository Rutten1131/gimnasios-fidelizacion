'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Star,
  Wallet,
  Sliders,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface DashboardContextType {
  data: any;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
  data: null,
  loading: true,
  refreshData: async () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const loadData = async () => {
    try {
      const res = await fetch('/api/owner/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const allNavItems = [
    { href: '/dashboard', icon: Users, label: 'RESUMEN GENERAL', shortLabel: 'Resumen', key: 'showOverviewTab' },
    { href: '/dashboard/evaluaciones', icon: Star, label: 'EVALUACIONES & CLIENTES', shortLabel: 'Clientes', key: 'showEvaluationsTab' },
    { href: '/dashboard/billetera', icon: Wallet, label: 'BILLETERA & CANJES', shortLabel: 'Billetera', key: 'showWalletTab' },
    { href: '/dashboard/configuracion', icon: Sliders, label: 'CONFIGURACIÓN', shortLabel: 'Config', key: 'showConfigTab' },
  ];

  const navItems = allNavItems.filter((item) => {
    if (!data?.tenant) return true;
    return data.tenant[item.key] !== false;
  });

  const currentNavItem = allNavItems.find((item) => item.href === pathname);
  const isCurrentTabDisabled = data?.tenant && currentNavItem && data.tenant[currentNavItem.key] === false;

  if (data?.tenant && data.tenant.isActive === false) {
    return (
      <div className="min-h-screen bg-[#02050B] text-[#FFFFFF] flex items-center justify-center p-4">
        <div className="sharp-panel p-8 text-center max-w-md space-y-4 border border-rose-800/60">
          <div className="w-12 h-12 bg-rose-950/60 border border-rose-800 rounded-sm flex items-center justify-center text-rose-300 mx-auto">
            <X className="w-6 h-6" />
          </div>
          <h2 className="font-title text-lg font-bold text-rose-300">CUENTA TEMPORALMENTE PAUSADA</h2>
          <p className="text-xs text-[#7A93B2]">
            El acceso a esta cuenta ha sido pausado por la administración. Por favor comuníquese con soporte para reactivar su servicio.
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#060D18] hover:bg-[#0E1B2E] border border-[#0E1B2E] text-[#FFFFFF] text-xs font-semibold rounded-sm transition cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (isCurrentTabDisabled) {
    return (
      <div className="min-h-screen bg-[#02050B] text-[#FFFFFF] flex items-center justify-center p-4">
        <div className="sharp-panel p-8 text-center max-w-md space-y-4 border border-amber-800/60">
          <div className="w-12 h-12 bg-amber-950/60 border border-amber-800 rounded-sm flex items-center justify-center text-amber-300 mx-auto">
            <Sliders className="w-6 h-6" />
          </div>
          <h2 className="font-title text-lg font-bold text-amber-300">PESTAÑA NO INCLUIDA EN TU PLAN</h2>
          <p className="text-xs text-[#7A93B2]">
            Esta sección ha sido desactivada para tu cuenta. Contacta al Administrador para habilitar esta funcionalidad.
          </p>
          <Link
            href={navItems[0]?.href || '/dashboard'}
            className="px-4 py-2 bg-[#00F5D4] text-[#02050B] font-bold text-xs font-title tracking-wider uppercase rounded-sm transition inline-block glow-cyan"
          >
            Ir a Sección Disponible
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ data, loading, refreshData: loadData }}>
      <div className="min-h-screen bg-[#02050B] text-[#FFFFFF] flex flex-col font-sans">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <header className="bg-[#060D18] border-b border-[#0E1B2E] px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger — desktop only */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-[#7A93B2] hover:text-[#FFFFFF] bg-[#02050B] hover:bg-[#0E1B2E] border border-[#0E1B2E] rounded-sm transition hidden md:flex items-center justify-center gap-2 cursor-pointer"
              title="Menú de Navegación"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-[#00F5D4]" /> : <Menu className="w-5 h-5 text-[#00F5D4]" />}
              <span className="text-xs font-title font-bold uppercase tracking-wider">MENÚ</span>
            </button>

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 px-2 bg-[#02050B] border border-[#00F5D4]/30 rounded-sm flex items-center justify-center glow-cyan">
                <img src="/branding/logo_main.png" alt="ALL-crm" className="h-7 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-title text-sm md:text-base font-bold text-gradient-cyan tracking-wider leading-tight">
                  ALL-crm
                </span>
                <span className="text-[10px] text-[#00F5D4] font-mono font-semibold truncate max-w-[130px] md:max-w-none">
                  {data?.tenant?.name || 'Sistema de Fidelización'}
                </span>
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#02050B] hover:bg-rose-950/40 border border-[#0E1B2E] hover:border-rose-800/60 text-[#7A93B2] hover:text-rose-300 text-xs font-semibold rounded-sm transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline font-title tracking-wider text-[11px] uppercase">Cerrar Sesión</span>
          </button>
        </header>

        {/* ── BODY ────────────────────────────────────────────── */}
        <div className="flex flex-1 relative min-h-0">

          {/* Desktop Sidebar with ample width */}
          {sidebarOpen && (
            <aside className="w-64 lg:w-72 bg-[#02050B] border-r border-[#0E1B2E] p-4 space-y-1.5 shrink-0 hidden md:block">
              <div className="px-3 py-2 text-[10px] font-title font-bold uppercase tracking-widest text-[#7A93B2]/60">
                Navegación
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-sm text-xs font-semibold transition tracking-wider font-title cursor-pointer ${
                      isActive
                        ? 'bg-[#060D18] text-[#FFFFFF] border-l-2 border-l-[#00F5D4] border-t border-r border-b border-[#0E1B2E] glow-cyan'
                        : 'text-[#7A93B2] hover:bg-[#060D18]/70 hover:text-[#FFFFFF]'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00F5D4]' : 'text-[#7A93B2]'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* ── MOBILE BOTTOM NAV BAR ───────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060D18] border-t border-[#0E1B2E] flex items-stretch">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-[9px] font-title font-bold tracking-wide transition border-t-2 ${
                  isActive
                    ? 'text-[#00F5D4] border-[#00F5D4] bg-[#02050B]'
                    : 'text-[#7A93B2] hover:text-[#FFFFFF] border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#00F5D4]' : 'text-[#7A93B2]'}`} />
                <span className="truncate w-full text-center leading-tight">{item.shortLabel}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-[9px] font-title font-bold tracking-wide text-[#7A93B2] hover:text-rose-300 border-t-2 border-transparent transition"
          >
            <LogOut className="w-5 h-5 text-rose-400" />
            <span>Salir</span>
          </button>
        </nav>

      </div>
    </DashboardContext.Provider>
  );
}
