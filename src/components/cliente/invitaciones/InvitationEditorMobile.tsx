'use client';

import {
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
  Send,
  Loader2,
  Check,
  Upload,
  MessageCircle,
  Copy,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  MobilePageShell,
  MobileTopBar,
  MobileSection,
  MobileCard,
  MobileSegmentedTabs,
} from '@/components/cliente/mobile/primitives';
import InvitationCanvas from './InvitationCanvas';
import PremiumInvitationView from './PremiumInvitationView';
import { uploadInvitationAsset } from '@/lib/actions/uploadActions';

type TabKey = 'BASIC' | 'PREMIUM' | 'ENVIAR';

interface Props {
  evento: any;
  fondos: any[];
  fuentes: any[];
  // Estado y callbacks compartidos con la versión escritorio
  tabActiva: TabKey;
  setTabActiva: (t: TabKey) => void;
  texto: any;
  setTexto: (t: any) => void;
  estilos: any;
  setEstilos: (e: any) => void;
  configWeb: any;
  setConfigWeb: (c: any) => void;
  fondoUrlActivo: string;
  setFondoUrlActivo: (u: string) => void;
  filtroCategoria: string;
  setFiltroCategoria: (c: string) => void;
  fondosFiltrados: any[];
  modoPropia: boolean;
  setModoPropia: (m: boolean) => void;
  archivoAdjuntoBase64: string | null;
  setArchivoAdjuntoBase64: (s: string | null) => void;
  tipoInvitacion: string;
  setTipoInvitacion: (t: string) => void;
  saving: boolean;
  onSave: (tipoOverride?: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShareWhatsApp: (invitado: any) => void;
  onCopyLink: (token: string) => void;
}

const CATEGORIAS = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'BODA', label: 'Boda' },
  { id: 'XV_ANOS', label: 'XV Años' },
  { id: 'BAUTIZO', label: 'Bautizo' },
  { id: 'FIESTA_INFANTIL', label: 'Infantil' },
  { id: 'FIESTA_GENERAL', label: 'General' },
];

const TEMAS_PREMIUM = [
  { id: 'dark', label: 'Oscuro' },
  { id: 'light', label: 'Claro' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'gold', label: 'Dorado' },
];

