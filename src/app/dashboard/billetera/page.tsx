'use client';

import { useState } from 'react';
import {
  Wallet,
  Search,
  ShoppingBag,
  CreditCard,
  QrCode,
  DollarSign,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  History,
} from 'lucide-react';
import { useDashboard } from '../layout';
import CentralQRModal from '@/components/CentralQRModal';
import TacticalDrawer from '@/components/TacticalDrawer';

export default function WalletFintechPage() {
  const { data, loading, refreshData } = useDashboard();

  const [walletSearch, setWalletSearch] = useState('');
  const [selectedWalletUser, setSelectedWalletUser] = useState<any>(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeQRModal, setActiveQRModal] = useState<{
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

  const getQRUrl = (token: string) => {
    const rawPhone = data?.tenant?.whatsappPhone || '593967491847';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const messageText = `Hola este es mi codigo: ${token}`;
    return cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
      : `https://wa.me/?text=${encodeURIComponent(messageText)}`;
  };

  const handleRedeemWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletUser) return;
    setRedeemError('');
    setRedeemSuccess('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/wallet/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedWalletUser.customerId,
          amount: parseFloat(redeemAmount),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al procesar canje');

      setRedeemSuccess(`¡Canje de $ ${parseFloat(redeemAmount).toFixed(2)} procesado exitosamente!`);
      setRedeemAmount('');
      refreshData();
    } catch (err: any) {
      setRedeemError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const allWallets = data?.wallets || [];
  const totalCashback = allWallets.reduce(
    (acc: number, w: any) => acc + Number(w.balance || 0),
    0
  );

  const filteredWallets = allWallets.filter((w: any) => {
    if (!walletSearch) return true;
    const q = walletSearch.toLowerCase();
    return (
      w.customer?.name?.toLowerCase().includes(q) ||
      w.customer?.phone?.includes(q)
    );
  });

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-[#8AA4C4] font-mono text-sm">
        Cargando Billetera Fintech ALL-crm...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── HEADER FINTECH ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0E1B2E] pb-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-[#FFFFFF] tracking-wide flex items-center gap-2.5">
            BILLETERA & CANJES FINTECH
          </h1>
          <p className="text-xs text-[#8AA4C4] mt-0.5">
            Túnel de canje instantáneo centralizado en monitor y auditoría de saldos.
          </p>
        </div>

        <div className="tactical-badge-cyan px-4 py-2 rounded-2xl flex items-center gap-2">
          <span className="text-[11px] font-title font-bold text-[#8AA4C4] uppercase">
            CASHBACK TOTAL DISPONIBLE:
          </span>
          <span className="font-display text-lg text-[#00F5D4] font-bold">
            $ {totalCashback > 0 ? totalCashback.toFixed(2) : '1,450.00'} USD
          </span>
        </div>
      </div>

      {/* ── TÚNEL DE CANJE INSTANTÁNEO (CARDS APILADAS SUPERIORES) ── */}
      <div className="space-y-4">
        <h3 className="font-display text-sm md:text-base text-[#FFFFFF] tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00F5D4]" />
          Túnel de Canje Instantáneo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tunnel Card 1: Canjear en Barra / Tienda */}
          <div className="tactical-card rounded-2xl overflow-hidden relative border border-[#00F5D4]/25 p-6 flex flex-col justify-between min-h-[220px]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80')`
              }}
            />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4] mb-3">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="font-display text-lg text-[#FFFFFF]">CANJEAR EN BARRA / TIENDA</h4>
                <p className="text-xs text-[#8AA4C4]">Canjear compras de retail o snacks con saldo acumulado</p>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <button
                onClick={() =>
                  setActiveQRModal({
                    isOpen: true,
                    title: 'Canjear en Barra / Tienda',
                    subtitle: 'El socio escanea este código para aplicar su cashback al pago de tienda.',
                    token: data?.qrTokens?.RETAIL || 'retail_demo',
                    badge: 'CANJE EN MOSTRADOR',
                  })
                }
                className="w-full sm:w-auto px-6 py-2.5 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer glow-cyan"
              >
                <QrCode className="w-4 h-4" /> Escanear QR Socio
              </button>
            </div>
          </div>

          {/* Tunnel Card 2: Descontar Cuota Mensual */}
          <div className="tactical-card rounded-2xl overflow-hidden relative border border-[#00F5D4]/25 p-6 flex flex-col justify-between min-h-[220px]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80')`
              }}
            />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4] mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-display text-lg text-[#FFFFFF]">DESCONTAR CUOTA MENSUAL</h4>
                <p className="text-xs text-[#8AA4C4]">Cubrir hasta el 100% de la membresía con cashback</p>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <button
                onClick={() =>
                  setActiveQRModal({
                    isOpen: true,
                    title: 'Descontar Cuota Mensual',
                    subtitle: 'Escanea para aplicar el saldo a la mensualidad directamente desde el servidor.',
                    token: data?.qrTokens?.MEMBERSHIP || 'membership_demo',
                    badge: 'CUOTA MENSUAL',
                  })
                }
                className="w-full sm:w-auto px-6 py-2.5 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer glow-cyan"
              >
                <QrCode className="w-4 h-4" /> Escanear QR Socio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SALDOS DE CLIENTES & AUDITORÍA MINIMALISTA (INFERIOR) ── */}
      <div className="tactical-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0E1B2E] pb-4">
          <div>
            <h3 className="font-display text-sm md:text-base text-[#FFFFFF] tracking-wide">
              SALDOS DE SOCIOS & AUDITORÍA
            </h3>
            <p className="text-xs text-[#8AA4C4]">
              Toca a cualquier socio para abrir su túnel de canje o auditoría de movimientos.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#00F5D4] absolute left-3.5 top-1/2 -translate-y-1/2 opacity-70" />
            <input
              type="text"
              placeholder="Buscar socio o WhatsApp..."
              value={walletSearch}
              onChange={(e) => setWalletSearch(e.target.value)}
              className="w-full py-2 pl-9 pr-3 bg-[#03080F] border border-[#00F5D4]/25 rounded-full text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
            />
          </div>
        </div>

        {/* List of customer balances */}
        <div className="space-y-3">
          {filteredWallets.length === 0 ? (
            <div className="p-8 text-center text-[#8AA4C4] font-mono text-xs">
              No se encontraron socios con saldo disponible.
            </div>
          ) : (
            filteredWallets.map((w: any) => (
              <div
                key={w.id}
                onClick={() => setSelectedWalletUser(w)}
                className="p-4 bg-[#03080F]/90 border border-[#0E1B2E] hover:border-[#00F5D4]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition group"
              >
                {/* Left: Avatar + Name + VIP Tag */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#07192C] to-[#04111D] border border-[#00F5D4]/30 flex items-center justify-center font-display text-xs text-[#00F5D4] font-bold shrink-0 group-hover:scale-105 transition">
                    {w.customer?.name?.slice(0, 2).toUpperCase() || 'JP'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#FFFFFF] truncate">
                        {w.customer?.name}
                      </span>
                      <span className="tactical-badge-gold px-2 py-0.5 rounded-full text-[9px] font-title font-bold shrink-0">
                        VIP Gold
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8AA4C4] font-mono">
                      WhatsApp: +{w.customer?.phone} • {w.transactions?.length || 0} movimientos
                    </div>
                  </div>
                </div>

                {/* Right: Massive Saldo + Quick Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-left sm:text-right">
                    <div className="font-display text-2xl text-[#00F5D4] font-bold text-gradient-cyan">
                      $ {Number(w.balance).toFixed(2)} USD
                    </div>
                    <span className="text-[10px] text-[#8AA4C4] uppercase font-title block">
                      CASHBACK DISPONIBLE
                    </span>
                  </div>

                  <button className="p-2.5 rounded-xl bg-[#05101C] border border-[#00F5D4]/30 text-[#00F5D4] group-hover:bg-[#00F5D4] group-hover:text-[#02050B] transition">
                    <DollarSign className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── DRAWER CONTEXTUAL ZERO-JUMP (CANJE MANUAL & AUDITORÍA) ── */}
      {selectedWalletUser && (
        <TacticalDrawer
          isOpen={!!selectedWalletUser}
          onClose={() => {
            setSelectedWalletUser(null);
            setRedeemSuccess('');
            setRedeemError('');
          }}
          title={`Billetera — ${selectedWalletUser.customer?.name}`}
          subtitle={`Saldo actual: $ ${Number(selectedWalletUser.balance).toFixed(2)} USD`}
        >
          {/* Canje Form */}
          <div className="p-4 bg-[#03080F] border border-[#00F5D4]/30 rounded-2xl space-y-3">
            <h4 className="font-display text-xs text-[#FFFFFF] tracking-wider uppercase flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#00F5D4]" /> Ejecutar Canje (Hasta 100%)
            </h4>

            {redeemSuccess && (
              <div className="p-2.5 bg-[#00F5D4]/10 border border-[#00F5D4]/40 text-[#00F5D4] text-xs rounded-xl font-mono">
                {redeemSuccess}
              </div>
            )}
            {redeemError && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl font-mono">
                {redeemError}
              </div>
            )}

            <form onSubmit={handleRedeemWallet} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#8AA4C4] uppercase font-title block mb-1">
                  Monto a descontar ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={Number(selectedWalletUser.balance)}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder={`Máximo $ ${Number(selectedWalletUser.balance).toFixed(2)}`}
                  required
                  className="w-full py-2.5 px-3 bg-[#05101C] border border-[#0E1B2E] rounded-xl text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 btn-tactical-cyan text-xs font-title font-bold rounded-xl cursor-pointer"
              >
                {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR CANJE'}
              </button>
            </form>
          </div>

          {/* Transacciones del Socio */}
          <div className="space-y-2 pt-2">
            <h4 className="font-display text-xs text-[#8AA4C4] uppercase tracking-wider">
              Movimientos de Auditoría
            </h4>
            {selectedWalletUser.transactions?.length === 0 ? (
              <div className="p-4 text-center text-[#8AA4C4] text-xs font-mono">
                Sin movimientos registrados.
              </div>
            ) : (
              selectedWalletUser.transactions?.map((tx: any) => {
                const isPos = Number(tx.amount) > 0;
                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-[#03080F] border border-[#0E1B2E] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#FFFFFF]">
                        {tx.description || tx.type}
                      </div>
                      <div className="text-[10px] text-[#8AA4C4] font-mono">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`font-display text-sm font-bold ${
                        isPos ? 'text-[#00F5D4]' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? `+$${Number(tx.amount).toFixed(2)}` : `-$${Math.abs(Number(tx.amount)).toFixed(2)}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </TacticalDrawer>
      )}

      {/* ── MODAL QR CENTRALIZADO EN MONITOR ── */}
      <CentralQRModal
        isOpen={activeQRModal.isOpen}
        onClose={() => setActiveQRModal((prev) => ({ ...prev, isOpen: false }))}
        title={activeQRModal.title}
        subtitle={activeQRModal.subtitle}
        qrValue={getQRUrl(activeQRModal.token)}
        badge={activeQRModal.badge}
      />
    </div>
  );
}
