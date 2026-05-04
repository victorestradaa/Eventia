'use client';

import { useState, useCallback } from 'react';
import { X, Building2, Music, Utensils, PartyPopper, Camera, Palette, Gift, Armchair } from 'lucide-react';
import { getExplorarServiciosByCategoria } from '@/lib/actions/providerActions';

import WizardStep_CreateEvent from './WizardStep_CreateEvent';
import WizardStep_ChooseMode from './WizardStep_ChooseMode';
import WizardStep_CategoryQuestion from './WizardStep_CategoryQuestion';
import WizardStep_ServiceGallery from './WizardStep_ServiceGallery';
import WizardStep_Summary from './WizardStep_Summary';

// ─── Configuración de Categorías del Asistente ────────────────────────────────
const WIZARD_CATEGORIES = [
  {
    id: 'SALON',
    label: 'Salón',
    emoji: '🏛️',
    pregunta: '¿Necesitas un Salón para tu evento?',
    descripcion: 'Encontramos los mejores salones disponibles en tu ciudad.',
    icon: Building2,
  },
  {
    id: 'COMIDA',
    label: 'Banquetes',
    emoji: '🍽️',
    pregunta: '¿Contratarás servicio de Banquetes o Catering?',
    descripcion: 'Chefs y caterers especializados en todo tipo de eventos.',
    icon: Utensils,
  },
  {
    id: 'MUSICA',
    label: 'Música',
    emoji: '🎵',
    pregunta: '¿Quieres música en vivo o DJ para tu evento?',
    descripcion: 'Bandas, DJs y mariachis para animar tu gran día.',
    icon: Music,
  },
  {
    id: 'FOTOGRAFIA',
    label: 'Fotografía',
    emoji: '📸',
    pregunta: '¿Necesitas fotógrafo o videógrafo?',
    descripcion: 'Captura cada momento especial con los mejores profesionales.',
    icon: Camera,
  },
  {
    id: 'ANIMACION',
    label: 'Animación',
    emoji: '🎪',
    pregunta: '¿Quieres animación, shows o entretenimiento?',
    descripcion: 'Magos, payasos, animadores y más para tu evento.',
    icon: PartyPopper,
  },
  {
    id: 'DECORACION',
    label: 'Decoración',
    emoji: '🌸',
    pregunta: '¿Contratarás servicio de Decoración?',
    descripcion: 'Transforma el espacio con decoradores de ensueño.',
    icon: Palette,
  },
  {
    id: 'RECUERDOS',
    label: 'Recuerdos',
    emoji: '🎁',
    pregunta: '¿Quieres souvenirs o recuerdos para tus invitados?',
    descripcion: 'Detalles únicos que tus invitados guardarán para siempre.',
    icon: Gift,
  },
  {
    id: 'MOBILIARIO',
    label: 'Mobiliario',
    emoji: '🛋️',
    pregunta: '¿Necesitas renta de mobiliario o equipamiento?',
    descripcion: 'Mesas, sillas, lounge y todo lo que necesites.',
    icon: Armchair,
  },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────
type WizardMode = 'CREATE_EVENT' | 'CHOOSE_MODE' | 'CATEGORY_QUESTION' | 'SERVICE_GALLERY' | 'SUMMARY';

interface ReservaHecha {
  servicioId: string;
  servicioNombre: string;
  proveedorNombre: string;
  precio: number;
  categoriaLabel: string;
  categoriaEmoji: string;
}

interface OnboardingWizardProps {
  perfil: any;
  onComplete: () => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function OnboardingWizard({ perfil, onComplete }: OnboardingWizardProps) {
  const [mode, setMode] = useState<WizardMode>('CREATE_EVENT');
  const [eventoId, setEventoId] = useState<string | null>(null);
  const [eventoNombre, setEventoNombre] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [ciudadEvento, setCiudadEvento] = useState('');
  const [categoriaIndex, setCategoriaIndex] = useState(0);
  const [serviciosActuales, setServiciosActuales] = useState<any[]>([]);
  const [esFallback, setEsFallback] = useState(false);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [reservasHechas, setReservasHechas] = useState<ReservaHecha[]>([]);

  const categoriaActual = WIZARD_CATEGORIES[categoriaIndex];

  // Progreso: calculado sobre número de pasos totales
  const totalPasos = 2 + WIZARD_CATEGORIES.length + 1; // create + choose + 8 categorías + summary
  const pasoActual = (() => {
    if (mode === 'CREATE_EVENT') return 0;
    if (mode === 'CHOOSE_MODE') return 1;
    if (mode === 'CATEGORY_QUESTION' || mode === 'SERVICE_GALLERY') return 2 + categoriaIndex;
    return totalPasos - 1;
  })();
  const progreso = Math.round((pasoActual / (totalPasos - 1)) * 100);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleEventoCreado = useCallback((id: string, ciudad: string, nombre: string, fecha: string) => {
    setEventoId(id);
    setCiudadEvento(ciudad);
    setEventoNombre(nombre);
    setFechaEvento(fecha);
    setMode('CHOOSE_MODE');
  }, []);

  const handleModoFacil = useCallback(() => {
    setCategoriaIndex(0);
    setMode('CATEGORY_QUESTION');
  }, []);

  const handleModoManual = useCallback(() => {
    marcarCompletado();
    onComplete();
  }, [onComplete]);

  const cargarServiciosCategoria = useCallback(async (idx: number) => {
    setLoadingServicios(true);
    const cat = WIZARD_CATEGORIES[idx];
    const res = await getExplorarServiciosByCategoria(cat.id, ciudadEvento);
    if (res.success) {
      setServiciosActuales(res.data || []);
      setEsFallback(res.esFallback || false);
    } else {
      setServiciosActuales([]);
    }
    setLoadingServicios(false);
    setMode('SERVICE_GALLERY');
  }, [ciudadEvento]);

  const handleCategoriaSi = useCallback(async () => {
    await cargarServiciosCategoria(categoriaIndex);
  }, [categoriaIndex, cargarServiciosCategoria]);

  const avanzarCategoria = useCallback(() => {
    const siguiente = categoriaIndex + 1;
    if (siguiente >= WIZARD_CATEGORIES.length) {
      setMode('SUMMARY');
    } else {
      setCategoriaIndex(siguiente);
      setMode('CATEGORY_QUESTION');
    }
  }, [categoriaIndex]);

  const handleCategoriaNo = useCallback(() => {
    avanzarCategoria();
  }, [avanzarCategoria]);

  const handleTerminar = useCallback(() => {
    setMode('SUMMARY');
  }, []);

  const handleReservado = useCallback((reserva: ReservaHecha) => {
    setReservasHechas(prev => [...prev, reserva]);
    avanzarCategoria();
  }, [avanzarCategoria]);

  const handleSaltarGaleria = useCallback(() => {
    avanzarCategoria();
  }, [avanzarCategoria]);

  const handleFinalizar = useCallback(() => {
    marcarCompletado();
    onComplete();
  }, [onComplete]);

  const handleSkipWizard = useCallback(() => {
    marcarCompletado();
    onComplete();
  }, [onComplete]);

  // Etiqueta dinámica del paso actual para el header
  const stepLabel = (() => {
    if (mode === 'CREATE_EVENT') return 'Crea tu evento';
    if (mode === 'CHOOSE_MODE') return 'Elige cómo organizar';
    if (mode === 'CATEGORY_QUESTION' || mode === 'SERVICE_GALLERY') return categoriaActual?.label || '';
    if (mode === 'SUMMARY') return '¡Listo!';
    return '';
  })();

  // Index de categoría para el contador "X de N"
  const stepCounter = (() => {
    if (mode === 'CATEGORY_QUESTION' || mode === 'SERVICE_GALLERY') {
      return `${categoriaIndex + 1} de ${WIZARD_CATEGORIES.length}`;
    }
    return null;
  })();

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[var(--color-fondo)] overflow-hidden">
      {/* ─── Top Bar nativa ─────────────────────────────────────────────────── */}
      <header
        className="shrink-0 bg-[var(--color-fondo)]/95 backdrop-blur-md border-b border-[var(--color-borde-suave)] px-4 py-3 flex items-center gap-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        {/* Cerrar / Saltar */}
        {mode !== 'SUMMARY' ? (
          <button
            type="button"
            onClick={handleSkipWizard}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full bg-[var(--color-fondo-hover)] text-[var(--color-texto)] flex items-center justify-center active:scale-95 transition-transform"
          >
            <X size={18} />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}

        {/* Título central */}
        <div className="flex-1 text-center min-w-0">
          <p className="text-[15px] font-semibold text-[var(--color-texto)] truncate">{stepLabel}</p>
          {stepCounter && (
            <p className="text-[11px] text-[var(--color-texto-suave)]">{stepCounter}</p>
          )}
        </div>

        {/* Espaciador derecha (simétrico con el botón izquierdo) */}
        <div className="w-9 h-9" />
      </header>

      {/* ─── Barra de progreso fina, justo debajo del header ─────────────────── */}
      <div className="shrink-0 h-1 bg-[var(--color-fondo-hover)]">
        <div
          className="h-full bg-gradient-to-r from-[#eadeba] via-[#d4af37] to-[#c79a3b] rounded-r-full transition-all duration-700 ease-out"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* ─── Contenido del paso actual ─────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          key={`${mode}-${categoriaIndex}`}
          className="w-full px-5 py-6 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          {/* PASO 1: Crear evento */}
          {mode === 'CREATE_EVENT' && (
            <WizardStep_CreateEvent
              perfil={perfil}
              onCreated={handleEventoCreado}
            />
          )}

          {/* PASO 2: Elegir modo */}
          {mode === 'CHOOSE_MODE' && (
            <WizardStep_ChooseMode
              onFacil={handleModoFacil}
              onManual={handleModoManual}
            />
          )}

          {/* PASO 3+: Pregunta de categoría */}
          {mode === 'CATEGORY_QUESTION' && categoriaActual && (
            <WizardStep_CategoryQuestion
              categoria={categoriaActual}
              onSi={handleCategoriaSi}
              onNo={handleCategoriaNo}
              onTerminar={handleTerminar}
              totalCategorias={WIZARD_CATEGORIES.length}
              categoriaIndex={categoriaIndex}
            />
          )}

          {/* PASO 4: Galería de servicios */}
          {mode === 'SERVICE_GALLERY' && categoriaActual && (
            loadingServicios ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-[var(--color-texto-suave)]">Buscando proveedores…</p>
              </div>
            ) : (
              <WizardStep_ServiceGallery
                categoria={categoriaActual}
                servicios={serviciosActuales}
                esFallback={esFallback}
                ciudadEvento={ciudadEvento}
                eventoId={eventoId!}
                clienteId={perfil?.cliente?.id || ''}
                fechaEvento={fechaEvento}
                onReservado={handleReservado}
                onSaltar={handleSaltarGaleria}
              />
            )
          )}

          {/* PASO FINAL: Resumen */}
          {mode === 'SUMMARY' && (
            <WizardStep_Summary
              eventoId={eventoId!}
              eventoNombre={eventoNombre}
              reservasHechas={reservasHechas}
              onFinalizar={handleFinalizar}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Helper: marca la cookie de onboarding completado
function marcarCompletado() {
  document.cookie = 'onboardingCompleted=true; path=/; max-age=31536000'; // 1 año
}
