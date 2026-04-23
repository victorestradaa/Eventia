'use client';

import { 
  User, 
  Settings, 
  Bell, 
  CreditCard, 
  Calendar, 
  Star, 
  ChevronRight, 
  LogOut, 
  Edit,
  Camera,
  Heart,
  Wallet,
  X,
  Loader2,
  MapPin,
  Phone,
  Check
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { cerrarSesion, actualizarPassword } from '@/lib/actions/authActions';
import { updateClientProfile } from '@/lib/actions/settingsActions';
import { uploadAvatar } from '@/lib/actions/uploadActions';
import { MEXICO_LOCATIONS } from '@/lib/constants/locations';

interface PerfilClientProps {
  perfil: any;
  conteoEventos: number;
}

export default function PerfilClient({ perfil, conteoEventos }: PerfilClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isMyDataModalOpen, setIsMyDataModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    nombre: perfil.nombre || '',
    telefono: perfil.telefono || '',
    estado: perfil.cliente?.estado || '',
    ciudad: perfil.cliente?.ciudad || '',
  });

  const [avatarUrl, setAvatarUrl] = useState(perfil.avatarUrl || '');

  const user = {
    nombre: perfil.nombre || 'Usuario',
    email: perfil.email,
    avatar: avatarUrl,
    miembroDesde: perfil.creadoEn ? new Date(perfil.creadoEn).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : '—',
    eventos: conteoEventos,
    favoritos: 0,
    pagoPendiente: 0
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const { createClient } = await import('@/lib/supabase/cliente');
      const supabase = createClient();
      await supabase.auth.signOut();
      await cerrarSesion();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      window.location.href = '/login';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateClientProfile(perfil.id, {
      ...formData,
      avatarUrl
    });
    if (res.success) {
      setIsEditModalOpen(false);
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setPasswordLoading(true);
    const res = await actualizarPassword(passwordData.newPassword);
    if (res.success) {
      setIsSecurityModalOpen(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      alert('Contraseña actualizada correctamente');
    } else {
      alert(res.error);
    }
    setPasswordLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fData = new FormData();
    fData.append('file', file);
    fData.append('usuarioId', perfil.id);

    const res = await uploadAvatar(fData);
    if (res.success && res.url) {
      setAvatarUrl(res.url);
      // Auto-save the avatar change
      await updateClientProfile(perfil.id, {
        ...formData,
        avatarUrl: res.url
      });
      router.refresh();
    } else {
      alert(res.error || 'Error al subir la imagen');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 rounded-3xl bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#0a0a0a] border border-[#d4af37]/20 shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
           <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        </div>
        
        <div className="px-8 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="relative group">
               <div className="w-32 h-32 rounded-full border-4 border-[#111] bg-[#1a1a1a] flex items-center justify-center overflow-hidden shadow-2xl relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#d4af37]/10 text-[#d4af37]">
                      <User size={64} />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="animate-spin text-[#d4af37]" />
                    </div>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Camera className="text-white" />
                  </button>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleFileChange} 
               />
            </div>
            <div className="pb-2">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">{user.nombre}</h1>
                  <span className="px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[10px] font-black text-[#d4af37] uppercase tracking-widest">Plan {perfil.cliente?.plan}</span>
               </div>
               <p className="text-[var(--color-texto-suave)] text-sm font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Miembro desde {user.miembroDesde}
               </p>
            </div>
          </div>
          <div className="flex gap-4 pb-2">
             <button 
               onClick={() => setIsEditModalOpen(true)}
               className="btn bg-[#d4af37] text-black hover:bg-[#b89547] border-none gap-2 py-3 px-8 shadow-xl shadow-[#d4af37]/10 font-bold"
             >
               <Edit size={16}/> Editar Datos
             </button>
             <button className="btn bg-white/5 border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
               <Settings size={20} className="text-white" />
             </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: 'Eventos Creados', value: user.eventos, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
           { label: 'Proveedores Favoritos', value: user.favoritos, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
           { label: 'Saldo Pendiente', value: `$${user.pagoPendiente.toLocaleString()}`, icon: Wallet, color: 'text-[#d4af37]', bg: 'bg-[#d4af37]/10' },
           { label: 'Valoraciones dadas', value: 0, icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
         ].map((stat, i) => (
           <div key={i} className="card p-8 flex flex-col items-center justify-center text-center space-y-3 hover:translate-y-[-4px] transition-all">
              <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                 <stat.icon size={28} />
              </div>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <p className="text-[10px] uppercase font-bold text-[var(--color-texto-muted)] tracking-[0.2em]">{stat.label}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Menu */}
        <div className="space-y-4">
           <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#d4af37] ml-2">Gestión de Perfil</h3>
           <div className="card p-3 space-y-1">
              {[
                { 
                  label: 'Mis Datos', 
                  icon: User, 
                  onClick: () => setIsMyDataModalOpen(true) 
                },
                { 
                  label: 'Métodos de Pago', 
                  icon: CreditCard, 
                  href: '#' 
                },
                { 
                  label: 'Seguridad y Privacidad', 
                  icon: Settings, 
                  onClick: () => setIsSecurityModalOpen(true) 
                },
              ].map((item, i) => (
                item.href ? (
                  <Link key={i} href={item.href} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--color-texto-suave)] group-hover:text-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all">
                          <item.icon size={20} />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-white group-hover:translate-x-1 transition-transform">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--color-texto-muted)] group-hover:text-white transition-colors" />
                  </Link>
                ) : (
                  <button key={i} onClick={item.onClick} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--color-texto-suave)] group-hover:text-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all">
                          <item.icon size={20} />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-white group-hover:translate-x-1 transition-transform">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--color-texto-muted)] group-hover:text-white transition-colors" />
                  </button>
                )
              ))}
              <hr className="border-white/5 my-4 mx-2" />
              <button 
                type="button" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-400 hover:bg-rose-400/10 transition-all text-left disabled:opacity-50 group"
              >
                  <div className="w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isLoggingOut ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
                  </div>
                  <span className="font-bold text-sm tracking-tight uppercase">
                    {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
                  </span>
              </button>
           </div>
        </div>

        {/* Right Column: Support / Info */}
        <div className="lg:col-span-2 space-y-8">
           <div className="card p-10 bg-gradient-to-br from-[#111] to-[#0a0a0a] border-[#d4af37]/30 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="text-center md:text-left">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Próximo Gran Evento</h3>
                    <p className="text-[var(--color-texto-suave)] text-sm mt-3 max-w-sm leading-relaxed">Configura tus preferencias para recibir recomendaciones personalizadas de nuestros proveedores élite.</p>
                 </div>
                 <Link href="/cliente/dashboard" className="btn bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-[#d4af37] transition-all shadow-2xl uppercase tracking-widest text-xs">Ir al Dashboard</Link>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-8 border-white/5 hover:border-[#d4af37]/20 transition-colors">
                 <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#d4af37] mb-4">Ubicación Actual</h4>
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><MapPin size={24} /></div>
                    <div>
                       <p className="text-white font-bold">{perfil.cliente?.ciudad || 'No definida'}</p>
                       <p className="text-[10px] uppercase font-bold text-[var(--color-texto-muted)]">{perfil.cliente?.estado || 'No definido'}</p>
                    </div>
                 </div>
              </div>
              <div className="card p-8 border-white/5 hover:border-[#d4af37]/20 transition-colors">
                 <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#d4af37] mb-4">Contacto</h4>
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Phone size={24} /></div>
                    <div>
                       <p className="text-white font-bold">{user.email}</p>
                       <p className="text-[10px] uppercase font-bold text-[var(--color-texto-muted)]">{perfil.telefono || 'Sin teléfono'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#111] border border-[#d4af37]/20 max-w-lg w-full p-10 space-y-8 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              
              <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Editar Perfil</h2>
                    <p className="text-[var(--color-texto-suave)] text-xs font-bold uppercase tracking-widest mt-1">Información Personal</p>
                 </div>
                 <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-[var(--color-texto-muted)] transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div className="space-y-5">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Nombre Completo</label>
                       <input 
                         type="text" 
                         value={formData.nombre}
                         onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-[#d4af37] transition-all"
                         placeholder="Tu nombre completo"
                         required
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Teléfono / Celular</label>
                       <input 
                         type="tel" 
                         value={formData.telefono}
                         onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-[#d4af37] transition-all"
                         placeholder="Número de contacto"
                         required
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Estado</label>
                          <select 
                            value={formData.estado}
                            onChange={(e) => {
                              const nuevoEstado = e.target.value;
                              setFormData({
                                ...formData, 
                                estado: nuevoEstado,
                                ciudad: MEXICO_LOCATIONS[nuevoEstado]?.[0] || ''
                              });
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-[#d4af37] transition-all text-sm appearance-none"
                            required
                          >
                            <option value="" disabled className="bg-[#111]">Selecciona un estado</option>
                            {Object.keys(MEXICO_LOCATIONS).sort().map(estado => (
                              <option key={estado} value={estado} className="bg-[#111]">{estado}</option>
                            ))}
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Ciudad</label>
                          <select 
                            value={formData.ciudad}
                            onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-[#d4af37] transition-all text-sm appearance-none"
                            required
                            disabled={!formData.estado}
                          >
                            <option value="" disabled className="bg-[#111]">Selecciona una ciudad</option>
                            {formData.estado && MEXICO_LOCATIONS[formData.estado]?.map(ciudad => (
                              <option key={ciudad} value={ciudad} className="bg-[#111]">{ciudad}</option>
                            ))}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)] hover:text-white transition-colors"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase italic text-sm shadow-xl shadow-[#d4af37]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} strokeWidth={3} /> Guardar Cambios</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Security / Password Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#111] border border-[#d4af37]/20 max-w-lg w-full p-10 space-y-8 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              
              <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Seguridad</h2>
                    <p className="text-[var(--color-texto-suave)] text-xs font-bold uppercase tracking-widest mt-1">Cambiar Contraseña</p>
                 </div>
                 <button onClick={() => setIsSecurityModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-[var(--color-texto-muted)] transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                 <div className="space-y-5">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Nueva Contraseña</label>
                       <input 
                         type="password" 
                         value={passwordData.newPassword}
                         onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-[#d4af37] transition-all"
                         placeholder="Mínimo 6 caracteres"
                         required
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Confirmar Contraseña</label>
                       <input 
                         type="password" 
                         value={passwordData.confirmPassword}
                         onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-[#d4af37] transition-all"
                         placeholder="Repite la contraseña"
                         required
                       />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsSecurityModalOpen(false)}
                      className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)] hover:text-white transition-colors"
                      disabled={passwordLoading}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={passwordLoading}
                      className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase italic text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {passwordLoading ? <Loader2 className="animate-spin" size={20} /> : 'Actualizar'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Mis Datos Modal */}
      {isMyDataModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#111] border border-[#d4af37]/20 max-w-lg w-full p-10 space-y-8 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Mis Datos</h2>
                    <p className="text-[var(--color-texto-suave)] text-xs font-bold uppercase tracking-widest mt-1">Información de Contacto</p>
                 </div>
                 <button onClick={() => setIsMyDataModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-[var(--color-texto-muted)] transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                       <div className="p-3 bg-[#d4af37]/10 text-[#d4af37] rounded-xl"><User size={20} /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest">Nombre</p>
                          <p className="text-white font-bold">{user.nombre}</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                       <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Settings size={20} /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Email</p>
                          <p className="text-white font-bold">{user.email}</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                       <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Phone size={20} /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Teléfono</p>
                          <p className="text-white font-bold">{perfil.telefono || 'Sin teléfono'}</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                       <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><MapPin size={20} /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Ubicación</p>
                          <p className="text-white font-bold">{perfil.cliente?.ciudad}, {perfil.cliente?.estado}</p>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => {
                     setIsMyDataModalOpen(false);
                     setIsEditModalOpen(true);
                   }}
                   className="w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase italic text-sm shadow-xl hover:scale-[1.01] transition-all"
                 >
                   Editar Información
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