export default function InvitationEditorMobile({
  evento,
  fondos,
  fuentes,
  tabActiva,
  setTabActiva,
  texto,
  setTexto,
  estilos,
  setEstilos,
  configWeb,
  setConfigWeb,
  fondoUrlActivo,
  setFondoUrlActivo,
  filtroCategoria,
  setFiltroCategoria,
  fondosFiltrados,
  modoPropia,
  setModoPropia,
  archivoAdjuntoBase64,
  setArchivoAdjuntoBase64,
  tipoInvitacion,
  setTipoInvitacion,
  saving,
  onSave,
  onFileUpload,
  onShareWhatsApp,
  onCopyLink,
}: Props) {
  const totalInvitados = evento?.invitados?.length || 0;
  const confirmados = (evento?.invitados || []).filter((i: any) => i.rsvpEstado === 'CONFIRMADO').length;

  const tabs = [
    { key: 'BASIC' as TabKey, label: 'Básica' },
    { key: 'PREMIUM' as TabKey, label: 'Premium' },
    { key: 'ENVIAR' as TabKey, label: 'Enviar' },
  ];

  // Color global de texto (compartido para todos los elementos)
  const colorTextoGlobal = estilos?.titulo?.color || '#ffffff';
  const setColorTextoGlobal = (color: string) => {
    setEstilos((prev: any) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = { ...next[k], color };
      });
      return next;
    });
  };

  return (
    <MobilePageShell>
      <MobileTopBar
        title="Invitaciones"
        backHref={`/cliente/evento/${evento.id}`}
        subtitle={evento.nombre}
      />

      {/* Resumen rápido */}
      <MobileCard className="p-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--color-fondo-hover)] p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)]">Invitados</p>
            <p className="text-2xl font-bold text-[var(--color-texto)] tabular-nums">{totalInvitados}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Confirmados</p>
            <p className="text-2xl font-bold text-emerald-700 tabular-nums">{confirmados}</p>
          </div>
        </div>
        <Link
          href={`/cliente/evento/${evento.id}?tab=invitados`}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-fondo-hover)] text-[var(--color-texto)] text-[13px] font-semibold active:scale-[0.98] transition-all"
        >
          <Users size={15} /> Gestionar invitados
        </Link>
      </MobileCard>

      {/* Tabs */}
      <MobileSegmentedTabs<TabKey> tabs={tabs} value={tabActiva} onChange={setTabActiva} />

      {tabActiva === 'BASIC' && (
        <BasicaEditor
          evento={evento}
          fondos={fondos}
          fuentes={fuentes}
          texto={texto}
          setTexto={setTexto}
          estilos={estilos}
          setEstilos={setEstilos}
          configWeb={configWeb}
          fondoUrlActivo={fondoUrlActivo}
          setFondoUrlActivo={setFondoUrlActivo}
          filtroCategoria={filtroCategoria}
          setFiltroCategoria={setFiltroCategoria}
          fondosFiltrados={fondosFiltrados}
          modoPropia={modoPropia}
          setModoPropia={setModoPropia}
          archivoAdjuntoBase64={archivoAdjuntoBase64}
          setArchivoAdjuntoBase64={setArchivoAdjuntoBase64}
          colorTextoGlobal={colorTextoGlobal}
          setColorTextoGlobal={setColorTextoGlobal}
          onFileUpload={onFileUpload}
        />
      )}

      {tabActiva === 'PREMIUM' && (
        <PremiumEditor
          evento={evento}
          configWeb={configWeb}
          setConfigWeb={setConfigWeb}
          fuentes={fuentes}
        />
      )}

      {tabActiva === 'ENVIAR' && (
        <EnviarTab
          evento={evento}
          tipoInvitacion={tipoInvitacion}
          setTipoInvitacion={setTipoInvitacion}
          onShareWhatsApp={onShareWhatsApp}
          onCopyLink={onCopyLink}
          onSave={onSave}
          saving={saving}
        />
      )}

      {/* Bottom CTA de guardar (solo en pestañas de edición) — sticky sobre el bottom nav */}
      {(tabActiva === 'BASIC' || tabActiva === 'PREMIUM') && (
        <div
          className="fixed left-0 right-0 z-[60] bg-[var(--color-fondo-card)] border-t border-[var(--color-borde-suave)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-4 pt-3 pb-3"
          style={{ bottom: 'calc(70px + env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={() => onSave()}
            disabled={saving}
            className="btn-oro w-full py-3.5 rounded-2xl font-bold uppercase tracking-wider text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Check size={16} strokeWidth={3} /> Guardar diseño</>}
          </button>
        </div>
      )}
    </MobilePageShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// EDITOR BÁSICA — preview + plantilla + texto + datos + regalos
// ──────────────────────────────────────────────────────────────────────────────
function BasicaEditor({
  evento,
  fondos,
  fuentes,
  texto,
  setTexto,
  estilos,
  setEstilos,
  configWeb,
  fondoUrlActivo,
  setFondoUrlActivo,
  filtroCategoria,
  setFiltroCategoria,
  fondosFiltrados,
  modoPropia,
  setModoPropia,
  archivoAdjuntoBase64,
  setArchivoAdjuntoBase64,
  colorTextoGlobal,
  setColorTextoGlobal,
  onFileUpload,
}: any) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Cuando se selecciona un elemento, hacer scroll para que el preview quede visible arriba del sheet
  useEffect(() => {
    if (selectedElementId && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedElementId]);

  // Setter de estilo individual de un elemento (para uso del canvas en modo móvil)
  const handleEstiloChange = (id: string, newEstilo: any) => {
    setEstilos((prev: any) => ({ ...prev, [id]: newEstilo }));
  };

  return (
    <>
      {/* Preview — InvitationCanvas mide 400×700, la escalamos al 62% para encajar en el mockup */}
      <div ref={previewRef} className="flex justify-center mb-5 scroll-mt-4">
        <div
          className="relative bg-zinc-900 rounded-[2rem] shadow-xl"
          style={{ width: 248, height: 434, overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 400,
              height: 700,
              transform: 'scale(0.62)',
              transformOrigin: 'top left',
            }}
          >
            <InvitationCanvas
              estilos={estilos}
              texto={texto}
              fondoUrlActivo={fondoUrlActivo}
              isEditing={false}
              evento={evento}
              archivoAdjuntoPropio={archivoAdjuntoBase64}
              modoPropia={modoPropia}
              fuentes={fuentes}
              onElementClick={(id) => setSelectedElementId(id)}
              selectedElementId={selectedElementId}
              onEstiloChange={handleEstiloChange}
            />
          </div>
        </div>
      </div>

      {/* Hint de uso */}
      <p className="text-center text-[11px] text-[var(--color-texto-suave)] -mt-3 mb-4 px-4 leading-relaxed">
        Toca un texto del preview para seleccionarlo. <strong className="text-[var(--color-texto)]">Arrástralo con un dedo</strong> para moverlo y <strong className="text-[var(--color-texto)]">pellizca con dos dedos</strong> para cambiar su tamaño.
      </p>

      {/* Bottom sheet de edición de elemento */}
      {selectedElementId && (
        <ElementEditorSheet
          elementId={selectedElementId}
          texto={texto}
          setTexto={setTexto}
          estilos={estilos}
          setEstilos={setEstilos}
          fuentes={fuentes}
          onClose={() => setSelectedElementId(null)}
        />
      )}

      <Accordion title="Plantilla" defaultOpen icon={ImageIcon}>
        {/* Toggle modo propia */}
        <div className="flex bg-[var(--color-fondo-hover)] p-1 rounded-full mb-3">
          <button
            type="button"
            onClick={() => setModoPropia(false)}
            className={cn(
              'flex-1 py-2 rounded-full text-[12px] font-semibold transition-all',
              !modoPropia ? 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] shadow-sm' : 'text-[var(--color-texto-suave)]',
            )}
          >
            De la galería
          </button>
          <button
            type="button"
            onClick={() => setModoPropia(true)}
            className={cn(
              'flex-1 py-2 rounded-full text-[12px] font-semibold transition-all',
              modoPropia ? 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] shadow-sm' : 'text-[var(--color-texto-suave)]',
            )}
          >
            Subir propia
          </button>
        </div>

        {!modoPropia ? (
          <>
            {/* Filtro de categorías */}
            <div className="-mx-1 px-1 overflow-x-auto no-scrollbar mb-3">
              <div className="inline-flex gap-2 min-w-max">
                {CATEGORIAS.map((cat) => {
                  const active = cat.id === filtroCategoria;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFiltroCategoria(cat.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all border',
                        active
                          ? 'bg-[var(--color-primario)] text-white border-[var(--color-primario)]'
                          : 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] border-[var(--color-borde)]',
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid de fondos */}
            <div className="grid grid-cols-3 gap-2">
              {fondosFiltrados.map((f: any) => {
                const active = f.url === fondoUrlActivo;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFondoUrlActivo(f.url)}
                    className={cn(
                      'relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all active:scale-95',
                      active
                        ? 'border-[var(--color-acento)] ring-2 ring-[var(--color-acento)]/30'
                        : 'border-[var(--color-borde-suave)]',
                    )}
                  >
                    <img src={f.url} alt={f.nombre} className="w-full h-full object-cover" />
                    {active && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--color-acento)] text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
              {fondosFiltrados.length === 0 && (
                <p className="col-span-3 text-center text-[12px] text-[var(--color-texto-muted)] py-6">
                  No hay plantillas disponibles para esta categoría.
                </p>
              )}
            </div>
          </>
        ) : (
          <div>
            {archivoAdjuntoBase64 ? (
              <div className="relative aspect-[3/4] max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-[var(--color-borde-suave)] mb-3">
                <img src={archivoAdjuntoBase64} alt="Tu diseño" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setArchivoAdjuntoBase64(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md"
                  aria-label="Quitar"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <p className="text-[12px] text-[var(--color-texto-suave)] text-center mb-3">
                Sube una imagen JPG/PNG hasta 10 MB para usarla como tu invitación.
              </p>
            )}
            <label className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-primario)] text-white text-[13px] font-semibold cursor-pointer active:scale-[0.98] transition-all">
              <Upload size={16} /> {archivoAdjuntoBase64 ? 'Cambiar imagen' : 'Subir imagen'}
              <input type="file" accept="image/*" onChange={onFileUpload} className="hidden" />
            </label>
          </div>
        )}
      </Accordion>

      <Accordion title="Texto" icon={Wand2}>
        <Field label="Título">
          <input
            type="text"
            value={texto.titulo}
            onChange={(e) => setTexto({ ...texto, titulo: e.target.value })}
            className="invitation-input"
          />
        </Field>
        <Field label="Mensaje">
          <textarea
            value={texto.mensaje}
            onChange={(e) => setTexto({ ...texto, mensaje: e.target.value })}
            rows={3}
            className="invitation-input resize-none"
          />
        </Field>
        <Field label="Vestimenta">
          <input
            type="text"
            value={texto.vestimenta}
            onChange={(e) => setTexto({ ...texto, vestimenta: e.target.value })}
            className="invitation-input"
          />
        </Field>
        <Field label="Color del texto sobre el fondo">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colorTextoGlobal}
              onChange={(e) => setColorTextoGlobal(e.target.value)}
              className="w-12 h-10 rounded-lg border border-[var(--color-borde)] cursor-pointer"
            />
            <span className="text-[12px] font-mono text-[var(--color-texto-suave)]">{colorTextoGlobal}</span>
          </div>
        </Field>
      </Accordion>

      <Accordion title="Datos del evento" icon={Sparkles}>
        <Field label="Lugar">
          <input
            type="text"
            value={texto.lugar}
            onChange={(e) => setTexto({ ...texto, lugar: e.target.value })}
            placeholder="Ej. Salón Las Palmas"
            className="invitation-input"
          />
        </Field>
        <Field label="Dirección">
          <input
            type="text"
            value={texto.direccion}
            onChange={(e) => setTexto({ ...texto, direccion: e.target.value })}
            placeholder="Av. Reforma 123, Mazatlán"
            className="invitation-input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hora ceremonia">
            <input
              type="text"
              value={texto.horaCeremonia}
              onChange={(e) => setTexto({ ...texto, horaCeremonia: e.target.value })}
              className="invitation-input"
            />
          </Field>
          <Field label="Hora celebración">
            <input
              type="text"
              value={texto.horaCelebracion}
              onChange={(e) => setTexto({ ...texto, horaCelebracion: e.target.value })}
              className="invitation-input"
            />
          </Field>
        </div>
      </Accordion>

      <Accordion title="Regalos">
        <Field label="Tipo">
          <div className="flex bg-[var(--color-fondo-hover)] p-1 rounded-xl">
            {[
              { id: 'MESA', label: 'Mesa' },
              { id: 'TRANSFERENCIA', label: 'Transferencia' },
              { id: 'NINGUNO', label: 'Ninguno' },
            ].map((opt) => {
              const active = opt.id === texto.regaloTipo;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTexto({ ...texto, regaloTipo: opt.id })}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all',
                    active ? 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] shadow-sm' : 'text-[var(--color-texto-suave)]',
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Field>
        {texto.regaloTipo === 'MESA' && (
          <Field label="URL de la mesa de regalos">
            <input
              type="url"
              value={texto.regaloMesaUrl}
              onChange={(e) => setTexto({ ...texto, regaloMesaUrl: e.target.value })}
              placeholder="https://..."
              className="invitation-input"
            />
          </Field>
        )}
        {texto.regaloTipo === 'TRANSFERENCIA' && (
          <>
            <Field label="Banco">
              <input
                type="text"
                value={texto.regaloBanco}
                onChange={(e) => setTexto({ ...texto, regaloBanco: e.target.value })}
                className="invitation-input"
              />
            </Field>
            <Field label="CLABE / Cuenta">
              <input
                type="text"
                value={texto.regaloClabe}
                onChange={(e) => setTexto({ ...texto, regaloClabe: e.target.value })}
                className="invitation-input"
              />
            </Field>
          </>
        )}
      </Accordion>

      <div className="h-32" />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// EDITOR PREMIUM — preview web + secciones colapsables
// ──────────────────────────────────────────────────────────────────────────────
function PremiumEditor({ evento, configWeb, setConfigWeb, fuentes }: any) {
  const update = (patch: any) => setConfigWeb({ ...configWeb, ...patch });

  return (
    <>
      {/* Preview phone mockup con la PremiumInvitationView (usa container queries, llena el contenedor) */}
      <div className="flex justify-center mb-5">
        <div
          className="relative bg-zinc-900 rounded-[2rem] border-[5px] border-zinc-800 shadow-xl overflow-hidden ring-1 ring-white/10 [container-type:inline-size]"
          style={{ width: 248, height: 434 }}
        >
          <div className="absolute inset-0">
            <PremiumInvitationView
              isPreview
              evento={{
                ...evento,
                invitacion: {
                  ...(evento.invitacion || {}),
                  configWeb,
                },
              }}
              invitado={
                evento?.invitados?.[0] || {
                  id: 'preview',
                  nombre: 'Invitado de muestra',
                  rsvpToken: 'preview',
                  grupoMiembros: [],
                }
              }
              status="IDLE"
              onRSVP={() => {}}
            />
          </div>
        </div>
      </div>

      <Accordion title="Tema" defaultOpen icon={Wand2}>
        <div className="grid grid-cols-2 gap-2">
          {TEMAS_PREMIUM.map((t) => {
            const active = configWeb.tema === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => update({ tema: t.id })}
                className={cn(
                  'py-3 rounded-xl text-[13px] font-semibold transition-all border',
                  active
                    ? 'bg-[var(--color-primario)] text-white border-[var(--color-primario)]'
                    : 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] border-[var(--color-borde)]',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Accordion>

      <Accordion title="Portada" icon={ImageIcon}>
        <CoverImageUploader
          eventoId={evento.id}
          coverUrl={configWeb.coverUrl}
          onChange={(url) => update({ coverUrl: url })}
        />
        <ToggleRow
          label="Mostrar contador de días"
          checked={!!configWeb.mostrarContador}
          onChange={(v) => update({ mostrarContador: v })}
        />
      </Accordion>

      <Accordion title="Ceremonia">
        <ToggleRow
          label="Mostrar ceremonia"
          checked={configWeb.mostrarCeremonia !== false}
          onChange={(v) => update({ mostrarCeremonia: v })}
        />
        <Field label="Nombre del lugar">
          <input
            type="text"
            value={configWeb.ceremoniaNombre || ''}
            onChange={(e) => update({ ceremoniaNombre: e.target.value })}
            className="invitation-input"
          />
        </Field>
        <Field label="Dirección">
          <input
            type="text"
            value={configWeb.ceremoniaDireccion || ''}
            onChange={(e) => update({ ceremoniaDireccion: e.target.value })}
            className="invitation-input"
          />
        </Field>
        <Field label="Link de Google Maps">
          <input
            type="url"
            value={configWeb.ceremoniaMapsUrl || ''}
            onChange={(e) => update({ ceremoniaMapsUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="invitation-input"
          />
        </Field>
      </Accordion>

      <Accordion title="Vestimenta">
        <ToggleRow
          label="Mostrar dress code"
          checked={configWeb.mostrarDressCode !== false}
          onChange={(v) => update({ mostrarDressCode: v })}
        />
        <Field label="Texto del código de vestimenta">
          <input
            type="text"
            value={configWeb.dressCodeTexto || ''}
            onChange={(e) => update({ dressCodeTexto: e.target.value })}
            className="invitation-input"
          />
        </Field>
      </Accordion>

      <Accordion title="Recepción">
        <ToggleRow
          label="Mostrar recepción"
          checked={configWeb.mostrarCelebracion !== false}
          onChange={(v) => update({ mostrarCelebracion: v })}
        />
        <Field label="Nombre del lugar">
          <input
            type="text"
            value={configWeb.celebracionNombre || ''}
            onChange={(e) => update({ celebracionNombre: e.target.value })}
            className="invitation-input"
          />
        </Field>
        <Field label="Dirección">
          <input
            type="text"
            value={configWeb.celebracionDireccion || ''}
            onChange={(e) => update({ celebracionDireccion: e.target.value })}
            className="invitation-input"
          />
        </Field>
        <Field label="Link de Google Maps">
          <input
            type="url"
            value={configWeb.celebracionMapsUrl || ''}
            onChange={(e) => update({ celebracionMapsUrl: e.target.value })}
            className="invitation-input"
          />
        </Field>
      </Accordion>

      <Accordion title="Regalos">
        <ToggleRow
          label="Mostrar regalos"
          checked={configWeb.mostrarRegalos !== false}
          onChange={(v) => update({ mostrarRegalos: v })}
        />
        <Field label="Tipo">
          <div className="flex bg-[var(--color-fondo-hover)] p-1 rounded-xl">
            {[
              { id: 'MESA', label: 'Mesa' },
              { id: 'TRANSFERENCIA', label: 'Transferencia' },
              { id: 'NINGUNO', label: 'Ninguno' },
            ].map((opt) => {
              const active = opt.id === configWeb.regaloTipo;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update({ regaloTipo: opt.id })}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all',
                    active ? 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] shadow-sm' : 'text-[var(--color-texto-suave)]',
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Field>
        {configWeb.regaloTipo === 'MESA' && (
          <Field label="URL de la mesa de regalos">
            <input
              type="url"
              value={configWeb.regaloMesaUrl || ''}
              onChange={(e) => update({ regaloMesaUrl: e.target.value })}
              className="invitation-input"
            />
          </Field>
        )}
        {configWeb.regaloTipo === 'TRANSFERENCIA' && (
          <>
            <Field label="Banco">
              <input
                type="text"
                value={configWeb.regaloBanco || ''}
                onChange={(e) => update({ regaloBanco: e.target.value })}
                className="invitation-input"
              />
            </Field>
            <Field label="CLABE / Cuenta">
              <input
                type="text"
                value={configWeb.regaloClabe || ''}
                onChange={(e) => update({ regaloClabe: e.target.value })}
                className="invitation-input"
              />
            </Field>
          </>
        )}
      </Accordion>

      <Accordion title="RSVP & Galería">
        <ToggleRow
          label="Permitir RSVP en la invitación"
          checked={configWeb.mostrarRSVP !== false}
          onChange={(v) => update({ mostrarRSVP: v })}
        />
        <ToggleRow
          label="Mostrar galería de fotos"
          checked={configWeb.mostrarGaleria !== false}
          onChange={(v) => update({ mostrarGaleria: v })}
        />
        <ToggleRow
          label="Mostrar QR del álbum digital"
          checked={configWeb.mostrarAlbumQR !== false}
          onChange={(v) => update({ mostrarAlbumQR: v })}
        />
      </Accordion>

      <div className="h-32" />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ENVIAR — selector tipo + lista de invitados con acciones
// ──────────────────────────────────────────────────────────────────────────────
function EnviarTab({ evento, tipoInvitacion, setTipoInvitacion, onShareWhatsApp, onCopyLink, onSave, saving }: any) {
  const invitados = evento?.invitados || [];

  return (
    <>
      <MobileSection title="¿Qué tipo de invitación enviar?">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setTipoInvitacion('BASICA'); onSave('BASICA'); }}
            disabled={saving}
            className={cn(
              'p-3 rounded-2xl border-2 text-left active:scale-[0.98] transition-all',
              tipoInvitacion === 'BASICA'
                ? 'bg-[var(--color-fondo-card)] border-[var(--color-acento)] ring-2 ring-[var(--color-acento)]/20'
                : 'bg-[var(--color-fondo-card)] border-[var(--color-borde-suave)]',
            )}
          >
            <ImageIcon size={18} className="text-[var(--color-texto)] mb-2" />
            <p className="text-[13px] font-semibold text-[var(--color-texto)]">Básica</p>
            <p className="text-[11px] text-[var(--color-texto-suave)] mt-0.5">Tarjeta con imagen</p>
          </button>
          <button
            type="button"
            onClick={() => { setTipoInvitacion('PREMIUM'); onSave('PREMIUM'); }}
            disabled={saving}
            className={cn(
              'p-3 rounded-2xl border-2 text-left active:scale-[0.98] transition-all',
              tipoInvitacion === 'PREMIUM'
                ? 'bg-[var(--color-fondo-card)] border-[var(--color-acento)] ring-2 ring-[var(--color-acento)]/20'
                : 'bg-[var(--color-fondo-card)] border-[var(--color-borde-suave)]',
            )}
          >
            <Sparkles size={18} className="text-[var(--color-acento-claro)] mb-2" />
            <p className="text-[13px] font-semibold text-[var(--color-texto)]">Premium</p>
            <p className="text-[11px] text-[var(--color-texto-suave)] mt-0.5">Web interactiva</p>
          </button>
        </div>
      </MobileSection>

      <MobileSection title={`Invitados (${invitados.length})`}>
        {invitados.length === 0 ? (
          <MobileCard className="p-6 text-center">
            <Users size={32} className="mx-auto text-[var(--color-texto-muted)] mb-2" />
            <p className="text-[14px] font-semibold text-[var(--color-texto)] mb-1">No hay invitados</p>
            <p className="text-[12px] text-[var(--color-texto-suave)] mb-3">Agrega tu lista para empezar a enviar.</p>
            <Link
              href={`/cliente/evento/${evento.id}?tab=invitados`}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-acento-claro)]"
            >
              <Users size={14} /> Ir a gestionar invitados
            </Link>
          </MobileCard>
        ) : (
          <div className="space-y-2">
            {invitados.map((invitado: any) => (
              <MobileCard key={invitado.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-fondo-hover)] flex items-center justify-center text-[14px] font-bold text-[var(--color-texto)] shrink-0">
                  {invitado.nombre?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--color-texto)] truncate">{invitado.nombre}</p>
                  <p className="text-[11px] text-[var(--color-texto-suave)] truncate">
                    {invitado.telefono || invitado.email || 'Sin contacto'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {invitado.telefono && (
                    <button
                      type="button"
                      onClick={() => onShareWhatsApp(invitado)}
                      aria-label="Enviar por WhatsApp"
                      className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center active:scale-95 transition-transform shadow-sm"
                    >
                      <MessageCircle size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onCopyLink(invitado.rsvpToken)}
                    aria-label="Copiar enlace"
                    className="w-9 h-9 rounded-full bg-[var(--color-fondo-hover)] text-[var(--color-texto)] flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </MobileCard>
            ))}
          </div>
        )}
      </MobileSection>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers visuales
// ──────────────────────────────────────────────────────────────────────────────
function Accordion({
  title,
  icon: Icon,
  children,
  defaultOpen,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <MobileCard className="mb-3 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 active:bg-[var(--color-fondo-hover)] transition-colors"
      >
        <span className="flex items-center gap-2.5 text-[14px] font-semibold text-[var(--color-texto)]">
          {Icon && <Icon size={16} className="text-[var(--color-acento-claro)]" />}
          {title}
        </span>
        <ChevronDown size={18} className={cn('text-[var(--color-texto-muted)] transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-borde-suave)] pt-3">{children}</div>}
    </MobileCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-1.5 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 py-2.5 active:bg-[var(--color-fondo-hover)] rounded-lg px-2 transition-colors"
    >
      <span className="text-[13px] text-[var(--color-texto)] text-left">{label}</span>
      <span
        className={cn(
          'shrink-0 w-10 h-6 rounded-full transition-colors relative',
          checked ? 'bg-[var(--color-acento)]' : 'bg-[var(--color-borde)]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </span>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ElementEditorSheet — bottom sheet para editar texto/color/fuente/tamaño de un elemento
// ──────────────────────────────────────────────────────────────────────────────
const ELEMENT_LABELS: Record<string, string> = {
  titulo: 'Título',
  nombres: 'Nombres',
  mensaje: 'Mensaje',
  lugar: 'Lugar',
  vestimenta: 'Vestimenta',
  horaCeremonia: 'Hora ceremonia',
  horaCelebracion: 'Hora celebración',
  regalos: 'Regalos',
  boton: 'Botón RSVP',
  mapPin: 'Ícono mapa',
};

// Elementos cuyo texto es directamente editable desde el campo `texto`
const TEXT_EDITABLE_IDS = new Set(['titulo', 'mensaje', 'lugar', 'vestimenta', 'horaCeremonia', 'horaCelebracion']);

function ElementEditorSheet({
  elementId,
  texto,
  setTexto,
  estilos,
  setEstilos,
  fuentes,
  onClose,
}: {
  elementId: string;
  texto: any;
  setTexto: (t: any) => void;
  estilos: any;
  setEstilos: (e: any) => void;
  fuentes: any[];
  onClose: () => void;
}) {
  const estilo = estilos?.[elementId] || {};
  const isTextEditable = TEXT_EDITABLE_IDS.has(elementId);
  const label = ELEMENT_LABELS[elementId] || elementId;

  const updateEstilo = (patch: any) => {
    setEstilos((prev: any) => ({
      ...prev,
      [elementId]: { ...(prev?.[elementId] || {}), ...patch },
    }));
  };

  const updateTexto = (value: string) => {
    setTexto({ ...texto, [elementId]: value });
  };

  const fontSize = estilo.fontSize || 16;
  const color = estilo.color || '#ffffff';
  const fuente = estilo.fuente || '';

  return (
    // Sin backdrop opaco para que el preview siga visible. El usuario cierra con el botón "Listo" o con la X.
    <div className="fixed inset-x-0 bottom-0 z-[200] flex items-end pointer-events-none">
      <div
        className="w-full bg-[var(--color-fondo-card)] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.18)] pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-300 pointer-events-auto border-t border-[var(--color-borde-suave)] flex flex-col"
        style={{ maxHeight: '50dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--color-borde)]" />
        </div>

        {/* Header */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-[var(--color-borde-suave)] shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] leading-none">
              Editar elemento
            </p>
            <h3 className="text-[15px] font-bold text-[var(--color-texto)]">{label}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full bg-[var(--color-fondo-hover)] text-[var(--color-texto)] flex items-center justify-center active:scale-95 transition-transform"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 px-5 py-3 space-y-3.5 overflow-y-auto">
          {/* Texto editable */}
          {isTextEditable && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-1.5 ml-1">
                Texto
              </label>
              {elementId === 'mensaje' ? (
                <textarea
                  value={texto[elementId] || ''}
                  onChange={(e) => updateTexto(e.target.value)}
                  rows={3}
                  className="invitation-input resize-none"
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={texto[elementId] || ''}
                  onChange={(e) => updateTexto(e.target.value)}
                  className="invitation-input"
                  autoFocus
                />
              )}
            </div>
          )}

          {/* Color */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-1.5 ml-1">
              Color del texto
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => updateEstilo({ color: e.target.value })}
                className="w-14 h-12 rounded-xl border border-[var(--color-borde)] cursor-pointer"
              />
              <span className="text-[13px] font-mono text-[var(--color-texto-suave)]">{color}</span>
            </div>
          </div>

          {/* Fuente */}
          {fuentes && fuentes.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-1.5 ml-1">
                Tipo de letra
              </label>
              <select
                value={fuente}
                onChange={(e) => updateEstilo({ fuente: e.target.value })}
                className="invitation-input"
                style={{ fontFamily: fuente || 'inherit' }}
              >
                <option value="">— Predeterminada —</option>
                {fuentes.map((f: any) => (
                  <option key={f.id} value={f.nombre} style={{ fontFamily: f.nombre }}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tamaño de letra */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-1.5 ml-1">
              Tamaño de letra
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateEstilo({ fontSize: Math.max(8, fontSize - 2) })}
                className="w-11 h-11 rounded-xl bg-[var(--color-fondo-hover)] text-[var(--color-texto)] text-xl font-bold flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Disminuir"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-[20px] font-bold text-[var(--color-texto)] tabular-nums">{Math.round(fontSize)}</span>
                <span className="text-[12px] text-[var(--color-texto-suave)] ml-1">px</span>
              </div>
              <button
                type="button"
                onClick={() => updateEstilo({ fontSize: fontSize + 2 })}
                className="w-11 h-11 rounded-xl bg-[var(--color-fondo-hover)] text-[var(--color-texto)] text-xl font-bold flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
            {/* Slider para ajuste fino */}
            <input
              type="range"
              min={8}
              max={72}
              step={1}
              value={fontSize}
              onChange={(e) => updateEstilo({ fontSize: parseInt(e.target.value) })}
              className="w-full mt-3 accent-[var(--color-acento)]"
            />
          </div>

          {/* Visibilidad */}
          <ToggleRow
            label="Mostrar este elemento"
            checked={estilo.visible !== false}
            onChange={(v) => updateEstilo({ visible: v })}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--color-borde-suave)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-oro w-full py-3 rounded-xl font-bold uppercase text-[12px] tracking-wider"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CoverImageUploader — preview + subida desde celular o URL pública
// ──────────────────────────────────────────────────────────────────────────────
function CoverImageUploader({
  eventoId,
  coverUrl,
  onChange,
}: {
  eventoId: string;
  coverUrl?: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen pesa más de 10 MB. Elige una más liviana.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventoId', eventoId);
      const res = await uploadInvitationAsset(formData);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setError(res.error || 'No se pudo subir la imagen.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al subir.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="relative aspect-[3/4] max-w-[200px] mx-auto rounded-2xl overflow-hidden border border-[var(--color-borde-suave)] bg-[var(--color-fondo-hover)]">
        {coverUrl ? (
          <>
            <img src={coverUrl} alt="Portada" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Quitar"
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-texto-muted)]">
            <ImageIcon size={32} />
            <p className="text-[11px] mt-1.5 px-2 text-center">Sin imagen de portada</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="text-white animate-spin" size={28} />
          </div>
        )}
      </div>

      {/* Botón principal: subir desde celular */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-primario)] text-white text-[13px] font-semibold active:scale-[0.98] transition-all disabled:opacity-60"
      >
        <Upload size={16} />
        {coverUrl ? 'Cambiar imagen' : 'Subir desde mi celular'}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* Toggle URL pública (alternativa) */}
      <button
        type="button"
        onClick={() => setShowUrlInput((v) => !v)}
        className="w-full text-center text-[11px] text-[var(--color-texto-suave)] underline underline-offset-2 active:text-[var(--color-texto)]"
      >
        {showUrlInput ? 'Ocultar URL' : 'O usar una URL pública'}
      </button>

      {showUrlInput && (
        <div>
          <input
            type="url"
            value={coverUrl || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="invitation-input"
          />
        </div>
      )}

      {error && (
        <p className="text-[12px] text-rose-600 font-semibold text-center">{error}</p>
      )}
    </div>
  );
}
