'use client';

import { useState } from 'react';
import {
  Trophy,
  Star,
  Search,
  Phone,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { useDashboard } from '../layout';
import TacticalDrawer from '@/components/TacticalDrawer';

export default function EvaluationsPerformancePage() {
  const { data, loading } = useDashboard();

  const [coachFilter, setCoachFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDrawerTab, setCustomerDrawerTab] = useState<'membership' | 'retail' | 'evaluations'>('membership');

  // Real trainers from database ranked by average rating
  const rawTrainers = data?.trainerSummaries || [];
  const sortedTrainers = [...rawTrainers]
    .filter((t: any) => {
      if (coachFilter && t.id !== coachFilter) return false;
      if (ratingFilter && Math.floor(Number(t.ratingAvg || 0)) !== parseInt(ratingFilter, 10)) return false;
      return true;
    })
    .sort((a: any, b: any) => Number(b.ratingAvg || 0) - Number(a.ratingAvg || 0));

  const top1 = sortedTrainers[0] || null;
  const top2 = sortedTrainers[1] || null;
  const top3 = sortedTrainers[2] || null;

  // Real evaluations count and global average from backend
  const allEvaluations = data?.evaluations || [];
  const globalRatingAvg =
    allEvaluations.length > 0
      ? (allEvaluations.reduce((acc: number, ev: any) => acc + Number(ev.rating || 0), 0) / allEvaluations.length).toFixed(1)
      : '5.0';

  // Customers filtered list
  const filteredCustomers = (data?.allCustomers || []).filter((c: any) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-[#8AA4C4] font-mono text-sm">
        Cargando Liga de Performance ALL-crm...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── HEADER DE COMPETENCIA ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0E1B2E] pb-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-[#FFFFFF] tracking-wide flex items-center gap-2.5">
            LIGA DE PERFORMANCE & CLIENTES
          </h1>
          <p className="text-xs text-[#8AA4C4] mt-0.5">
            Tablero visual de competencia de coaches y directorio VIP de socios.
          </p>
        </div>

        {/* Compact Quick Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
            className="py-2 px-3 bg-[#05101C] border border-[#00F5D4]/25 rounded-full text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
          >
            <option value="">Filtrar por Coaches</option>
            {sortedTrainers.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="py-2 px-3 bg-[#05101C] border border-[#00F5D4]/25 rounded-full text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
          >
            <option value="">Filtrar Calificaciones</option>
            <option value="5">★ 5 Estrellas</option>
            <option value="4">★ 4 Estrellas</option>
            <option value="3">★ 3 Estrellas</option>
          </select>
        </div>
      </div>

      {/* ── TABLERO PODIO TOP 3 (LIGA DE COACHES) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm md:text-base text-[#FFFFFF] tracking-wide flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            Tablero de Performance de Coaches
          </h3>
          <span className="text-[11px] font-mono text-[#00F5D4]">
            {globalRatingAvg} ★ Promedio General
          </span>
        </div>

        {sortedTrainers.length === 0 ? (
          <div className="p-8 tactical-card text-center text-[#8AA4C4] font-mono text-xs">
            Sin entrenadores activos en el sistema. Puedes agregar coaches en Centro de Mando.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
            
            {/* TOP 2 (PLATA) */}
            {top2 ? (
              <div className="tactical-card p-5 relative overflow-hidden border border-[#8AA4C4]/30 order-2 md:order-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-title font-bold text-[#8AA4C4] uppercase tracking-wider block">
                      TOP 2: {top2.name}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-3xl text-[#FFFFFF]">
                        {top2.ratingAvg}★
                      </span>
                      <span className="text-[11px] text-[#8AA4C4] font-mono">
                        ({top2.reviewCount || 0} eval.)
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-400 flex items-center justify-center font-display text-sm font-bold text-slate-200 shadow-md">
                    2
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="w-full bg-[#03080F] h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-[#00F5D4] h-full rounded-full"
                    style={{ width: `${(Number(top2.ratingAvg || 5) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : <div className="hidden md:block order-2 md:order-1" />}

            {/* TOP 1 (ORO GLOW) */}
            {top1 && (
              <div className="tactical-card p-6 relative overflow-hidden border-2 border-[#F59E0B]/70 glow-gold order-1 md:order-2 md:-translate-y-2">
                <div className="absolute top-0 right-0 bg-[#F59E0B]/20 text-[#F59E0B] text-[9px] font-title font-bold px-3 py-1 rounded-bl-xl border-l border-b border-[#F59E0B]/40">
                  LÍDER DE LA LIGA
                </div>

                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="text-[11px] font-title font-bold text-[#FBBF24] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> TOP 1: {top1.name}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-4xl text-[#FFFFFF] text-gradient-cyan">
                        {top1.ratingAvg}★
                      </span>
                      <span className="text-xs text-[#8AA4C4] font-mono">
                        ({top1.reviewCount || 0} evaluaciones)
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-display text-base font-bold text-[#02050B] shadow-xl">
                    🥇
                  </div>
                </div>

                {/* Performance Bar Golden */}
                <div className="w-full bg-[#03080F] h-2.5 rounded-full overflow-hidden mt-5">
                  <div
                    className="bg-gradient-to-r from-[#F59E0B] to-[#00F5D4] h-full rounded-full"
                    style={{ width: `${(Number(top1.ratingAvg || 5) / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* TOP 3 (BRONCE) */}
            {top3 ? (
              <div className="tactical-card p-5 relative overflow-hidden border border-[#D97706]/40 order-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-title font-bold text-[#D97706] uppercase tracking-wider block">
                      TOP 3: {top3.name}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-3xl text-[#FFFFFF]">
                        {top3.ratingAvg}★
                      </span>
                      <span className="text-[11px] text-[#8AA4C4] font-mono">
                        ({top3.reviewCount || 0} eval.)
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-amber-950 border border-amber-700 flex items-center justify-center font-display text-sm font-bold text-amber-300 shadow-md">
                    3
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="w-full bg-[#03080F] h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-amber-600 h-full rounded-full"
                    style={{ width: `${(Number(top3.ratingAvg || 5) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : <div className="hidden md:block order-3" />}
          </div>
        )}
      </div>

      {/* ── RANKING DE PERFORMANCE MINIMALISTA (BARRAS CIAN) ── */}
      <div className="tactical-card p-6 space-y-4">
        <h3 className="font-display text-sm text-[#FFFFFF] tracking-wide">
          Ranking de Performance Minimalista
        </h3>

        <div className="space-y-3">
          {sortedTrainers.map((t: any) => {
            const rating = Number(t.ratingAvg || 4.5);
            return (
              <div
                key={t.id}
                className="p-3.5 bg-[#03080F]/90 border border-[#0E1B2E] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-[#00F5D4]/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00F5D4] to-[#00B4D8] flex items-center justify-center font-display text-xs text-[#02050B] font-bold shadow-md">
                    {t.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#FFFFFF]">{t.name}</div>
                    <div className="text-[10px] text-[#00F5D4] font-mono flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-[#00F5D4]" />
                      {rating} ★ Promedio
                    </div>
                  </div>
                </div>

                {/* Segmented Cyan Bars */}
                <div className="flex items-center gap-1.5 w-full sm:w-48">
                  {[1, 2, 3, 4, 5].map((seg) => (
                    <div
                      key={seg}
                      className={`h-2 flex-1 rounded-full transition ${
                        rating >= seg
                          ? 'bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.5)]'
                          : rating >= seg - 0.5
                          ? 'bg-[#00F5D4]/50'
                          : 'bg-[#0E1B2E]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TODOS LOS CLIENTES REGISTRADOS (DIRECTORIO VIP) ── */}
      <div className="tactical-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0E1B2E] pb-4">
          <div>
            <h3 className="font-display text-sm md:text-base text-[#FFFFFF] tracking-wide">
              TODOS LOS CLIENTES REGISTRADOS ({filteredCustomers.length})
            </h3>
            <p className="text-xs text-[#8AA4C4]">
              Accede a la actividad y auditoría financiera de cada socio en un clic.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#00F5D4] absolute left-3.5 top-1/2 -translate-y-1/2 opacity-70" />
            <input
              type="text"
              placeholder="Buscar por nombre o WhatsApp..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full py-2 pl-9 pr-3 bg-[#03080F] border border-[#00F5D4]/25 rounded-full text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00F5D4]"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredCustomers.length === 0 ? (
            <div className="p-6 text-center text-[#8AA4C4] text-xs font-mono">
              Sin socios registrados para mostrar.
            </div>
          ) : (
            filteredCustomers.slice(0, 10).map((c: any) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className="p-3.5 bg-[#03080F]/90 border border-[#0E1B2E] hover:border-[#00F5D4]/40 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#07192C] border border-[#00F5D4]/25 flex items-center justify-center font-display text-xs text-[#00F5D4] font-bold group-hover:scale-105 transition shrink-0">
                    {c.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#FFFFFF] truncate">{c.name}</div>
                    <div className="text-[10px] text-[#8AA4C4] font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#00F5D4]" /> +{c.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-title font-bold ${
                      c.membershipActive ? 'tactical-badge-green' : 'bg-rose-950/40 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {c.membershipActive ? 'ACTIVO' : 'INACTIVO'}
                  </span>

                  <span className="text-[11px] text-[#8AA4C4] font-mono hidden md:inline">
                    Miembro hasta: {c.membershipExpiry ? new Date(c.membershipExpiry).toLocaleDateString() : '—'}
                  </span>

                  <button className="p-1.5 text-[#8AA4C4] group-hover:text-[#00F5D4] bg-[#05101C] border border-[#0E1B2E] rounded-lg transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── DRAWER CONTEXTUAL ZERO-JUMP DE CLIENTE ── */}
      {selectedCustomer && (
        <TacticalDrawer
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={selectedCustomer.name}
          subtitle={`WhatsApp: +${selectedCustomer.phone} • Estado: ${selectedCustomer.membershipActive ? 'Activo' : 'Inactivo'}`}
        >
          {/* Subtabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#03080F] p-1 rounded-xl border border-[#0E1B2E]">
            <button
              onClick={() => setCustomerDrawerTab('membership')}
              className={`py-2 text-[10px] font-title font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                customerDrawerTab === 'membership'
                  ? 'btn-tactical-cyan text-[#02050B]'
                  : 'text-[#8AA4C4] hover:text-[#FFFFFF]'
              }`}
            >
              <CreditCard className="w-3 h-3" /> Membresía
            </button>
            <button
              onClick={() => setCustomerDrawerTab('retail')}
              className={`py-2 text-[10px] font-title font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                customerDrawerTab === 'retail'
                  ? 'btn-tactical-cyan text-[#02050B]'
                  : 'text-[#8AA4C4] hover:text-[#FFFFFF]'
              }`}
            >
              <ShoppingBag className="w-3 h-3" /> Tienda
            </button>
            <button
              onClick={() => setCustomerDrawerTab('evaluations')}
              className={`py-2 text-[10px] font-title font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                customerDrawerTab === 'evaluations'
                  ? 'btn-tactical-cyan text-[#02050B]'
                  : 'text-[#8AA4C4] hover:text-[#FFFFFF]'
              }`}
            >
              <Star className="w-3 h-3" /> Reseñas
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-3 pt-2">
            {customerDrawerTab === 'membership' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#03080F] border border-[#0E1B2E] rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#8AA4C4]">Vencimiento Cuota:</span>
                  <span className="font-mono text-[#FFFFFF] font-bold">
                    {selectedCustomer.membershipExpiry
                      ? new Date(selectedCustomer.membershipExpiry).toLocaleDateString()
                      : 'Sin fecha registrada'}
                  </span>
                </div>
                <div className="text-xs text-[#8AA4C4] font-mono text-center pt-2">
                  Historial de comprobantes vinculado a la billetera.
                </div>
              </div>
            )}

            {customerDrawerTab === 'retail' && (
              <div className="p-4 bg-[#03080F] border border-[#0E1B2E] rounded-xl text-center text-xs text-[#8AA4C4]">
                Sin compras directas registradas en mostrador de tienda.
              </div>
            )}

            {customerDrawerTab === 'evaluations' && (
              <div className="p-4 bg-[#03080F] border border-[#0E1B2E] rounded-xl text-center text-xs text-[#8AA4C4]">
                Sin reseñas emitidas recientemente.
              </div>
            )}
          </div>
        </TacticalDrawer>
      )}
    </div>
  );
}
