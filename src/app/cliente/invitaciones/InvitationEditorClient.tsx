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
  FileDown
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

interface InvitationEditorClientProps {
  evento: any;
  fondos?: any[];
  fuentes?: any[];
}

export default function InvitationEditorClient({ evento, fondos = [], fuentes = [] }: InvitationEditorClientProps) {
  const router = useRouter();
  
  // Pestañas
  const [tabActiva, setTabActiva] = useState<'BASIC' | 'PREMIUM' | 'ENVIAR'>('BASIC');
  
  // Estado para la invitación Premium
  const [configWeb, setConfigWeb] = useState<any>(evento?.invitacion?.configWeb || {
    coverUrl: '',
    tema: 'dark',
    mostrarContador: true,
    mostrarCeremonia: true,
    mostrarDressCode: true,
    mostrarCelebracion: true,
    mostrarGaleria: true,
    mostrarMapa: true,
    mostrarRegalos: true,
    mostrarRSVP: true,
    mostrarAlbumQR: false,
    fechaEventoExacta: evento.fecha || '',
    ceremoniaNombre: '',
    ceremoniaFecha: evento.fecha || '',
    ceremoniaDireccion: '',
    ceremoniaMapsUrl: '',
    ceremoniaBgColor: '#fafafa',
    ceremoniaTextColor: '#8b7355',
    dressCodeTexto: 'Formal / Gala',
    dressCodeColor: '#333333',
    celebracionNombre: 'Recepción',
    celebracionFecha: evento.fecha || '',
    celebracionDireccion: '',
    celebracionMapsUrl: '',
    celebracionTextColor: '#8b7355',
    galeriaFotos: [],
    galeriaEfecto: 'slide',
  });
  
  // Modos de editor
  const [modoPropia, setModoPropia] = useState(evento?.invitacion?.isInvitacionPropia || false);
  const [archivoAdjuntoBase64, setArchivoAdjuntoBase64] = useState<string | null>(evento?.invitacion?.archivoAdjunto || null);
  const [fondoUrlActivo, setFondoUrlActivo] = useState(evento?.invitacion?.fondoUrl || '');

  const getInitialEstilos = () => {
    const defCol = evento?.invitacion?.colorTexto && !evento.invitacion.colorTexto.startsWith('{') 
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


  if (!evento) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="p-6 rounded-full bg-amber-500/10 text-amber-500">
          <CalendarIcon size={64} />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold">No tienes eventos activos</h2>
          <p className="text-[var(--color-texto-suave)] mt-2">
            Primero debes crear un evento antes de poder diseñar tu invitación digital.
          </p>
        </div>
        <Link href="/cliente/dashboard">
          <button className="btn btn-primario">Ir al Dashboard</button>
        </Link>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setArchivoAdjuntoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        eventoId: evento.id,
        isInvitacionPropia: modoPropia,
        archivoAdjunto: modoPropia ? archivoAdjuntoBase64 : null,
        plantilla: 'custom', 
        fondoUrl: fondoUrlActivo,
        colorTexto: JSON.stringify(estilos),
        titulo: texto.titulo,
        mensaje: texto.mensaje,
        lugarTexto: texto.lugar,
        vestimenta: texto.vestimenta,
        configWeb: {
          ...configWeb,
          tipoInvitacion: tabActiva === 'BASIC' ? 'BASICA' : 'PREMIUM',
          direccion: texto.direccion,
          regaloTipo: texto.regaloTipo,
          regaloMesaUrl: texto.regaloMesaUrl,
          regaloBanco: texto.regaloBanco,
          regaloClabe: texto.regaloClabe,
        }
      };

      const res = await fetch('/api/invitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al guardar la invitación');
      alert('Invitación guardada exitosamente');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
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
    const styleId = parentStyleId || id;
    const estilo = estilos[styleId] || { visible: true };

    return (
    <div className={cn(
      "group relative bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[var(--radio-xl)] p-6 transition-all duration-500 hover:border-[var(--color-borde)] hover:shadow-2xl hover:shadow-black/5 mb-8", 
      !estilo.visible && "opacity-40 grayscale-[0.5]"
    )}>
      {/* Cabecera del Campo con Herramientas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl bg-[var(--color-fondo-input)] text-[var(--color-texto-muted)] transition-all duration-500 group-hover:bg-[var(--color-acento)]/10 group-hover:text-[var(--color-acento)]",
            estilo.visible && "text-[var(--color-texto-suave)]"
          )}>
            {id === 'titulo' && <Type size={18} />}
            {id === 'nombres' && <Users size={18} />}
            {id === 'mensaje' && <MessageCircle size={18} />}
            {id === 'lugar' && <MapPin size={18} />}
            {id === 'vestimenta' && <Sparkles size={18} />}
            {id === 'regaloMesaUrl' && <Gift size={18} />}
            {id === 'regaloBanco' && <CreditCard size={18} />}
            {id === 'regaloClabe' && <Copy size={18} />}
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--color-texto-suave)] group-hover:text-[var(--color-texto)] transition-colors">
            {label}
          </span>
        </div>

        {/* Toolbar de Formato (Dock de Alto Contraste) */}
        <div className="flex items-center gap-1.5 bg-zinc-800 p-1.5 rounded-2xl border border-white/10 shadow-2xl opacity-100 translate-y-0 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0 transition-all duration-300 scale-95 group-hover:scale-100 z-10">
           <button 
             onClick={() => toggleVisibility(styleId)}
             className={cn(
               "p-2 rounded-lg transition-all", 
               estilo.visible ? "text-white/40 hover:text-white hover:bg-white/10" : "text-[var(--color-acento-claro)] bg-white/10"
             )}
             title={estilo.visible ? "Ocultar" : "Mostrar"}
           >
             {estilo.visible ? <Eye size={15} /> : <EyeOff size={15} />}
           </button>
           
           <div className="w-px h-4 bg-white/10 mx-1" />
           
           <div className="relative group/color">
             <input 
               type="color" 
               value={estilo.color || '#ffffff'}
               onChange={(e) => setEstilos({...estilos, [styleId]: {...estilo, color: e.target.value}})}
               className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0 shadow-lg bg-transparent overflow-hidden hover:scale-110 transition-transform"
             />
           </div>

           <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1.5 border border-white/5 focus-within:border-white/20 transition-all">
              <span className="text-[8px] font-black text-white/40">PT</span>
              <input 
                type="number"
                value={estilo.fontSize || 16}
                onChange={(e) => setEstilos({...estilos, [styleId]: {...estilo, fontSize: Number(e.target.value)}})}
                className="w-10 text-[11px] bg-transparent outline-none text-white font-black text-center"
              />
           </div>

           <div className="relative">
             <select
               value={estilo.fuente || ''}
               onChange={(e) => setEstilos({...estilos, [styleId]: {...estilo, fuente: e.target.value}})}
               className="text-[10px] bg-white/5 border border-white/5 rounded-lg pl-3 pr-6 py-1.5 outline-none text-white/70 hover:text-white transition-colors max-w-[100px] font-bold appearance-none cursor-pointer"
             >
               <option value="" className="bg-[var(--color-primario)]">Fuente</option>
               {fuentes.map(f => <option key={f.id} value={f.nombre} className="bg-[var(--color-primario)] text-white py-2">{f.nombre}</option>)}
             </select>
             <Palette size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
           </div>
        </div>
      </div>

      <div className="relative group/input">
        {isTextarea ? (
          <textarea 
            className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] hover:border-[var(--color-borde)] rounded-2xl px-6 py-5 outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-fondo-card)] focus:ring-8 focus:ring-[var(--color-acento)]/5 transition-all duration-500 text-sm min-h-[120px] resize-none shadow-inner placeholder:text-[var(--color-texto-muted)]/70 leading-relaxed text-[var(--color-texto)]" 
            value={texto[id]}
            placeholder={`Escribe aquí ${label.toLowerCase()}...`}
            onChange={(e) => setTexto({...texto, [id]: e.target.value})}
          />
        ) : (
          <input 
            type="text" 
            className="w-full h-16 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] hover:border-[var(--color-borde)] rounded-2xl px-6 py-4 outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-fondo-card)] focus:ring-8 focus:ring-[var(--color-acento)]/5 transition-all duration-500 text-base shadow-inner placeholder:text-[var(--color-texto-muted)]/70 font-bold text-[var(--color-texto)]" 
            value={texto[id]} 
            placeholder={`Escribe aquí ${label.toLowerCase()}...`}
            onChange={(e) => setTexto({...texto, [id]: e.target.value})}
          />
        )}
        
        {/* Indicador visual de edición */}
        <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-acento)] animate-pulse shadow-[0_0_15px_var(--color-acento)]" />
        </div>
      </div>
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

  if (!evento) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/20">
          <CalendarIcon size={48} />
        </div>
        <div className="max-w-xs space-y-3">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">No hay eventos activos</h2>
          <p className="text-xs text-[var(--color-texto-muted)] font-medium leading-relaxed">
            Parece que aún no tienes eventos registrados. Crea tu primer evento para comenzar a diseñar tus invitaciones premium.
          </p>
        </div>
        <Link href="/cliente" className="btn btn-primario px-8 py-4 gap-3">
           <Sparkles size={18} /> Crear mi primer evento
        </Link>
      </div>
    );
  }

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
                onClick={handleSave} 
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

      <div className={cn(
        "grid grid-cols-1 gap-10 items-start transition-all duration-700",
        tabActiva === 'PREMIUM' ? "lg:grid-cols-2" : "lg:grid-cols-12"
      )}>
        {/* Panel Izquierdo: Controles */}
        <div className={cn(
          "space-y-6",
          tabActiva === 'PREMIUM' ? "lg:col-span-1" : "lg:col-span-4"
        )}>
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
                      </select>
                      <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar p-1">
                        {fondosFiltrados.map((f) => (
                          <button 
                            key={f.id}
                            onClick={() => setFondoUrlActivo(f.url)}
                            className={cn(
                              "relative rounded-xl border-2 transition-all duration-500 overflow-hidden aspect-[9/16] group/thumb shadow-md",
                              fondoUrlActivo === f.url 
                                ? "border-[var(--color-acento)] ring-4 ring-[var(--color-acento)]/10 scale-[0.98] shadow-2xl shadow-[var(--color-acento)]/20" 
                                : "border-[var(--color-borde-suave)] hover:border-[var(--color-acento)]/30 hover:scale-105"
                            )}
                          >
                            <img src={f.url} alt={f.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" />
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
                        <div className="flex justify-between items-center bg-zinc-800 p-4 rounded-2xl border border-white/10 group/mappin hover:shadow-2xl hover:shadow-black/20 transition-all">
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => toggleVisibility('mapPin')}
                                className={cn(
                                  "p-2.5 rounded-xl transition-all shadow-inner", 
                                  estilos.mapPin?.visible ? "bg-white/10 text-white/50 hover:text-white" : "bg-[var(--color-acento)]/20 text-[var(--color-acento-claro)]"
                                )}
                              >
                                {estilos.mapPin?.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                              </button>
                              <div className="space-y-0.5">
                                <label className="text-[10px] font-black uppercase text-white/80 tracking-[0.1em]">Icono Map-Pin</label>
                                <p className="text-[8px] text-white/30 font-bold uppercase">Movible y Redimensionable</p>
                              </div>
                            </div>
                            <div className="relative group/picker">
                              <input 
                                type="color" 
                                value={estilos.mapPin?.color || '#ffffff'}
                                onChange={(e) => setEstilos({...estilos, mapPin: {...estilos.mapPin, color: e.target.value}})}
                                className="h-10 w-10 rounded-xl cursor-pointer border-0 p-0 shadow-2xl bg-transparent overflow-hidden hover:scale-110 transition-transform"
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
                        <div className="flex justify-between items-center bg-[var(--color-primario)] p-4 rounded-2xl border border-white/10 group/regalos hover:shadow-2xl hover:shadow-black/20 transition-all">
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => toggleVisibility('regalos')}
                                className={cn(
                                  "p-2.5 rounded-xl transition-all shadow-inner", 
                                  estilos.regalos?.visible ? "bg-white/10 text-white/50 hover:text-white" : "bg-[var(--color-acento)]/20 text-[var(--color-acento-claro)]"
                                )}
                              >
                                {estilos.regalos?.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                              </button>
                              <div className="space-y-0.5">
                                <label className="text-[10px] font-black uppercase text-white/80 tracking-[0.1em]">Bloque Regalos</label>
                                <p className="text-[8px] text-white/30 font-bold uppercase">Movible y Redimensionable</p>
                              </div>
                            </div>
                            <div className="relative group/picker">
                              <input 
                                type="color" 
                                value={estilos.regalos?.color || '#ffffff'}
                                onChange={(e) => setEstilos({...estilos, regalos: {...estilos.regalos, color: e.target.value}})}
                                className="h-10 w-10 rounded-xl cursor-pointer border-0 p-0 shadow-2xl bg-transparent overflow-hidden hover:scale-110 transition-transform"
                              />
                            </div>
                        </div>
                      </div>

                      {renderCampo('vestimenta', 'Vestimenta')}
                    </div>
                    
                    {/* Sección RSVP Rediseñada */}
                    <div className="pt-6 border-t border-[var(--color-borde-suave)]">
                       <div className="flex justify-between items-center bg-[var(--color-primario)] p-4 rounded-2xl border border-white/10 group/rsvp hover:shadow-2xl hover:shadow-black/20 transition-all">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleVisibility('boton')}
                              className={cn(
                                "p-2.5 rounded-xl transition-all shadow-inner", 
                                estilos.boton?.visible ? "bg-white/10 text-white/50 hover:text-white" : "bg-[var(--color-acento)]/20 text-[var(--color-acento-claro)]"
                              )}
                            >
                              {estilos.boton?.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-black uppercase text-white/80 tracking-[0.1em]">Botón RSVP</label>
                              <p className="text-[8px] text-white/30 font-bold uppercase">Link de confirmación</p>
                            </div>
                          </div>
                          <div className="relative group/picker">
                            <input 
                              type="color" 
                              value={estilos.boton?.color || '#ffffff'}
                              onChange={(e) => setEstilos({...estilos, boton: {...estilos.boton, color: e.target.value}})}
                              className="h-10 w-10 rounded-xl cursor-pointer border-0 p-0 shadow-2xl bg-transparent overflow-hidden hover:scale-110 transition-transform"
                            />
                            <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-white border border-black shadow-[0_0_10px_white] animate-pulse pointer-events-none" />
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
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-black flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-[var(--color-texto)]">
                    <Users size={20} className="text-[var(--color-acento)]" /> Lista de Invitados
                  </h3>
                  <p className="text-[9px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest pl-8">Gestión de envíos personalizados</p>
                </div>
                <span className="px-4 py-1.5 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl text-[10px] font-black text-[var(--color-texto-muted)] shadow-inner">
                  {evento.invitados?.length || 0} Registrados
                </span>
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
        <div className={cn(
          "relative",
          tabActiva === 'PREMIUM' ? "lg:col-span-1" : "lg:col-span-8"
        )}>
          {tabActiva === 'PREMIUM' ? (
            <div className="sticky top-8 flex justify-center">
              {/* Mobile Phone Mockup */}
              <div className="relative w-[320px] h-[640px] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
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
