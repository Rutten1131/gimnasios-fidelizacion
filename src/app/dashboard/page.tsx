'use client';

import { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  DollarSign,
  Gift,
  Calendar,
  History,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from './layout';
import TacticalDrawer from '@/components/TacticalDrawer';
import CentralQRModal from '@/components/CentralQRModal';

export default function DashboardOverviewPage() {
  const { data, loading, refreshData } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModalQR, setActiveModalQR] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    token: string;
    badge: string;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    token: '',
    badge: '',
  });

  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerifyPayment = async (paymentId: string, action: 'APPROVE' | 'REJECT') => {
    setVerifyingId(paymentId);
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingId(null);
    }
  };

  const getQRUrl = (token: string) => {
    const rawPhone = data?.tenant?.whatsappPhone || '593967491847';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const messageText = `Hola este es mi codigo: ${token}`;
    return cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
      : `https://wa.me/?text=${encodeURIComponent(messageText)}`;
  };

  // Find customer based on search or select first customer with balance
  const allWallets = data?.wallets || [];
  const selectedWallet = searchQuery.trim()
    ? allWallets.find((w: any) =>
        w.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.customer?.phone?.includes(searchQuery)
      ) || allWallets[0]
    : allWallets[0];

  const activeCustomer = selectedWallet?.customer || {
    name: 'Juan Perez',
    phone: '51999888777',
    id: 'socio_4092',
  };

  const activeBalance = Number(selectedWallet?.balance || 12.50).toFixed(2);
  const transactions = selectedWallet?.transactions || [
    { id: '1', amount: 2.50, description: 'Cashback (Cuota Octubre)', createdAt: new Date() },
    { id: '2', amount: -5.00, description: 'Canje Bar / Suplemento', createdAt: new Date(Date.now() - 86400000) },
    { id: '3', amount: 5.00, description: 'Cashback (Cuota Septiembre)', createdAt: new Date(Date.now() - 86400000 * 5) },
  ];

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-[#8AA4C4] font-mono text-sm">
        Cargando Dashboard Táctico ALL-crm...
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* ── HEADER & SEARCHVIP ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-[#FFFFFF] tracking-wide">
            RESUMEN GENERAL
          </h1>
          <p className="text-xs text-[#8AA4C4] mt-0.5">
            Gestión táctica de socios en tiempo real y canjes centralizados en monitor.
          </p>
        </div>

        {/* Tactical Search Pill */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#00F5D4] absolute left-4 top-1/2 -translate-y-1/2 opacity-75" />
          <input
            type="text"
            placeholder="Buscar socio por nombre o WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-11 pr-4 bg-[#05101C]/90 border border-[#00F5D4]/25 rounded-full text-xs text-[#FFFFFF] placeholder-[#8AA4C4]/50 focus:outline-none focus:border-[#00F5D4] focus:ring-1 focus:ring-[#00F5D4]/40 transition shadow-lg"
          />
        </div>
      </div>

      {/* ── CUSTOMER INTERACTION CARD & FEED POPUP (ZERO-JUMP) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Interaction Card (2 cols on lg) */}
        <div className="lg:col-span-2 tactical-card p-6 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
          {/* Subtle performance background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center"
            style={{
              backgroundImage: `radial-gradient(circle at 75% 30%, rgba(0, 245, 212, 0.25) 0%, transparent 60%), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80')`
            }}
          />

          {/* Top Info */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-xl md:text-2xl text-[#FFFFFF]">
                  {activeCustomer.name}
                </h3>
                <span className="text-xs text-[#8AA4C4] font-mono">
                  (Socio #{activeCustomer.phone?.slice(-4) || '4092'})
                </span>
              </div>
              <span className="text-[10px] uppercase font-title font-bold text-[#00F5D4] tracking-wider px-2.5 py-0.5 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 inline-block">
                Premium Activo
              </span>
            </div>

            <span className="tactical-badge-gold px-3 py-1 rounded-full text-[11px] font-title font-bold tracking-wider shrink-0 flex items-center gap-1.5 glow-gold">
              <Sparkles className="w-3.5 h-3.5" /> VIP GOLD
            </span>
          </div>

          {/* Center: Massive Cashback Display */}
          <div className="relative z-10 my-6">
            <div className="font-display text-4xl md:text-6xl text-[#00F5D4] tracking-tight text-gradient-cyan drop-shadow-md">
              $ {activeBalance} <span className="text-2xl md:text-3xl font-sans font-bold text-[#FFFFFF]/80">USD</span>
            </div>
            <span className="text-xs font-title font-bold text-[#8AA4C4] uppercase tracking-widest mt-1 block">
              CASHBACK DISPONIBLE EN MONEDERO
            </span>
          </div>

          {/* Bottom Controls */}
          <div className="relative z-10 pt-4 border-t border-[#00F5D4]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00F5D4] to-[#00B4D8] flex items-center justify-center font-display text-xs text-[#02050B] font-bold shadow-md">
                {activeCustomer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] text-[#8AA4C4] uppercase font-title block">Plan Actual</span>
                <span className="text-xs font-bold text-[#FFFFFF]">Membresía Anual Gold</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 btn-tactical-outline text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" /> Ver Historial (Popout)
              </button>
              <button
                onClick={() =>
                  setActiveModalQR({
                    isOpen: true,
                    title: `Canje de Saldo - ${activeCustomer.name}`,
                    subtitle: 'Escanea para aplicar el cashback disponible a una compra o cuota.',
                    token: data?.qrTokens?.MEMBERSHIP || 'canje_monedero_demo',
                    badge: 'CANJE INSTANTÁNEO',
                  })
                }
                className="flex-1 sm:flex-initial px-5 py-2.5 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-1.5 cursor-pointer glow-cyan"
              >
                <QrCode className="w-4 h-4" /> Canjear QR
              </button>
            </div>
          </div>
        </div>

        {/* Contextual Mini-Feed on the right (Desktop Preview) */}
        <div className="tactical-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#0E1B2E] pb-3">
            <h4 className="font-display text-sm text-[#FFFFFF] tracking-wide flex items-center gap-2">
              <History className="w-4 h-4 text-[#00F5D4]" />
              Actividad Reciente ({transactions.length})
            </h4>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-[11px] text-[#00F5D4] hover:underline font-title cursor-pointer"
            >
              Expandir
            </button>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 3).map((tx: any) => {
              const isPositive = Number(tx.amount) > 0;
              return (
                <div
                  key={tx.id}
                  className="p-3 bg-[#03080F]/80 border border-[#0E1B2E] rounded-xl flex items-center justify-between transition hover:border-[#00F5D4]/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#07192C] border border-[#00F5D4]/20 flex items-center justify-center font-bold text-xs text-[#00F5D4]">
                      {isPositive ? '+' : '-'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#FFFFFF] truncate max-w-[140px]">
                        {tx.description || 'Movimiento'}
                      </div>
                      <div className="text-[10px] text-[#8AA4C4] font-mono">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-display text-sm font-bold ${
                      isPositive ? 'text-[#00F5D4]' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? `+$${Number(tx.amount).toFixed(2)}` : `-$${Math.abs(Number(tx.amount)).toFixed(2)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS (CARRUSEL OPERATIVO INFERIOR) ── */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="font-display text-lg text-[#FFFFFF] tracking-wide">
            Quick Actions
          </h3>
          <p className="text-xs text-[#8AA4C4] mt-0.5">
            Toca una card para proyectar el QR dinámico en el monitor para el socio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Pagar Cuota Mensual */}
          <div className="tactical-card rounded-2xl overflow-hidden relative group border border-[#00F5D4]/20 flex flex-col justify-between min-h-[260px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-35"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030B14] via-[#05101C]/60 to-transparent" />

            <div className="relative z-10 p-5">
              <span className="tactical-badge-cyan px-2.5 py-1 rounded-full text-[10px] font-title font-bold">
                FLUJO 1
              </span>
            </div>

            <div className="relative z-10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-base text-[#FFFFFF] tracking-wide leading-snug">
                    Pagar Cuota Mensual
                  </h4>
                  <p className="text-[11px] text-[#8AA4C4]">Verificación automática en caja</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#03080F]/90 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <button
                onClick={() =>
                  setActiveModalQR({
                    isOpen: true,
                    title: 'Pago de Cuota Mensual',
                    subtitle: 'El socio escanea este código para procesar su renovación por WhatsApp.',
                    token: data?.qrTokens?.MEMBERSHIP || 'membership_demo',
                    badge: 'PAGO DE MENSUALIDAD',
                  })
                }
                className="w-full py-2.5 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" /> Escanear QR
              </button>
            </div>
          </div>

          {/* Card 2: Canjear en Barra / Tienda */}
          <div className="tactical-card rounded-2xl overflow-hidden relative group border border-[#00F5D4]/20 flex flex-col justify-between min-h-[260px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-35"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030B14] via-[#05101C]/60 to-transparent" />

            <div className="relative z-10 p-5">
              <span className="tactical-badge-gold px-2.5 py-1 rounded-full text-[10px] font-title font-bold">
                RETAIL VIP
              </span>
            </div>

            <div className="relative z-10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-base text-[#FFFFFF] tracking-wide leading-snug">
                    Canjear en Barra / Tienda
                  </h4>
                  <p className="text-[11px] text-[#8AA4C4]">Suplementos, ropa o bebidas</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#03080F]/90 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                  <Gift className="w-5 h-5" />
                </div>
              </div>

              <button
                onClick={() =>
                  setActiveModalQR({
                    isOpen: true,
                    title: 'Canje en Tienda / Barra',
                    subtitle: 'Escanea en el mostrador para descontar el total de la compra del saldo acumulado.',
                    token: data?.qrTokens?.RETAIL || 'retail_demo',
                    badge: 'TIENDA & RETAIL',
                  })
                }
                className="w-full py-2.5 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" /> Escanear QR
              </button>
            </div>
          </div>

          {/* Card 3: Reservar Spa / Coach */}
          <div className="tactical-card rounded-2xl overflow-hidden relative group border border-[#00F5D4]/20 flex flex-col justify-between min-h-[260px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-35"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030B14] via-[#05101C]/60 to-transparent" />

            <div className="relative z-10 p-5">
              <span className="tactical-badge-green px-2.5 py-1 rounded-full text-[10px] font-title font-bold">
                EXPERIENCIAS
              </span>
            </div>

            <div className="relative z-10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-base text-[#FFFFFF] tracking-wide leading-snug">
                    Calificar Coach / Servicio
                  </h4>
                  <p className="text-[11px] text-[#8AA4C4]">Evaluación física por QR</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#03080F]/90 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <button
                onClick={() =>
                  setActiveModalQR({
                    isOpen: true,
                    title: 'Evaluación de Coach',
                    subtitle: 'El socio califica de 1 a 5 estrellas a su entrenador asignado.',
                    token: data?.qrTokens?.EVALUATION || 'eval_demo',
                    badge: 'LIGA DE PERFORMANCE',
                  })
                }
                className="w-full py-2.5 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" /> Escanear QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── VERIFICACIÓN DE PAGOS PENDIENTES ── */}
      {data?.pendingPayments && data.pendingPayments.length > 0 && (
        <div className="tactical-card p-6 space-y-4 border border-[#00F5D4]/30 glow-cyan">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm md:text-base text-[#FFFFFF] tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] animate-pulse" />
              PAGOS PENDIENTES DE VERIFICACIÓN ({data.pendingPayments.length})
            </h3>
          </div>

          <div className="space-y-3">
            {data.pendingPayments.map((p: any) => (
              <div
                key={p.id}
                className="p-4 bg-[#03080F]/90 border border-[#0E1B2E] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#FFFFFF] text-sm">{p.customerName}</span>
                    <span className="text-[10px] bg-[#07192C] text-[#00F5D4] px-2 py-0.5 rounded-full font-mono">
                      {p.referenceCode}
                    </span>
                  </div>
                  <div className="text-xs text-[#8AA4C4]">
                    WhatsApp: +{p.customerPhone} • {p.type === 'MEMBERSHIP' ? 'Cuota Mensual' : 'Tienda Retail'}
                  </div>
                  <div className="font-display text-lg text-[#00F5D4] font-bold">
                    $ {Number(p.amount).toFixed(2)} USD
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleVerifyPayment(p.id, 'REJECT')}
                    disabled={verifyingId === p.id}
                    className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Rechazar
                  </button>
                  <button
                    onClick={() => handleVerifyPayment(p.id, 'APPROVE')}
                    disabled={verifyingId === p.id}
                    className="px-4 py-2 btn-tactical-cyan text-xs font-title font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Aprobar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ZERO-JUMP DRAWER CONTEXTUAL (HISTORIAL DE TRANSACCIONES) ── */}
      <TacticalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Historial — ${activeCustomer.name}`}
        subtitle={`Socio #${activeCustomer.phone?.slice(-4) || '4092'} • Saldo: $ ${activeBalance} USD`}
      >
        <div className="space-y-3">
          {transactions.map((tx: any) => {
            const isPositive = Number(tx.amount) > 0;
            return (
              <div
                key={tx.id}
                className="p-3.5 bg-[#03080F] border border-[#0E1B2E] rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-[#FFFFFF]">
                    {tx.description || tx.type}
                  </div>
                  <div className="text-[10px] text-[#8AA4C4] font-mono mt-0.5">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`font-display text-sm font-bold shrink-0 ml-2 ${
                    isPositive ? 'text-[#00F5D4]' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? `+$${Number(tx.amount).toFixed(2)}` : `-$${Math.abs(Number(tx.amount)).toFixed(2)}`}
                </span>
              </div>
            );
          })}
        </div>
      </TacticalDrawer>

      {/* ── MODAL CENTRAL QR INMERSIVO ── */}
      <CentralQRModal
        isOpen={activeModalQR.isOpen}
        onClose={() => setActiveModalQR((prev) => ({ ...prev, isOpen: false }))}
        title={activeModalQR.title}
        subtitle={activeModalQR.subtitle}
        qrValue={getQRUrl(activeModalQR.token)}
        badge={activeModalQR.badge}
      />
    </div>
  );
}
