'use client';

import { 
  ArrowLeft, 
  Eye, 
  Send, 
  Type, 
  Calendar as CalendarIcon, 
  MapPin, 
  Image as ImageIcon, 
  Palette, 
  CheckCircle2,
  Sparkles,
  Loader2,
  Upload,
  FileBox,
  EyeOff,
  MessageCircle,
  Mail,
  Copy,
  Users,
  Gift,
  CreditCard,
  FileDown,
  Settings2
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import InvitationCanvas from '@/components/cliente/invitaciones/InvitationCanvas';
import PremiumEditorPanel from '@/components/cliente/invitaciones/PremiumEditorPanel';
import PremiumInvitationView from '@/components/cliente/invitaciones/PremiumInvitationView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { uploadInvitationAsset } from '@/lib/actions/uploadActions';

interface InvitationEditorClientProps {
  evento: any;
  fondos?: any[];
  fuentes?: any[];
}

export default function InvitationEditorClient({ evento, fondos = [], fuentes = [] }: InvitationEditorClientProps) {
  const router = useRouter();
  
  // Pestañas
  const [tabActiva, setTabActiva] = useState<'BASIC' | 'PREMIUM' | 'ENVIAR'>('BASIC');
  
  // Estado para la invitación Premium - Asegurar seguridad ante evento nulo
  const [configWeb, setConfigWeb] = useState<any>(evento?.invitacion?.configWeb || {
    coverUrl: '',
    coverZoom: 1,
    coverAlignX: 50,
    coverAlignY: 50,
    tema: 'dark',
    mostrarContador: true,
    mostrarCeremonia: true,
    mostrarDressCode: true,
    mostrarCelebracion: true,
    mostrarGaleria: true,
    mostrarMapa: true,
    mostrarRegalos: true,
    mostrarRSVP: true,
    mostrarAlbumQR: true,
    fechaEventoExacta: evento?.fecha || '',
    ceremoniaNombre: '',
    ceremoniaFecha: evento?.fecha || '',
    ceremoniaDireccion: '',
    ceremoniaMapsUrl: '',
    ceremoniaBgColor: '#fafafa',
    ceremoniaTextColor: '#8b7355',
    dressCodeTexto: 'Formal / Gala',
    dressCodeColor: '#333333',
    celebracionNombre: 'Recepción',
    celebracionFecha: evento?.fecha || '',
    celebracionDireccion: '',
    celebracionMapsUrl: '',
    celebracionTextColor: '#8b7355',
    galeriaFotos: [],
    galeriaEfecto: 'slide',
  });
  const [tipoInvitacion, setTipoInvitacion] = useState(evento?.invitacion?.tipoInvitacion || 'BASICA');
  
  // Estado para campos básicos expandidos
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set(['titulo']));

  const toggleFieldExpand = (id: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  // Modos de editor
  const [modoPropia, setModoPropia] = useState(evento?.invitacion?.isInvitacionPropia || false);
  const [archivoAdjuntoBase64, setArchivoAdjuntoBase64] = useState<string | null>(evento?.invitacion?.archivoAdjunto || null);
  const [fondoUrlActivo, setFondoUrlActivo] = useState(evento?.invitacion?.fondoUrl || '');

  const getInitialEstilos = () => {
    const defCol = evento?.invitacion?.colorTexto && typeof evento.invitacion.colorTexto === 'string' && !evento.invitacion.colorTexto.startsWith('{') 
      ? evento.invitacion.colorTexto : '#ffffff';
      
    const defaults: any = {
      titulo: { color: defCol, fuente: '', fontSize: 10, x: 28, y: 120, width: 344, height: 40, visible: true },
      nombres: { color: defCol, fuente: '', fontSize: 36, x: 28, y: 160, width: 344, height: 60, visible: true },
      mensaje: { color: defCol, fuente: '', fontSize: 14, x: 28, y: 260, width: 344, height: 80, visible: true },
      lugar: { color: defCol, fuente: '', fontSize: 12, x: 28, y: 400, width: 344, height: 60, visible: true },
      vestimenta: { color: defCol, fuente: '', fontSize: 14, x: 28, y: 490, width: 344, height: 60, visible: true },
      boton: { color: defCol, visible: true },
      mapPin: { color: defCol, x: 180, y: 450, width: 40, height: 40, visible: true },
      horaCeremonia: { color: defCol, fuente: '', fontSize: 16, x: 28, y: 480, width: 344, height: 40, visible: false },
      horaCelebracion: { color: defCol, fuente: '', fontSize: 16, x: 28, y: 530, width: 344, height: 40, visible: false },
      regalos: { color: defCol, fuente: '', fontSize: 12, x: 28, y: 600, width: 344, height: 80, visible: true }
    };

    try {
      if (evento?.invitacion?.colorTexto) {
         const parsed = typeof evento.invitacion.colorTexto === 'string' 
           ? JSON.parse(evento.invitacion.colorTexto) 
           : evento.invitacion.colorTexto;
           
         if (parsed && typeof parsed === 'object') {
           const merged = { ...defaults };
           Object.keys(merged).forEach(k => {
              if (parsed[k]) {
                merged[k] = { ...merged[k], ...parsed[k] };
              }
           });
           return merged;
         }
      }
    } catch(e) {
      console.error("Error al parsear estilos de invitación", e);
    }
    
    return defaults;
  };

  const [estilos, setEstilos] = useState(getInitialEstilos());
  
  const [texto, setTexto] = useState({
    titulo: evento?.invitacion?.titulo || (evento?.tipo === 'BODA' ? '¡Nos Casamos!' : '¡Estás Invitado!'),
    nombres: evento?.nombre || 'Mi Evento Especial',
    mensaje: evento?.invitacion?.mensaje || 'Queremos compartir este día tan especial contigo. Tu presencia es nuestro mejor regalo.',
    vestimenta: evento?.invitacion?.vestimenta || 'Formal / Gala',
    lugar: evento?.invitacion?.lugarTexto || 'Sin asignar',
    direccion: evento?.invitacion?.direccion || '',
    horaCeremonia: '04:00 PM',
    horaCelebracion: '06:00 PM',
    regaloTipo: evento?.invitacion?.regaloTipo || 'MESA',
    regaloMesaUrl: evento?.invitacion?.regaloMesaUrl || '',
    regaloBanco: evento?.invitacion?.regaloBanco || '',
    regaloClabe: evento?.invitacion?.regaloClabe || ''
  });

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getInitialCategoria = () => {
    const t = evento?.tipo?.toUpperCase() || '';
    if (t.includes('BODA')) return 'BODA';
    if (t.includes('XV')) return 'XV_ANOS';
    if (t.includes('BAUTIZO')) return 'BAUTIZO';
    if (t.includes('INFANTIL')) return 'FIESTA_INFANTIL';
    if (t.includes('GENERAL')) return 'FIESTA_GENERAL';
    return 'TODAS';
  };

  const [filtroCategoria, setFiltroCategoria] = useState(getInitialCategoria());
  const fondosFiltrados = fondos.filter(f => 
    filtroCategoria === 'TODAS' ? true : (f.categoria === filtroCategoria || f.categoria === 'TODAS')
  );

  useEffect(() => {
    if (fondosFiltrados.length > 0 && !fondoUrlActivo) {
      setFondoUrlActivo(fondosFiltrados[0].url);
    }
  }, [filtroCategoria, fondosFiltrados, fondoUrlActivo]);
  
  // Sincronizar datos Básico -> Premium (Soft sync)
  useEffect(() => {
    setConfigWeb(prev => {
      const newConfig = { ...prev };
      let changed = false;
      
      if (texto.direccion && !newConfig.direccion) { newConfig.direccion = texto.direccion; changed = true; }
      if (texto.direccion && !newConfig.ceremoniaDireccion) { newConfig.ceremoniaDireccion = texto.direccion; changed = true; }
      if (texto.lugar && !newConfig.ceremoniaNombre) { newConfig.ceremoniaNombre = texto.lugar; changed = true; }
      if (texto.regaloTipo && !newConfig.regaloTipo) { newConfig.regaloTipo = texto.regaloTipo; changed = true; }
      if (texto.regaloMesaUrl && !newConfig.regaloMesaUrl) { newConfig.regaloMesaUrl = texto.regaloMesaUrl; changed = true; }
      if (texto.regaloBanco && !newConfig.regaloBanco) { newConfig.regaloBanco = texto.regaloBanco; changed = true; }
      if (texto.regaloClabe && !newConfig.regaloClabe) { newConfig.regaloClabe = texto.regaloClabe; changed = true; }
      
      return changed ? newConfig : prev;
    });
  }, [texto]);


  if (!evento) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-10 animate-in fade-in zoom-in-95 duration-700 min-h-[60vh] bg-[var(--color-fondo-card)]/30 rounded-[3rem] border border-dashed border-white/5 mx-auto max-w-4xl">
        <div className="relative">
          <div className="absolute -inset-8 bg-[var(--color-acento)]/10 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-zinc-800 to-black rounded-[2.5rem] flex items-center justify-center text-[var(--color-acento-claro)] shadow-2xl border border-white/10 ring-1 ring-white/5">
            <CalendarIcon size={56} className="drop-shadow-[0_0_15px_var(--color-acento)]" />
          </div>
        </div>
        
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            ¡Vaya! No hay eventos <span className="text-[var(--color-acento-claro)]">activos</span>
          </h2>
          <p className="text-sm text-[var(--color-texto-muted)] font-medium leading-relaxed">
            Para poder diseñar tu invitación digital premium, primero necesitamos saber qué estamos celebrando. Crea tu primer evento y vuelve aquí para desatar tu creatividad.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/cliente/dashboard" className="btn btn-primario px-10 py-5 gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all">
             <Sparkles size={20} /> Crear mi primer evento
          </Link>
          <Link href="/explorar" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
             Ver Inspiración
          </Link>
        </div>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setArchivoAdjuntoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (tipoOverride?: any) => {
    // Si tipoOverride es un evento (de un onClick), lo ignoramos para evitar estructuras circulares en JSON
    const finalTipo = (typeof tipoOverride === 'string') ? tipoOverride : tipoInvitacion;
    setSaving(true);
    try {
      let finalArchivoUrl = archivoAdjuntoBase64;

      // Si es una imagen nueva (Base64), subirla a Storage primero
      if (modoPropia && archivoAdjuntoBase64 && archivoAdjuntoBase64.startsWith('data:image')) {
        // Convertir Base64 a Blob/File
        const resBlob = await fetch(archivoAdjuntoBase64);
        const blob = await resBlob.blob();
        const file = new File([blob], 'invitacion_propia.png', { type: blob.type });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventoId', evento.id);

        const uploadRes = await uploadInvitationAsset(formData);
        if (uploadRes.success && uploadRes.url) {
          finalArchivoUrl = uploadRes.url;
          setArchivoAdjuntoBase64(uploadRes.url); // Actualizar estado local con URL
        } else {
          throw new Error(uploadRes.error || 'Error al subir la imagen personalizada');
        }
      }

      const payload = {
        eventoId: evento.id,
        isInvitacionPropia: modoPropia,
        archivoAdjunto: modoPropia ? finalArchivoUrl : null,
        plantilla: 'custom', 
        fondoUrl: fondoUrlActivo,
        colorTexto: JSON.stringify(estilos),
        titulo: texto.titulo,
        mensaje: texto.mensaje,
        lugarTexto: texto.lugar,
        vestimenta: texto.vestimenta,
        configWeb: {
          ...configWeb,
          // Solo sobrescribir si no pertenecen a la pestaña Premium o para asegurar consistencia mínima
          direccion: configWeb.direccion || texto.direccion,
          regaloTipo: configWeb.regaloTipo || texto.regaloTipo,
          regaloMesaUrl: configWeb.regaloMesaUrl || texto.regaloMesaUrl,
          regaloBanco: configWeb.regaloBanco || texto.regaloBanco,
          regaloClabe: configWeb.regaloClabe || texto.regaloClabe,
          coverZoom: configWeb.coverZoom || 1,
          coverAlignX: configWeb.coverAlignX || 50,
          coverAlignY: configWeb.coverAlignY || 50,
        },
        tipoInvitacion: finalTipo,
      };

      const res = await fetch('/api/invitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al guardar la invitación');
      }

      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.invitacion?.tipoInvitacion) {
          setTipoInvitacion(resData.invitacion.tipoInvitacion);
        }
        router.refresh();
      }
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || 'Error desconocido al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    setExporting(true);

    try {
      const isMobile = window.innerWidth < 768;
      const canvas = await html2canvas(canvasRef.current, {
        scale: isMobile ? 1.2 : 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: null,
        onclone: (clonedDoc) => {
          // 1. Aseguramos visibilidad
          const el = clonedDoc.getElementById('invitation-canvas-root');
          if (el) el.style.visibility = 'visible';
          
          // 2. SANITIZADOR DE COLORES: Reemplazar oklch/lab por RGB compatibles
          // html2canvas no soporta funciones de color modernas de CSS como oklch o lab
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const node = allElements[i] as HTMLElement;
            if (!node.style) continue;
            
            const style = window.getComputedStyle(node);
            
            // Reemplazar fondos problemáticos
            if (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('lab')) {
               node.style.backgroundColor = style.backgroundColor; // Forzar valor computado (que suele ser rgb)
            }
            // Reemplazar colores de texto
            if (style.color.includes('oklch') || style.color.includes('lab')) {
               node.style.color = style.color;
            }
            // Reemplazar bordes
            if (style.borderColor.includes('oklch') || style.borderColor.includes('lab')) {
               node.style.borderColor = style.borderColor;
            }
            // Eliminar sombras con oklch que rompen el parser
            if (style.boxShadow.includes('oklch') || style.boxShadow.includes('lab')) {
               node.style.boxShadow = 'none';
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // --- AGREGAR ENLACES ACTIVOS ---
      // 1. Link de Google Maps (MapPin)
      if (estilos.mapPin?.visible && texto.direccion) {
        const x = estilos.mapPin.x || 0;
        const y = estilos.mapPin.y || 0;
        const w = estilos.mapPin.width || 40;
        const h = estilos.mapPin.height || 40;
        // Ajustar coordenadas si es necesario (el canvas tiene 400x700 por defecto)
        pdf.link(x, y, w, h, { url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto.direccion)}` });
      }

      // 2. Link RSVP (Botón)
      if (estilos.boton?.visible !== false) {
        // El botón está centrado en la parte inferior (bottom-10, left-10, right-10)
        // Dimensiones aproximadas del botón si no tiene estilos de posición propios
        const x = 40; 
        const y = 630; // 700 - 10 (bottom) - 60 (altura aprox)
        const w = 320; // 400 - 80 
        const h = 50;
        
        const rsvpUrl = `${window.location.origin}/invitacion/${evento.invitados?.[0]?.rsvpToken || evento.id}`;
        pdf.link(x, y, w, h, { url: rsvpUrl });
      }

      // 3. Link Mesa de Regalos
      if (estilos.regalos?.visible && texto.regaloTipo === 'MESA' && texto.regaloMesaUrl) {
        const x = estilos.regalos.x || 0;
        const y = estilos.regalos.y || 0;
        const w = estilos.regalos.width || 344;
        const h = estilos.regalos.height || 80;
        const giftUrl = texto.regaloMesaUrl?.startsWith('http') ? texto.regaloMesaUrl : `https://${texto.regaloMesaUrl}`;
        pdf.link(x, y, w, h, { url: giftUrl });
      }

      pdf.save(`Invitacion_${evento.nombre.replace(/\s+/g, '_')}.pdf`);
      alert('PDF generado exitosamente');
    } catch (error: any) {
      console.error('Error exportando PDF:', error);
      alert('Error al generar el PDF: ' + (error.message || 'Error desconocido. Verifica que las imágenes de fondo tengan permisos CORS o intenta con un diseño diferente.'));
    } finally {
      setExporting(false);
    }
  };

  const toggleVisibility = (id: string) => {
    const estiloActual = estilos[id] || { visible: true };
    setEstilos({
      ...estilos,
      [id]: { ...estiloActual, visible: !estiloActual.visible }
    });
  };

  const renderCampo = (id: keyof typeof texto, label: string, isTextarea = false, parentStyleId?: string) => {
    const styleId = (parentStyleId || id) as string;
    const estilo = estilos[styleId] || { visible: true };
    const isExpanded = expandedFields.has(styleId);

    const IconMap: Record<string, any> = {
      titulo: Type,
      nombres: Users,
      mensaje: MessageCircle,
      lugar: MapPin,
      vestimenta: Sparkles,
      regaloMesaUrl: Gift,
      regaloBanco: CreditCard,
      regaloClabe: Copy
    };

    const Icon = IconMap[id] || Type;

    return (
      <div className={cn(
        "group bg-[var(--color-fondo-input)] rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm mb-4",
        estilo.visible ? "border-[var(--color-borde-suave)]" : "opacity-70 bg-zinc-100/50 border-[var(--color-borde-suave)]"
      )}>
        <div className="flex items-center justify-between p-4 gap-2">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              estilo.visible ? "bg-[var(--color-acento)] text-white shadow-lg" : "bg-[var(--color-fondo-card)] text-[var(--color-texto-muted)] shadow-inner"
            )}>
              <Icon size={18} />
            </div>
            <span className={cn(
              "text-[11px] font-black uppercase tracking-widest transition-colors",
              estilo.visible ? "text-[var(--color-texto)]" : "text-[var(--color-texto-muted)]"
            )}>
              {label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleFieldExpand(styleId)}
              className={cn(
                "p-3 rounded-xl transition-all duration-300",
                isExpanded ? "bg-[var(--color-acento)]/10 text-[var(--color-acento)] rotate-180" : "text-[var(--color-texto-muted)] hover:bg-black/5"
              )}
            >
              <Settings2 size={18} />
            </button>
            <button 
              onClick={() => toggleVisibility(styleId)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-500",
                estilo.visible ? "bg-[var(--color-acento)] shadow-[0_4px_10px_var(--color-acento)]/30" : "bg-zinc-300"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm",
                estilo.visible ? "right-1" : "left-1"
              )} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 duration-300 space-y-4 border-t border-[var(--color-borde-suave)] bg-white/50">
          <div className="flex items-center gap-1.5 flex-wrap bg-[var(--color-fondo-input)] p-1.5 rounded-2xl border border-[var(--color-borde-suave)] shadow-sm">
             <div className="relative group/color">
               <input 
                 type="color" 
                 value={estilo.color || '#ffffff'}
                 onChange={(e) => setEstilos({...estilos, [styleId]: {...estilo, color: e.target.value}})}
                 className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0 shadow-lg bg-transparent overflow-hidden hover:scale-110 transition-transform"
               />
             </div>
             
             <div className="w-px h-4 bg-[var(--color-borde-suave)] mx-1" />
             
             <div className="flex items-center gap-1 bg-[var(--color-fondo-card)] rounded-lg px-2 py-1.5 border border-[var(--color-borde-suave)]">
                <span className="text-[8px] font-black text-[var(--color-texto-muted)]">PT</span>
                <input 
                  type="number"
                  value={estilo.fontSize || 16}
                  onChange={(e) => setEstilos({...estilos, [styleId]: {...estilo, fontSize: Number(e.target.value)}})}
                  className="w-10 text-[11px] bg-transparent outline-none text-[var(--color-texto)] font-black text-center"
                />
             </div>

             <div className="relative flex-1 min-w-[120px]">
               <select
                 value={estilo.fuente || ''}
                 onChange={(e) => setEstilos({...estilos, [styleId]: {...estilo, fuente: e.target.value}})}
                 className="w-full text-[10px] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-lg pl-3 pr-6 py-1.5 outline-none text-[var(--color-texto)] font-bold appearance-none cursor-pointer"
                 style={{ fontFamily: estilo.fuente || 'inherit' }}
               >
                 <option value="">Fuente</option>
                 {fuentes.map(f => (
                   <option 
                     key={f.id} 
                     value={f.nombre} 
                     style={{ fontFamily: f.nombre }}
                   >
                     {f.nombre}
                   </option>
                 ))}
               </select>
               <Palette size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] pointer-events-none" />
             </div>
          </div>

          {/* Input Principal */}
          <div className="relative group/input">
            {isTextarea ? (
              <textarea 
                className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] hover:border-[var(--color-acento)]/50 rounded-2xl px-6 py-5 outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-fondo-card)] focus:ring-8 focus:ring-[var(--color-acento)]/5 transition-all duration-500 text-sm min-h-[100px] resize-none shadow-inner placeholder:text-[var(--color-texto-muted)]/70 text-[var(--color-texto)] font-medium" 
                value={texto[id]}
                placeholder={`Escribe aquí ${label.toLowerCase()}...`}
                onChange={(e) => setTexto({...texto, [id]: e.target.value})}
              />
            ) : (
              <input 
                type="text" 
                className="w-full h-14 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] hover:border-[var(--color-acento)]/50 rounded-2xl px-6 py-2 outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-fondo-card)] focus:ring-8 focus:ring-[var(--color-acento)]/5 transition-all duration-500 text-base text-[var(--color-texto)] shadow-inner placeholder:text-[var(--color-texto-muted)]/70 font-bold" 
                value={texto[id]} 
                placeholder={`Escribe aquí ${label.toLowerCase()}...`}
                onChange={(e) => setTexto({...texto, [id]: e.target.value})}
              />
            )}
          </div>
          </div>
        )}
      </div>
    );
  };

  const handleShareWhatsApp = (invitado: any) => {
    const url = `${window.location.origin}/invitacion/${invitado.rsvpToken}`;
    const mensaje = `¡Hola ${invitado.nombre}! Te invito a mi evento, aquí tienes tu invitación digital para confirmar tu asistencia: ${url}`;
    window.open(`https://wa.me/${invitado.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/invitacion/${token}`;
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado al portapapeles!');
  };

  if (!evento) return null; // Fallback de seguridad adicional, aunque ya se maneja arriba

  return (
    <div className="flex flex-col gap-8 pb-20">
      <style dangerouslySetInnerHTML={{__html: fuentes.map(f => `
        @font-face {
          font-family: '${f.nombre}';
          src: url('${f.url}');
        }
      `).join('\n')}} />

      {/* Header Fijo dentro del contenedor del cliente */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
           <Link href={`/cliente/evento/${evento?.id}`} className="flex items-center gap-2 text-xs text-[var(--color-texto-muted)] hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} /> Volver al evento
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap">Gestor de Invitaciones</h1>
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest">
              {evento.tipo?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <button 
              onClick={() => setTabActiva('BASIC')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2.5", 
                tabActiva === 'BASIC' 
                  ? "bg-white text-black shadow-lg scale-105" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <ImageIcon size={14} className={tabActiva === 'BASIC' ? "text-black" : "text-white/40"} /> 
              Básica (Imagen)
            </button>
            <button 
              onClick={() => setTabActiva('PREMIUM')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2.5", 
                tabActiva === 'PREMIUM' 
                  ? "bg-[var(--color-acento)] text-white shadow-lg scale-105" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <Sparkles size={14} className={tabActiva === 'PREMIUM' ? "text-white" : "text-[var(--color-acento-claro)]"} /> 
              Premium (Web)
            </button>
            <button 
              onClick={() => setTabActiva('ENVIAR')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2.5", 
                tabActiva === 'ENVIAR' 
                  ? "bg-white text-black shadow-lg scale-105" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <Users size={14} className={tabActiva === 'ENVIAR' ? "text-black" : "text-white/40"} /> 
              Enviar ({evento.invitados?.length || 0})
            </button>
          </div>
          {tabActiva !== 'ENVIAR' && (
            <div className="flex gap-3">
              {tabActiva === 'BASIC' && (
                <button 
                  onClick={handleExportPDF} 
                  className="btn btn-oro gap-2 px-6 shadow-xl disabled:opacity-50" 
                  disabled={exporting}
                >
                  {exporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />} 
                  {exporting ? 'Generando...' : 'Exportar PDF'}
                </button>
              )}
              <button 
                onClick={() => handleSave()} 
                className="btn btn-primario gap-2 px-6 shadow-xl" 
                disabled={saving}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                {saving ? 'Guardando...' : 'Guardar Diseño'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start transition-all duration-700">
        {/* Panel Izquierdo: Controles */}
        <div className="space-y-6 lg:col-span-4">
          {tabActiva === 'PREMIUM' ? (
            <PremiumEditorPanel 
              config={configWeb} 
              onChange={setConfigWeb}
              evento={evento}
            />
          ) : tabActiva === 'BASIC' ? (
            <>
              <div className="flex bg-[var(--color-fondo-input)] p-1.5 rounded-[var(--radio-xl)] w-full border border-[var(--color-borde-suave)] shadow-inner">
                  <button 
                    onClick={() => setModoPropia(false)}
                    className={cn(
                      "flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3", 
                      !modoPropia 
                        ? "bg-zinc-800 text-white shadow-2xl scale-[1.02] z-10" 
                        : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
                    )}
                  >
                    <Sparkles size={18} className={!modoPropia ? "text-[var(--color-acento)]" : "text-[var(--color-texto-muted)]/20"} /> Automático
                  </button>
                  <button 
                    onClick={() => setModoPropia(true)}
                    className={cn(
                      "flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3", 
                      modoPropia 
                        ? "bg-[var(--color-acento)] text-white shadow-2xl scale-[1.02] z-10" 
                        : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
                    )}
                  >
                    <Upload size={18} className={modoPropia ? "text-white" : "text-[var(--color-texto-muted)]/20"} /> Mi Diseño
                  </button>
                </div>

              {!modoPropia ? (
                <>
                  <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl p-6 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black flex items-center gap-2 uppercase text-[10px] tracking-[0.2em] text-[var(--color-texto-muted)]">
                        <Palette size={14} className="text-[var(--color-acento)]" /> Galería de Estilos
                      </h3>
                      <span className="text-[9px] font-bold text-[var(--color-texto-muted)] bg-[var(--color-fondo-input)] px-2 py-1 rounded-full">{fondosFiltrados.length} Diseños</span>
                    </div>
                    <div>
                      <select 
                        className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-3 text-xs outline-none focus:border-[var(--color-acento)]/40 mb-6 transition-all appearance-none cursor-pointer font-bold text-[var(--color-texto)] shadow-inner" 
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                      >
                        <option value="TODAS">Todos los temas</option>
                        <option value="BODA">Boda</option>
                        <option value="XV_ANOS">XV Años</option>
                        <option value="BAUTIZO">Bautizo</option>
                        <option value="FIESTA_INFANTIL">Fiesta Infantil</option>
                        <option value="FIESTA_GENERAL">Fiesta General</option>
                      </select>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-3 max-h-96 sm:max-h-56 overflow-y-auto pr-2 custom-scrollbar p-1">
                        {fondosFiltrados.map((f) => (
                          <button 
                            key={f.id}
                            onClick={() => setFondoUrlActivo(f.url)}
                            className={cn(
                              "relative w-full rounded-xl border-2 transition-all duration-500 overflow-hidden aspect-[9/16] group/thumb shadow-md",
                              fondoUrlActivo === f.url 
                                ? "border-[var(--color-acento)] ring-4 ring-[var(--color-acento)]/10 scale-[0.98] shadow-2xl shadow-[var(--color-acento)]/20" 
                                : "border-[var(--color-borde-suave)] hover:border-[var(--color-acento)]/30 hover:scale-105"
                            )}
                          >
                            <img src={f.url || null} alt={f.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" />
                            {fondoUrlActivo === f.url && (
                              <div className="absolute inset-0 bg-[var(--color-acento)]/20 flex items-center justify-center">
                                <CheckCircle2 size={24} className="text-white drop-shadow-lg" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black flex items-center gap-2 uppercase text-[10px] tracking-[0.2em] text-[var(--color-texto-muted)]">
                        <Type size={14} className="text-[var(--color-acento)]" /> Tipografías y Textos
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {renderCampo('titulo', 'Frase inicial')}
                      {renderCampo('nombres', 'Protagonistas')}
                      {renderCampo('mensaje', 'Mensaje Invitación', true)}
                      {renderCampo('lugar', 'Ubicación')}
                      {renderCampo('direccion', 'Dirección Google Maps')}
                      
                      {renderCampo('horaCeremonia', 'Hora de Ceremonia Religiosa')}
                      {renderCampo('horaCelebracion', 'Hora de Celebración')}
                      
                      {/* Control Independiente del PIN de Mapa */}
                      <div className="pt-2 pb-6 border-b border-[var(--color-borde-suave)] mb-4">
                        <div className={cn(
                          "flex justify-between items-center group bg-[var(--color-fondo-input)] rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm p-4",
                          estilos.mapPin?.visible ? "border-[var(--color-borde-suave)]" : "opacity-70 bg-zinc-100/50 border-[var(--color-borde-suave)]"
                        )}>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleVisibility('mapPin')}
                                className={cn(
                                  "w-12 h-6 rounded-full relative transition-all duration-500 shrink-0",
                                  estilos.mapPin?.visible ? "bg-[var(--color-acento)] shadow-[0_4px_10px_var(--color-acento)]/30" : "bg-zinc-300"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm",
                                  estilos.mapPin?.visible ? "right-1" : "left-1"
                                )} />
                              </button>
                              <div className="space-y-0.5">
                                <label className={cn(
                                  "text-[11px] font-black uppercase tracking-widest transition-colors",
                                  estilos.mapPin?.visible ? "text-[var(--color-texto)]" : "text-[var(--color-texto-muted)]"
                                )}>Icono Map-Pin</label>
                                <p className="text-[9px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest">Movible y Redimensionable</p>
                              </div>
                            </div>
                            <div className="relative group/picker">
                              <input 
                                type="color" 
                                value={estilos.mapPin?.color || '#ffffff'}
                                onChange={(e) => setEstilos({...estilos, mapPin: {...estilos.mapPin, color: e.target.value}})}
                                className="h-10 w-10 rounded-xl cursor-pointer border border-[var(--color-borde-suave)] p-0 shadow-sm bg-transparent overflow-hidden hover:scale-110 transition-transform"
                              />
                            </div>
                        </div>
                      </div>

                      {/* SECCIÓN REGALOS (NEW) */}
                      <div className="pt-2 pb-8 border-b border-[var(--color-borde-suave)] mb-6 space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-[var(--color-acento)]/20 flex items-center justify-center text-[var(--color-acento-claro)]">
                              <Gift size={16} />
                           </div>
                           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sugerencia de Regalos</h3>
                        </div>

                        <div className="flex bg-[var(--color-fondo-input)] p-1.5 rounded-[var(--radio-lg)] w-full border border-[var(--color-borde-suave)] shadow-inner">
                           <button 
                             onClick={() => setTexto({...texto, regaloTipo: 'MESA'})}
                             className={cn(
                               "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2",
                               texto.regaloTipo === 'MESA' ? "bg-[var(--color-acento)] text-white shadow-lg scale-[1.02] z-10" : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
                             )}
                           >
                             <Gift size={14} className={texto.regaloTipo === 'MESA' ? "text-white" : "text-[var(--color-texto-muted)]/40"} /> Mesa Regalo
                           </button>
                           <button 
                             onClick={() => setTexto({...texto, regaloTipo: 'EFECTIVO'})}
                             className={cn(
                               "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2",
                               texto.regaloTipo === 'EFECTIVO' ? "bg-[var(--color-acento)] text-white shadow-lg scale-[1.02] z-10" : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
                             )}
                           >
                             <CreditCard size={14} className={texto.regaloTipo === 'EFECTIVO' ? "text-white" : "text-[var(--color-texto-muted)]/40"} /> Monetario
                           </button>
                        </div>

                        {texto.regaloTipo === 'MESA' ? (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             {renderCampo('regaloMesaUrl', 'Link Mesa de Regalos (Liverpool, Amazon, etc)', false, 'regalos')}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                             {renderCampo('regaloBanco', 'Nombre Banco', false, 'regalos')}
                             {renderCampo('regaloClabe', 'CLABE (18 dígitos)', false, 'regalos')}
                          </div>
                        )}

                        {/* Control Independiente del Bloque de Regalos */}
                        <div className={cn(
                          "flex justify-between items-center group bg-[var(--color-fondo-input)] rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm mb-4 mb-4 p-4",
                          estilos.regalos?.visible ? "border-[var(--color-borde-suave)]" : "opacity-70 bg-zinc-100/50 border-[var(--color-borde-suave)]"
                        )}>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleVisibility('regalos')}
                                className={cn(
                                  "w-12 h-6 rounded-full relative transition-all duration-500 shrink-0",
                                  estilos.regalos?.visible ? "bg-[var(--color-acento)] shadow-[0_4px_10px_var(--color-acento)]/30" : "bg-zinc-300"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm",
                                  estilos.regalos?.visible ? "right-1" : "left-1"
                                )} />
                              </button>
                              <div className="space-y-0.5">
                                <label className={cn(
                                  "text-[11px] font-black uppercase tracking-widest transition-colors",
                                  estilos.regalos?.visible ? "text-[var(--color-texto)]" : "text-[var(--color-texto-muted)]"
                                )}>Bloque Regalos</label>
                                <p className="text-[9px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest">Movible y Redimensionable</p>
                              </div>
                            </div>
                            <div className="relative group/picker">
                              <input 
                                type="color" 
                                value={estilos.regalos?.color || '#ffffff'}
                                onChange={(e) => setEstilos({...estilos, regalos: {...estilos.regalos, color: e.target.value}})}
                                className="h-10 w-10 rounded-xl cursor-pointer border border-[var(--color-borde-suave)] p-0 shadow-sm bg-transparent overflow-hidden hover:scale-110 transition-transform"
                              />
                            </div>
                        </div>
                      </div>

                      {renderCampo('vestimenta', 'Vestimenta')}
                    </div>
                    
                    {/* Sección RSVP Rediseñada */}
                    <div className="pt-6 border-t border-[var(--color-borde-suave)]">
                        <div className={cn(
                          "flex justify-between items-center group bg-[var(--color-fondo-input)] rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm mb-4 mb-4 p-4",
                          estilos.boton?.visible ? "border-[var(--color-borde-suave)]" : "opacity-70 bg-zinc-100/50 border-[var(--color-borde-suave)]"
                        )}>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleVisibility('boton')}
                                className={cn(
                                  "w-12 h-6 rounded-full relative transition-all duration-500 shrink-0",
                                  estilos.boton?.visible ? "bg-[var(--color-acento)] shadow-[0_4px_10px_var(--color-acento)]/30" : "bg-zinc-300"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm",
                                  estilos.boton?.visible ? "right-1" : "left-1"
                                )} />
                              </button>
                              <div className="space-y-0.5">
                                <label className={cn(
                                  "text-[11px] font-black uppercase tracking-widest transition-colors",
                                  estilos.boton?.visible ? "text-[var(--color-texto)]" : "text-[var(--color-texto-muted)]"
                                )}>Botón RSVP</label>
                                <p className="text-[9px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest">Link de confirmación</p>
                              </div>
                            </div>
                            <div className="relative group/picker">
                              <input 
                                type="color" 
                                value={estilos.boton?.color || '#ffffff'}
                                onChange={(e) => setEstilos({...estilos, boton: {...estilos.boton, color: e.target.value}})}
                                className="h-10 w-10 rounded-xl cursor-pointer border border-[var(--color-borde-suave)] p-0 shadow-sm bg-transparent overflow-hidden hover:scale-110 transition-transform"
                              />
                            </div>
                        </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-8 text-center">
                   <div className="space-y-2">
                     <h3 className="font-black flex items-center justify-center gap-2 uppercase text-[10px] tracking-[0.3em] text-white/30">
                       <FileBox size={14} className="text-[var(--color-acento-claro)]" /> Mesa de Luces
                     </h3>
                     <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Sube tu diseño final y lo proyectaremos</p>
                   </div>
                   
                   <div 
                    className="group relative border-2 border-dashed border-white/5 rounded-[var(--radio-xl)] p-12 flex flex-col items-center justify-center gap-6 hover:bg-white/[0.02] hover:border-[var(--color-acento)]/30 transition-all duration-700 cursor-pointer overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {/* Decoración de fondo en hover */}
                    <div className="absolute inset-0 bg-[var(--color-acento)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative z-10 w-20 h-20 rounded-3xl bg-black/40 flex items-center justify-center text-white/20 group-hover:text-[var(--color-acento-claro)] group-hover:scale-110 transition-all duration-500 shadow-inner border border-white/5">
                      <Upload size={32} />
                    </div>
                    
                    <div className="relative z-10 space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Arrastra tu obra maestra</p>
                      <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">PNG, JPG, WEBP • Máximo 5MB</p>
                    </div>
                    
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  </div>

                  {archivoAdjuntoBase64 && (
                    <div className="p-5 bg-[var(--color-liquidado)]/5 border border-[var(--color-liquidado)]/20 rounded-2xl flex items-center gap-5 animate-in slide-in-from-bottom-2">
                       <div className="w-16 h-16 rounded-xl bg-black shadow-2xl overflow-hidden border border-white/10 ring-4 ring-[var(--color-liquidado)]/10">
                         <img src={archivoAdjuntoBase64} className="w-full h-full object-cover" />
                       </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase text-[var(--color-liquidado)] tracking-widest">Diseño listo</p>
                          <p className="text-[9px] text-[var(--color-texto-muted)] font-bold mt-0.5 italic">Sincronizado con éxito</p>
                        </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl p-8 space-y-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="font-black flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-[var(--color-texto)]">
                    <Users size={20} className="text-[var(--color-acento)]" /> Lista de Invitados
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pl-8">
                     <p className="text-[9px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest">Enviando versión:</p>
                     <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                          (tipoInvitacion === 'PREMIUM') 
                            ? "bg-[var(--color-acento)]/20 text-[var(--color-acento-claro)] border-[var(--color-acento)]/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        )}>
                          {(tipoInvitacion === 'PREMIUM') ? 'Premium (Web)' : 'Básica (Imagen)'}
                        </span>
                        
                        <button 
                          onClick={() => {
                            const targetTipo = tipoInvitacion === 'PREMIUM' ? 'BASICA' : 'PREMIUM';
                            setTipoInvitacion(targetTipo);
                            handleSave(targetTipo);
                          }}
                          className="text-[9px] font-black uppercase text-[var(--color-acento-claro)] hover:underline flex items-center gap-1 transition-all"
                          disabled={saving}
                        >
                          <Sparkles size={10} /> {tipoInvitacion === 'PREMIUM' ? 'Cambiar a Básica' : 'Activar Premium'}
                        </button>
                     </div>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl text-[10px] font-black text-[var(--color-texto-muted)] shadow-inner self-start sm:self-center">
                  {evento.invitados?.length || 0} Registrados
                </span>
              </div>

              {/* Tips de envío */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                 <p className="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest leading-relaxed">
                   Tip: Si quieres cambiar el diseño que se envía, vuelve a las pestañas de edición, realiza tus cambios y dale a "Guardar Diseño".
                 </p>
              </div>

              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-3 custom-scrollbar p-1">
                {evento.invitados?.map((invitado: any) => (
                  <div key={invitado.id} className="p-5 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl flex items-center justify-between group hover:border-[var(--color-acento)]/30 transition-all duration-500 hover:shadow-2xl hover:bg-[var(--color-fondo-card)]">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] flex items-center justify-center font-black text-[var(--color-texto-muted)] group-hover:bg-[var(--color-acento)]/10 group-hover:text-[var(--color-acento)] transition-all duration-500 shadow-inner">
                        {invitado.nombre[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[var(--color-texto)] group-hover:text-[var(--color-primario)] transition-colors truncate">{invitado.nombre}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full blur-[2px]",
                            invitado.email ? "bg-[var(--color-liquidado)]" : "bg-amber-400"
                          )} />
                          <p className="text-[9px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest truncate">{invitado.telefono || 'Sin teléfono'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2.5 opacity-40 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100">
                      {invitado.telefono && (
                        <button 
                          onClick={() => handleShareWhatsApp(invitado)}
                          className="p-3 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-xl hover:shadow-green-500/20 active:scale-90"
                          title="Enviar por WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </button>
                      )}
                      <button 
                         onClick={() => copyToClipboard(invitado.rsvpToken)}
                         className="p-3 bg-[var(--color-fondo-card)] text-[var(--color-texto-muted)] border border-[var(--color-borde-suave)] rounded-xl hover:bg-[var(--color-fondo-input)] hover:text-[var(--color-texto)] transition-all active:scale-90"
                         title="Copiar Link RSVP"
                      >
                         <Copy size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {(!evento.invitados || evento.invitados.length === 0) && (
                  <div className="text-center py-20 opacity-30">
                    <Users size={48} className="mx-auto mb-4 text-white/20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No hay invitados aún</p>
                    <Link href={`/cliente/evento/${evento.id}`} className="text-xs underline mt-4 inline-block hover:text-white">Registrar invitados</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel Derecho: Previsualización */}
        <div className="relative transition-all duration-700 lg:col-span-8">
          {(tabActiva === 'PREMIUM' || (tabActiva === 'ENVIAR' && tipoInvitacion === 'PREMIUM')) ? (
            <div className="sticky top-8 flex justify-center">
              {/* Mobile Phone Mockup */}
              <div className="relative w-[320px] h-[640px] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10 [container-type:inline-size]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />
                
                {/* Screen Content */}
                <div className="h-full w-full overflow-y-auto no-scrollbar bg-black text-white">
                   <div className="scale-[1] origin-top h-full w-full">
                      <PremiumInvitationView 
                        isPreview={true}
                        evento={{
                          ...evento,
                          invitacion: {
                            ...(evento.invitacion || {}),
                            configWeb: configWeb
                          }
                        }}
                        invitado={evento.invitados?.[0]}
                        status="IDLE"
                        onRSVP={() => {}}
                      />
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-8 flex justify-center">
               <div className="relative group">
                 <div className="absolute -inset-10 bg-[var(--color-primario)]/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-[var(--color-primario)]/10 transition-all duration-1000" />
                 <div ref={canvasRef} id="invitation-canvas-root" className="shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden transition-all duration-500 scale-95 hover:scale-100">
                    <InvitationCanvas 
                      estilos={estilos} 
                      texto={texto} 
                      fondoUrlActivo={fondoUrlActivo} 
                      isEditing={tabActiva === 'BASIC'} 
                      onEstiloChange={(id, val) => setEstilos({...estilos, [id]: val})} 
                      evento={evento}
                      archivoAdjuntoPropio={archivoAdjuntoBase64}
                      modoPropia={modoPropia}
                      config={configWeb}
                      onRSVPClick={() => alert('Esto abrirá el formulario RSVP para tu invitado')}
                    />
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
