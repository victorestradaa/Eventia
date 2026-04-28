'use client';

import { useState, useCallback } from 'react';
import { X, Building2, Music, Utensils, PartyPopper, Camera, Palette, Gift, Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getExplorarServiciosByCategoria } from '@/lib/actions/providerActions';

import WizardStep_CreateEvent from './WizardStep_CreateEvent';
import WizardStep_ChooseMode from './WizardStep_ChooseMode';
import WizardStep_CategoryQuestion from './WizardStep_CategoryQuestion';
import WizardStep_ServiceGallery from './WizardStep_ServiceGallery';
import WizardStep_Summary from './WizardStep_Summary';
import Logo from '@/components/common/Logo';

// ─── Configuración de Categorías del Asistente ────────────────────────────────
const WIZARD_CATEGORIES = [
  {
    id: 'SALON',
    label: 'Salón',
    emoji: '🏛️',
    pregunta: '¿Necesitas un Salón o Venue para tu evento?',
    descripcion: 'Encontramos los mejores salones y venues disponibles en tu ciudad.',
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

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[var(--color-fondo)] overflow-y-auto">
      {/* ─── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[var(--color-fondo)]/80 backdrop-blur-xl border-b border-[var(--color-borde-suave)] px-6 py-3 flex items-center gap-4">
        <Logo width={100} height={36} />

        {/* Barra de progreso */}
        <div className="flex-1 h-1.5 bg-[var(--color-fondo-input)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#eadeba] to-[#c79a3b] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>

        <span className="text-[10px] font-black text-[var(--color-texto-muted)] whitespace-nowrap">
          {progreso}%
        </span>

        {/* Skip */}
        {mode !== 'SUMMARY' && (
          <button
            onClick={handleSkipWizard}
            className="text-[10px] font-bold text-[var(--color-texto-muted)] hover:text-[var(--color-texto)] transition-colors underline underline-offset-2 flex items-center gap-1 whitespace-nowrap"
          >
            <X size={12} /> Saltar
          </button>
        )}
      </div>

      {/* ─── Contenido del paso actual ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div
          key={`${mode}-${categoriaIndex}`}
          className="w-full animate-in fade-in slide-in-from-right-4 duration-400"
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
                <p className="text-sm font-bold text-[var(--color-texto-suave)]">Buscando los mejores proveedores...</p>
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
      </div>

      {/* ─── Indicadores de categoría (dots) cuando estamos en el asistente ─── */}
      {(mode === 'CATEGORY_QUESTION' || mode === 'SERVICE_GALLERY') && (
        <div className="pb-6 flex justify-center gap-1.5">
          {WIZARD_CATEGORIES.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i < categoriaIndex ? 'w-6 bg-[#d4af37]'
                  : i === categoriaIndex ? 'w-6 bg-[#d4af37]'
                  : 'w-1.5 bg-[var(--color-borde-suave)]'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper: marca la cookie de onboarding completado
function marcarCompletado() {
  document.cookie = 'onboardingCompleted=true; path=/; max-age=31536000'; // 1 año
}
