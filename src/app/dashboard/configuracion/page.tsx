'use client';

import { useState, useEffect } from 'react';
import {
  Check,
  RefreshCw,
  QrCode,
  Bell,
  UserPlus,
  Plus,
  Trash2,
  CreditCard,
  CheckCircle,
  Percent,
} from 'lucide-react';
import { useDashboard } from '../layout';

export default function ConfigPage() {
  const { data, loading, refreshData } = useDashboard();

  // Config state
  const [commPct, setCommPct] = useState('');
  const [storeCommPct, setStoreCommPct] = useState('');
  const [inactivityDays, setInactivityDays] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState('');

  // Trainers state
  const [trainers, setTrainers] = useState<any[]>([]);
  const [newTrainerName, setNewTrainerName] = useState('');
  const [trainerMessage, setTrainerMessage] = useState('');
  const [addingTrainer, setAddingTrainer] = useState(false);

  // Plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [planMessage, setPlanMessage] = useState('');
  const [addingPlan, setAddingPlan] = useState(false);

  // WhatsApp Instance State
  const [waInstanceName, setWaInstanceName] = useState('gym_owner_instance');
  const [waQr, setWaQr] = useState<string | null>(null);
  const [waState, setWaState] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [waLoading, setWaLoading] = useState(false);

  // Browser WebPush Notifications permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (data) {
      setCommPct(data.tenant?.referralCommissionPct?.toString() || '10');
      setStoreCommPct(data.tenant?.storeReferralCommissionPct?.toString() || '5');
      setInactivityDays(data.tenant?.inactivityDaysThreshold?.toString() || '30');
      setWaPhone(data.tenant?.whatsappPhone || '');
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

  const handleInitWhatsAppInstance = async () => {
    setWaLoading(true);
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

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const requestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Este navegador no soporta notificaciones WebPush.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);

      if (perm === 'granted' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (vapidPublicKey) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });

          await fetch('/api/owner/push-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription }),
          });
        }
      }
    } catch (e) {
      console.error('Error al activar notificaciones push:', e);
    }
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTrainer(true);
    setTrainerMessage('');
    try {
      const res = await fetch('/api/owner/trainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTrainerName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al agregar entrenador');
      setNewTrainerName('');
      setTrainerMessage('Coach agregado exitosamente');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingTrainer(false);
    }
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    if (!confirm('¿Seguro de eliminar este entrenador?')) return;
    try {
      const res = await fetch(`/api/owner/trainers?id=${trainerId}`, { method: 'DELETE' });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingPlan(true);
    setPlanMessage('');
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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al crear plan');
      setNewPlanName('');
      setNewPlanPrice('');
      setPlanMessage('Plan de membresía creado exitosamente');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingPlan(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('¿Seguro de eliminar este plan de membresía?')) return;
    try {
      const res = await fetch(`/api/owner/plans?id=${planId}`, { method: 'DELETE' });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMessage('');
    try {
      const res = await fetch('/api/owner/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCommissionPct: parseFloat(commPct),
          storeReferralCommissionPct: parseFloat(storeCommPct),
          inactivityDaysThreshold: parseInt(inactivityDays, 10),
          whatsappPhone: waPhone,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al guardar la configuración');
      setConfigMessage('Configuración guardada correctamente.');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConfigSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-[#7A93B2] font-mono text-sm">
        Cargando Configuración Owner...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#0E1B2E] pb-4">
        <div>
          <h2 className="font-title text-base md:text-xl font-bold text-gradient-cyan tracking-widest uppercase">
            CONFIGURACIÓN GENERAL
          </h2>
          <p className="text-xs text-[#7A93B2] mt-0.5">
            Administra la conexión con WhatsApp, parámetros del negocio, entrenadores y membresías.
          </p>
        </div>
      </div>

      {/* Grid: 2 columns on Desktop, 1 on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ── COLUMNA IZQUIERDA: CONECTIVIDAD & AUTOMATIZACIÓN ── */}
        <div className="space-y-6">

          {/* 1. WHATSAPP INSTANCE */}
          <div className="sharp-card rounded-sm p-5 md:p-6 space-y-4 border border-[#0E1B2E]">
            <div className="flex items-center justify-between border-b border-[#0E1B2E] pb-3 gap-2">
              <div>
                <h3 className="font-title font-bold text-xs md:text-sm text-[#FFFFFF] tracking-wider uppercase flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#00F5D4]" />
                  VINCULACIÓN INSTANCIA WHATSAPP
                </h3>
                <p className="text-[11px] text-[#7A93B2] mt-0.5">
                  Conecta el bot para respuestas automáticas y códigos de canje.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold font-title tracking-wider shrink-0 ${
                  waState === 'CONNECTED'
                    ? 'bg-[#02050B] border border-[#00F5D4]/40 text-[#00F5D4]'
                    : 'bg-amber-950/40 border border-amber-800/50 text-amber-300'
                }`}
              >
                {waState === 'CONNECTED' ? '● CONECTADO' : '○ DESCONECTADO'}
              </span>
            </div>

            {waState === 'CONNECTED' ? (
              <div className="p-4 bg-[#02050B] border border-[#0E1B2E] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00F5D4] shrink-0" />
                  <div>
                    <div className="font-bold text-[#FFFFFF] text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                      Instancia Vinculada Correctamente
                      {(waPhone || data?.tenant?.whatsappPhone) && (
                        <span className="px-2 py-0.5 bg-[#00F5D4]/10 border border-[#00F5D4]/40 text-[#00F5D4] text-xs font-mono rounded-sm">
                          +{waPhone || data?.tenant?.whatsappPhone}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-[#7A93B2]">
                      Instancia: {waInstanceName}
                    </div>
                  </div>
                </div>
                <button
                  onClick={loadWhatsAppStatus}
                  className="px-3.5 py-2 bg-[#060D18] hover:bg-[#0E1B2E] text-[#7A93B2] hover:text-[#FFFFFF] text-xs font-semibold rounded-sm border border-[#0E1B2E] transition flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Verificar
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-[#02050B] border border-[#0E1B2E] rounded-sm space-y-4">
                {waQr ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white rounded-sm border border-[#00F5D4]/40 shadow-lg">
                      <img
                        src={waQr.startsWith('data:') ? waQr : `data:image/png;base64,${waQr}`}
                        alt="WhatsApp QR Code"
                        className="w-44 h-44 md:w-48 md:h-48 object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-[#7A93B2] text-center max-w-xs">
                      Abre WhatsApp en tu teléfono, ve a <b>Dispositivos vinculados</b> y escanea este código.
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-3 py-2">
                    <QrCode className="w-10 h-10 md:w-12 md:h-12 text-[#00F5D4] mx-auto opacity-80" />
                    <p className="text-xs text-[#7A93B2] max-w-sm">
                      Haz clic abajo para generar el código QR de vinculación instantánea.
                    </p>
                    <button
                      onClick={handleInitWhatsAppInstance}
                      disabled={waLoading}
                      className="px-5 py-2.5 btn-cyan-gradient text-xs font-title tracking-wider uppercase rounded-sm transition cursor-pointer"
                    >
                      {waLoading ? 'GENERANDO QR...' : 'VINCULAR WHATSAPP'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. PWA NOTIFICATIONS */}
          <div className="sharp-card rounded-sm p-5 md:p-6 space-y-4 border border-[#0E1B2E]">
            <div className="flex items-center justify-between border-b border-[#0E1B2E] pb-3 gap-2">
              <div>
                <h3 className="font-title font-bold text-xs md:text-sm text-[#FFFFFF] tracking-wider uppercase flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#00F5D4]" />
                  NOTIFICACIONES EN TIEMPO REAL
                </h3>
                <p className="text-[11px] text-[#7A93B2] mt-0.5">
                  Reciba alertas instantáneas cuando un cliente envíe comprobante o pague.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold font-title tracking-wider shrink-0 ${
                  notifPermission === 'granted'
                    ? 'bg-[#02050B] border border-[#00F5D4]/40 text-[#00F5D4]'
                    : 'bg-amber-950/40 border border-amber-800/50 text-amber-300'
                }`}
              >
                {notifPermission === 'granted' ? '● ACTIVADAS' : '○ DESACTIVADAS'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-[#02050B] border border-[#0E1B2E] rounded-sm">
              <div className="text-xs text-[#7A93B2]">
                {notifPermission === 'granted'
                  ? 'Las alertas sonoras y push están funcionando en este dispositivo.'
                  : 'Activa las notificaciones en tu celular o PC para enterarte al instante de nuevos pagos.'}
              </div>
              {notifPermission !== 'granted' && (
                <button
                  onClick={requestPushPermission}
                  type="button"
                  className="w-full sm:w-auto px-4 py-2 bg-[#00F5D4] hover:bg-[#00E5FF] text-[#02050B] font-bold text-xs font-title tracking-wider uppercase rounded-sm transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer glow-cyan"
                >
                  <Bell className="w-3.5 h-3.5" /> ACTIVAR
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── COLUMNA DERECHA: NEGOCIO & PARÁMETROS ── */}
        <div className="space-y-6">

          {/* 3. COMISIONES & PARÁMETROS */}
          <form
            onSubmit={handleSaveConfig}
            className="sharp-card rounded-sm p-5 md:p-6 space-y-4 border border-[#0E1B2E]"
          >
            <div className="border-b border-[#0E1B2E] pb-3">
              <h3 className="font-title font-bold text-xs md:text-sm text-[#FFFFFF] tracking-wider uppercase flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#00F5D4]" />
                COMISIONES POR REFERIDO & PARÁMETROS
              </h3>
              <p className="text-[11px] text-[#7A93B2] mt-0.5">
                Porcentajes que se acreditan a la billetera y días para alertar inactividad.
              </p>
            </div>

            {configMessage && (
              <div className="p-3 bg-[#02050B] border border-[#00F5D4]/40 rounded-sm text-[#00F5D4] text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" /> {configMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-title font-bold text-[#FFFFFF] tracking-wider mb-1">
                  COMISIÓN MENSUALIDAD (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commPct}
                  onChange={(e) => setCommPct(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 bg-[#02050B] border border-[#0E1B2E] rounded-sm text-[#FFFFFF] text-xs focus:outline-none focus:border-[#00F5D4]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-title font-bold text-[#FFFFFF] tracking-wider mb-1">
                  COMISIÓN TIENDA RETAIL (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={storeCommPct}
                  onChange={(e) => setStoreCommPct(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 bg-[#02050B] border border-[#0E1B2E] rounded-sm text-[#FFFFFF] text-xs focus:outline-none focus:border-[#00F5D4]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-title font-bold text-[#FFFFFF] tracking-wider mb-1">
                  UMBRAL DÍAS INACTIVIDAD ("TE EXTRAÑAMOS")
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={inactivityDays}
                  onChange={(e) => setInactivityDays(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 bg-[#02050B] border border-[#0E1B2E] rounded-sm text-[#FFFFFF] text-xs focus:outline-none focus:border-[#00F5D4]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={configSaving}
              className="w-full py-3 btn-cyan-gradient font-bold text-xs font-title tracking-wider uppercase rounded-sm transition cursor-pointer"
            >
              {configSaving ? 'GUARDANDO...' : 'GUARDAR PARÁMETROS'}
            </button>
          </form>

          {/* 4. TRAINERS MANAGEMENT */}
          <div className="sharp-card rounded-sm p-5 md:p-6 space-y-4 border border-[#0E1B2E]">
            <div className="border-b border-[#0E1B2E] pb-3">
              <h3 className="font-title font-bold text-xs md:text-sm text-[#FFFFFF] tracking-wider uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00F5D4]" />
                GESTIÓN DE ENTRENADORES
              </h3>
              <p className="text-[11px] text-[#7A93B2] mt-0.5">
                Coaches disponibles para ser calificados en el código QR.
              </p>
            </div>

            {trainerMessage && (
              <div className="p-2.5 bg-[#02050B] border border-[#00F5D4]/40 rounded-sm text-[#00F5D4] text-xs">
                {trainerMessage}
              </div>
            )}

            <form onSubmit={handleAddTrainer} className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del Coach"
                value={newTrainerName}
                onChange={(e) => setNewTrainerName(e.target.value)}
                required
                className="flex-1 py-2 px-3 bg-[#02050B] border border-[#0E1B2E] rounded-sm text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
              />
              <button
                type="submit"
                disabled={addingTrainer}
                className="py-2 px-4 btn-cyan-gradient text-xs font-title tracking-wider uppercase rounded-sm transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {addingTrainer ? '...' : 'AGREGAR'}
              </button>
            </form>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-title font-bold text-[#7A93B2] uppercase block tracking-wider">
                COACHES ACTIVOS ({trainers.length})
              </span>
              {trainers.length === 0 ? (
                <div className="p-3 bg-[#02050B] border border-[#0E1B2E] rounded-sm text-xs text-[#7A93B2] text-center">
                  Sin entrenadores registrados. Agrega uno arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {trainers.map((t) => (
                    <div
                      key={t.id}
                      className="bg-[#02050B] border border-[#0E1B2E] rounded-sm px-3 py-2 flex items-center justify-between"
                    >
                      <span className="font-bold text-xs text-[#FFFFFF] truncate">{t.name}</span>
                      <button
                        onClick={() => handleDeleteTrainer(t.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-sm transition cursor-pointer"
                        title="Eliminar Entrenador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 5. MEMBERSHIP PLANS */}
          <div className="sharp-card rounded-sm p-5 md:p-6 space-y-4 border border-[#0E1B2E]">
            <div className="border-b border-[#0E1B2E] pb-3">
              <h3 className="font-title font-bold text-xs md:text-sm text-[#FFFFFF] tracking-wider uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00F5D4]" />
                PLANES DE MEMBRESÍA
              </h3>
              <p className="text-[11px] text-[#7A93B2] mt-0.5">
                Planes que se ofrecen en los pagos por WhatsApp.
              </p>
            </div>

            {planMessage && (
              <div className="p-2.5 bg-[#02050B] border border-[#00F5D4]/40 rounded-sm text-[#00F5D4] text-xs">
                {planMessage}
              </div>
            )}

            <form onSubmit={handleAddPlan} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nombre del Plan"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                required
                className="sm:col-span-1 py-2 px-3 bg-[#02050B] border border-[#0E1B2E] rounded-sm text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Costo ($)"
                value={newPlanPrice}
                onChange={(e) => setNewPlanPrice(e.target.value)}
                required
                className="sm:col-span-1 py-2 px-3 bg-[#02050B] border border-[#0E1B2E] rounded-sm text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
              />
              <button
                type="submit"
                disabled={addingPlan}
                className="py-2 btn-cyan-gradient text-xs font-title tracking-wider uppercase rounded-sm transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {addingPlan ? '...' : 'CREAR'}
              </button>
            </form>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-title font-bold text-[#7A93B2] uppercase block tracking-wider">
                PLANES ACTIVOS ({plans.length})
              </span>
              {plans.length === 0 ? (
                <div className="p-3 bg-[#02050B] border border-[#0E1B2E] rounded-sm text-xs text-[#7A93B2] text-center">
                  Sin planes creados. Agrega un plan arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#02050B] border border-[#0E1B2E] rounded-sm px-3 py-2 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-xs text-[#FFFFFF] truncate">{p.name}</div>
                        <div className="text-[11px] text-[#00F5D4] font-mono">
                          $ {Number(p.price).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePlan(p.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-sm transition cursor-pointer shrink-0"
                        title="Eliminar Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
