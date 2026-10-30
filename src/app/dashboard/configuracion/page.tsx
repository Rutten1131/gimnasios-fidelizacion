'use client';

import { useState, useEffect } from 'react';
import {
  Sliders,
  QrCode,
  CheckCircle,
  Plus,
  Trash2,
  Percent,
  Check,
  RefreshCw,
  Bell,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '../layout';
import TacticalDrawer from '@/components/TacticalDrawer';
import CentralQRModal from '@/components/CentralQRModal';

export default function CommandControlCenterPage() {
  const { data, loading, refreshData } = useDashboard();

  // Config State
  const [commPct, setCommPct] = useState(10);
  const [storeCommPct, setStoreCommPct] = useState(5);
  const [inactivityDays, setInactivityDays] = useState(30);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');

  // Zero-Jump Drawer for Commissions
  const [isCommissionsDrawerOpen, setIsCommissionsDrawerOpen] = useState(false);

  // WhatsApp QR State & Modal
  const [waInstanceName] = useState('gym_owner_instance');
  const [waQr, setWaQr] = useState<string | null>(null);
  const [waState, setWaState] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [waLoading, setWaLoading] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Coaches & Plans
  const [trainers, setTrainers] = useState<any[]>([]);
  const [newTrainerName, setNewTrainerName] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');

  // Push Notifications
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (data) {
      setCommPct(Number(data.tenant?.referralCommissionPct || 10));
      setStoreCommPct(Number(data.tenant?.storeReferralCommissionPct || 5));
      setInactivityDays(Number(data.tenant?.inactivityDaysThreshold || 30));
      setTrainers(data.trainers || []);
      setPlans(data.plans || []);
    }
  }, [data]);

  const loadWhatsAppStatus = async () => {
    try {
      const res = await fetch(`/api/owner/whatsapp-instance?instanceName=${waInstanceName}`);
      const json = await res.json();
      if (json.state === 'open' || json.state === 'CONNECTED') {
        setWaState('CONNECTED');
        setWaQr(null);
      } else {
        setWaState('DISCONNECTED');
        if (json.qrcode) setWaQr(json.qrcode);
      }
    } catch (e) {
      console.error('Error fetching WA status:', e);
    }
  };

  useEffect(() => {
    loadWhatsAppStatus();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Auto-poll WhatsApp connection status every 3 seconds while QR modal is open
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWhatsAppModalOpen && waState !== 'CONNECTED') {
      interval = setInterval(() => {
        loadWhatsAppStatus();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWhatsAppModalOpen, waState]);

  const handleInitWhatsAppInstance = async () => {
    setWaLoading(true);
    setIsWhatsAppModalOpen(true);
    try {
      const res = await fetch('/api/owner/whatsapp-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: waInstanceName }),
      });
      const json = await res.json();
      if (json.state === 'open' || json.state === 'CONNECTED') {
        setWaState('CONNECTED');
        setWaQr(null);
        setIsWhatsAppModalOpen(false);
      } else if (json.qrcode) {
        setWaState('CONNECTING');
        setWaQr(json.qrcode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(false);
    }
  };

  const handleSaveCommissions = async () => {
    setConfigSaving(true);
    setConfigSuccess('');
    try {
      const res = await fetch('/api/owner/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCommissionPct: commPct,
          storeReferralCommissionPct: storeCommPct,
          inactivityDaysThreshold: inactivityDays,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar comisiones');
      setConfigSuccess('¡Comisiones actualizadas con éxito!');
      refreshData();
      setTimeout(() => {
        setIsCommissionsDrawerOpen(false);
        setConfigSuccess('');
      }, 1200);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConfigSaving(false);
    }
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerName.trim()) return;
    try {
      const res = await fetch('/api/owner/trainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTrainerName }),
      });
      if (res.ok) {
        setNewTrainerName('');
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTrainer = async (id: string) => {
    if (!confirm('¿Eliminar coach?')) return;
    try {
      const res = await fetch(`/api/owner/trainers?id=${id}`, { method: 'DELETE' });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim() || !newPlanPrice) return;
    try {
      const res = await fetch('/api/owner/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlanName,
          price: parseFloat(newPlanPrice),
          durationDays: 30,
        }),
      });
      if (res.ok) {
        setNewPlanName('');
        setNewPlanPrice('');
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('¿Eliminar plan?')) return;
    try {
      const res = await fetch(`/api/owner/plans?id=${id}`, { method: 'DELETE' });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-[#8AA4C4] font-mono text-sm">
        Cargando Centro de Mando ALL-crm...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── HEADER TÁCTICO ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0E1B2E] pb-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-[#FFFFFF] tracking-wide flex items-center gap-2.5">
            CENTRO DE MANDO & CONFIGURACIÓN
          </h1>
          <p className="text-xs text-[#8AA4C4] mt-0.5">
            Módulos tácticos Zero-Jump para control de comisiones, automatización y equipo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-[11px] font-title font-bold flex items-center gap-2 ${
              waState === 'CONNECTED' ? 'tactical-badge-cyan' : 'bg-amber-950/40 text-amber-300 border border-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                waState === 'CONNECTED' ? 'bg-[#00F5D4] animate-pulse' : 'bg-amber-400'
              }`}
            />
            {waState === 'CONNECTED' ? 'BOT WHATSAPP ONLINE' : 'WHATSAPP DESCONECTADO'}
          </span>
        </div>
      </div>

      {/* ── 4 PANELES TÁCTICOS VIP (GRID 2X2) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANEL 1: CONECTAR WHATSAPP (INSTANCIA) */}
        <div className="tactical-card p-6 flex flex-col justify-between min-h-[260px] border border-[#00F5D4]/25 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base text-[#FFFFFF] tracking-wide">
                  CONECTAR WHATSAPP
                </h3>
                <span className="text-[10px] text-[#8AA4C4] uppercase font-title font-mono">
                  (INSTANCIA AUTOMÁTICA)
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-title font-bold ${
                  waState === 'CONNECTED' ? 'tactical-badge-green' : 'tactical-badge-gold'
                }`}
              >
                {waState === 'CONNECTED' ? '● CONECTADO' : '○ DESCONECTADO'}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#03080F]/80 rounded-2xl border border-[#0E1B2E]">
              <div className="w-14 h-14 rounded-2xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4] text-2xl font-bold shrink-0">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <div className="font-display text-base text-[#FFFFFF]">WhatsApp Bot</div>
                <div className="text-xs text-[#8AA4C4]">
                  {waState === 'CONNECTED' ? 'Instancia vinculada y lista para canjes' : 'Escanea el QR para habilitar el bot'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                if (waState === 'CONNECTED') {
                  loadWhatsAppStatus();
                } else {
                  handleInitWhatsAppInstance();
                  setIsWhatsAppModalOpen(true);
                }
              }}
              disabled={waLoading}
              className="w-full py-3 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer glow-cyan"
            >
              <QrCode className="w-4 h-4" />
              {waLoading ? 'CONECTANDO...' : waState === 'CONNECTED' ? 'VERIFICAR CONEXIÓN' : 'Instant QR Link'}
            </button>
          </div>
        </div>

        {/* PANEL 2: COMISIONES & PARÁMETROS (DISPARADOR ZERO-JUMP) */}
        <div className="tactical-card p-6 flex flex-col justify-between min-h-[260px] border border-[#00F5D4]/25">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base text-[#FFFFFF] tracking-wide">
                  COMISIONES & PARÁMETROS
                </h3>
                <span className="text-[10px] text-[#8AA4C4] font-mono">
                  Cashback directo al monedero del socio
                </span>
              </div>
              <Percent className="w-5 h-5 text-[#00F5D4]" />
            </div>

            {/* Visual numbers preview */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#03080F]/80 rounded-2xl border border-[#0E1B2E]">
              <div>
                <div className="font-display text-3xl text-[#00F5D4]">{commPct} %</div>
                <span className="text-[10px] text-[#8AA4C4] font-title uppercase">Comisión Cuota</span>
              </div>
              <div>
                <div className="font-display text-3xl text-[#F59E0B]">{storeCommPct} %</div>
                <span className="text-[10px] text-[#8AA4C4] font-title uppercase">Comisión Tienda</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setIsCommissionsDrawerOpen(true)}
              className="w-full py-3 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer glow-cyan"
            >
              <Sliders className="w-4 h-4" /> AJUSTAR PARÁMETROS (DRAWER)
            </button>
          </div>
        </div>

        {/* PANEL 3: GESTIÓN DE ENTRENADORES */}
        <div className="tactical-card p-6 space-y-4 border border-[#00F5D4]/25">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base text-[#FFFFFF] tracking-wide">
                GESTIÓN DE ENTRENADORES
              </h3>
              <span className="text-[10px] text-[#8AA4C4] font-mono">
                Coaches disponibles para calificar en QR
              </span>
            </div>
            <span className="tactical-badge-gold px-2.5 py-0.5 rounded-full text-[10px] font-title font-bold">
              (liga)
            </span>
          </div>

          <form onSubmit={handleAddTrainer} className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del nuevo coach..."
              value={newTrainerName}
              onChange={(e) => setNewTrainerName(e.target.value)}
              className="flex-1 py-2 px-3 bg-[#03080F] border border-[#00F5D4]/20 rounded-xl text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
            />
            <button
              type="submit"
              className="px-4 py-2 btn-tactical-cyan text-xs font-title font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> AGREGAR
            </button>
          </form>

          {/* Compact Trainers List */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {trainers.map((t) => (
              <div
                key={t.id}
                className="p-2.5 bg-[#03080F]/90 border border-[#0E1B2E] rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#07192C] flex items-center justify-center font-display text-[10px] text-[#00F5D4] font-bold">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-[#FFFFFF]">{t.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteTrainer(t.id)}
                  className="p-1 text-[#8AA4C4] hover:text-rose-400 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 4: PLANES DE MEMBRESÍA */}
        <div className="tactical-card p-6 space-y-4 border border-[#00F5D4]/25">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base text-[#FFFFFF] tracking-wide">
                PLANES DE MEMBRESÍA
              </h3>
              <span className="text-[10px] text-[#8AA4C4] font-mono">
                Planes que se ofrecen en el flujo WhatsApp
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-[#00F5D4]" />
          </div>

          <form onSubmit={handleAddPlan} className="grid grid-cols-5 gap-2">
            <input
              type="text"
              placeholder="Nombre Plan..."
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              className="col-span-3 py-2 px-3 bg-[#03080F] border border-[#00F5D4]/20 rounded-xl text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Costo $"
              value={newPlanPrice}
              onChange={(e) => setNewPlanPrice(e.target.value)}
              className="col-span-1 py-2 px-2 bg-[#03080F] border border-[#00F5D4]/20 rounded-xl text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
            />
            <button
              type="submit"
              className="col-span-1 py-2 btn-tactical-cyan text-xs font-title font-bold rounded-xl flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Compact Plans List */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-2.5 bg-[#03080F]/90 border border-[#0E1B2E] rounded-xl flex items-center justify-between"
              >
                <span className="text-xs font-bold text-[#FFFFFF]">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm text-[#00F5D4] font-bold">
                    $ {Number(p.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeletePlan(p.id)}
                    className="p-1 text-[#8AA4C4] hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ZERO-JUMP DRAWER PARA COMISIONES CON SLIDERS ── */}
      <TacticalDrawer
        isOpen={isCommissionsDrawerOpen}
        onClose={() => setIsCommissionsDrawerOpen(false)}
        title="Ajuste de Comisiones & Parámetros"
        subtitle="Regulación interactiva Zero-Jump"
      >
        <div className="space-y-6 pt-2">
          {configSuccess && (
            <div className="p-3 bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] text-xs rounded-xl font-bold">
              {configSuccess}
            </div>
          )}

          {/* Slider 1: Comisión Mensualidad */}
          <div className="space-y-2 p-4 bg-[#03080F] border border-[#0E1B2E] rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-title font-bold text-[#FFFFFF]">
                COMISIÓN MENSUALIDAD GYM
              </span>
              <span className="font-display text-xl text-[#00F5D4] font-bold">
                {commPct} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={commPct}
              onChange={(e) => setCommPct(Number(e.target.value))}
              className="w-full accent-[#00F5D4] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8AA4C4] font-mono">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Slider 2: Comisión Tienda */}
          <div className="space-y-2 p-4 bg-[#03080F] border border-[#0E1B2E] rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-title font-bold text-[#FFFFFF]">
                COMISIÓN TIENDA RETAIL
              </span>
              <span className="font-display text-xl text-[#F59E0B] font-bold">
                {storeCommPct} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={storeCommPct}
              onChange={(e) => setStoreCommPct(Number(e.target.value))}
              className="w-full accent-[#F59E0B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8AA4C4] font-mono">
              <span>0%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Slider 3: Umbral Inactividad */}
          <div className="space-y-2 p-4 bg-[#03080F] border border-[#0E1B2E] rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-title font-bold text-[#FFFFFF]">
                UMBRAL INACTIVIDAD ("TE EXTRAÑAMOS")
              </span>
              <span className="font-display text-xl text-[#00E5FF] font-bold">
                {inactivityDays} días
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="1"
              value={inactivityDays}
              onChange={(e) => setInactivityDays(Number(e.target.value))}
              className="w-full accent-[#00E5FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8AA4C4] font-mono">
              <span>5 días</span>
              <span>45 días</span>
              <span>90 días</span>
            </div>
          </div>

          <button
            onClick={handleSaveCommissions}
            disabled={configSaving}
            className="w-full py-3.5 btn-tactical-cyan text-xs font-title font-bold tracking-wider uppercase rounded-xl cursor-pointer"
          >
            {configSaving ? 'GUARDANDO...' : 'GUARDAR COMISIONES'}
          </button>
        </div>
      </TacticalDrawer>

      {/* ── MODAL QR INMERSIVO PARA VINCULAR WHATSAPP ── */}
      <CentralQRModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title="Vincular WhatsApp"
        subtitle="Abre WhatsApp en tu teléfono -> Dispositivos vinculados y escanea el código."
        qrValue={waQr ? (waQr.startsWith('data:') ? waQr : `data:image/png;base64,${waQr}`) : (waLoading ? '' : 'esperando_qr')}
        badge="INSTANCIA AUTOMÁTICA"
        isImage={Boolean(waQr)}
        onRefresh={handleInitWhatsAppInstance}
        isRefreshing={waLoading}
      />
    </div>
  );
}
