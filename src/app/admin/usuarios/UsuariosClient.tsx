'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Store, 
  Check, 
  X, 
  Loader2,
  Lock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateUserAdmin, toggleUserStatus, deleteUserAdmin, updateUserPasswordAdmin } from '@/lib/actions/adminActions';
import { MEXICO_LOCATIONS } from '@/lib/constants/locations';

interface UsuariosClientProps {
  initialUsers: any[];
}

export default function UsuariosClient({ initialUsers }: UsuariosClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form State for editing
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: '',
    plan: '',
    estado: '',
    ciudad: '',
    categoria: '',
    newPassword: '' // Nueva contraseña opcional
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre || '',
      email: user.email || '',
      rol: user.rol || '',
      plan: user.rol === 'PROVEEDOR' ? (user.proveedor?.plan || '') : (user.cliente?.plan || ''),
      estado: user.rol === 'PROVEEDOR' ? (user.proveedor?.estado || '') : (user.cliente?.estado || ''),
      ciudad: user.rol === 'PROVEEDOR' ? (user.proveedor?.ciudad || '') : (user.cliente?.ciudad || ''),
      categoria: user.rol === 'PROVEEDOR' ? (user.proveedor?.categoria || '') : '',
      newPassword: ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateUserAdmin(selectedUser.id, formData);
    
    // Si se ingreso una nueva contraseña, actualizarla también
    if (res.success && formData.newPassword.trim() !== '') {
      const passRes = await updateUserPasswordAdmin(selectedUser.id, formData.newPassword.trim());
      if (!passRes.success) {
        alert("Usuario actualizado pero falló el cambio de contraseña: " + passRes.error);
      }
    }

    if (res.success) {
      // Update local state
      setUsers(users.map(u => u.id === selectedUser.id ? { 
        ...u, 
        ...formData,
        proveedor: u.rol === 'PROVEEDOR' ? { ...u.proveedor, ...formData } : u.proveedor,
        cliente: u.rol === 'CLIENTE' ? { ...u.cliente, ...formData } : u.cliente
      } : u));
      setIsEditModalOpen(false);
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${user.nombre}? Esta acción no se puede deshacer.`)) return;
    if (!confirm(`CONFIRMACIÓN FINAL: Se eliminarán todos los datos asociados (eventos, servicios, etc) del usuario ${user.email}. ¿Continuar?`)) return;

    setLoading(true);
    const res = await deleteUserAdmin(user.id);
    if (res.success) {
      setUsers(users.filter(u => u.id !== user.id));
      alert("Usuario eliminado correctamente.");
    } else {
      alert("Error al eliminar: " + res.error);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (user: any) => {
    const currentStatus = user.rol === 'PROVEEDOR' ? (user.proveedor?.activo ?? true) : true;
    const res = await toggleUserStatus(user.id, currentStatus);
    if (res.success) {
      setUsers(users.map(u => u.id === user.id ? { 
        ...u, 
        proveedor: u.rol === 'PROVEEDOR' ? { ...u.proveedor, activo: !currentStatus } : u.proveedor 
      } : u));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37] mb-1">Administración</p>
           <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--color-texto)]">Usuarios de Sistema</h1>
           <p className="text-[var(--color-texto-suave)] text-sm">Control total de cuentas y permisos</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] group-focus-within:text-[#d4af37] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                className="bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-full pl-12 pr-6 py-3 text-sm text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4">
              <Filter size={16} className="text-[#d4af37]" />
              <select 
                className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-[var(--color-texto)] outline-none py-3 pr-2 cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL" className="bg-[#111]">Todos los Roles</option>
                <option value="CLIENTE" className="bg-[#111]">Clientes</option>
                <option value="PROVEEDOR" className="bg-[#111]">Proveedores</option>
                <option value="ADMIN" className="bg-[#111]">Administradores</option>
              </select>
           </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden !p-0 border-white/5 shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Información de Usuario</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Estado / Ubicación</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Plan / Rol</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] text-right">Acciones</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => {
                    const isActive = user.rol === 'PROVEEDOR' ? (user.proveedor?.activo ?? true) : true;
                    const location = user.rol === 'PROVEEDOR' ? `${user.proveedor?.ciudad || ''}, ${user.proveedor?.estado || ''}` : `${user.cliente?.ciudad || ''}, ${user.cliente?.estado || ''}`;
                    const plan = user.rol === 'PROVEEDOR' ? (user.proveedor?.plan || 'N/A') : (user.cliente?.plan || 'N/A');

                    return (
                      <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                                user.rol === 'ADMIN' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                user.rol === 'PROVEEDOR' ? "bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]" :
                                "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              )}>
                                 {user.rol === 'ADMIN' ? <ShieldCheck size={24} /> : 
                                  user.rol === 'PROVEEDOR' ? <Store size={24} /> : 
                                  <UserIcon size={24} />}
                              </div>
                              <div>
                                 <p className="text-[var(--color-texto)] font-bold text-lg tracking-tight group-hover:text-[#d4af37] transition-colors">{user.nombre}</p>
                                 <p className="text-[10px] font-medium text-[var(--color-texto-muted)] tracking-widest">{user.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                 <span className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-rose-400")} />
                                 <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-emerald-400" : "text-rose-400")}>
                                    {isActive ? 'Activo' : 'Suspendido'}
                                 </span>
                              </div>
                              <p className="text-xs text-[var(--color-texto-muted)] font-medium italic">{location === ', ' ? 'Sin ubicación definida' : location}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1.5 text-center sm:text-left">
                              <span className={cn(
                                "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                user.rol === 'ADMIN' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                user.rol === 'PROVEEDOR' ? "bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]" :
                                "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              )}>
                                 {user.rol}
                              </span>
                              <p className="text-xs font-black text-[var(--color-texto)] px-1 tracking-tighter">PLAN {plan}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditClick(user)}
                                className="p-3 rounded-xl bg-white/5 border border-white/5 text-[var(--color-texto-muted)] hover:text-white hover:bg-white/10 transition-all"
                                title="Editar Datos y Contraseña"
                              >
                                 <Edit size={18} />
                              </button>
                              {user.rol !== 'ADMIN' && (
                                <button 
                                  onClick={() => handleToggleStatus(user)}
                                  className={cn(
                                    "p-3 rounded-xl border transition-all",
                                    isActive ? "bg-rose-500/10 border-rose-500/10 text-rose-400 hover:bg-rose-500/20" : "bg-emerald-500/10 border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  )}
                                  title={isActive ? 'Suspender Proveedor' : 'Reactivar Proveedor'}
                                >
                                   {isActive ? <Lock size={18} /> : <ShieldCheck size={18} />}
                                </button>
                              )}
                              {user.rol !== 'ADMIN' && (
                               <button 
                                 onClick={() => handleDeleteUser(user)}
                                 className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                                 title="Eliminar Usuario Permanentemente"
                               >
                                  <Trash2 size={18} />
                               </button>
                              )}
                           </div>
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
         {filteredUsers.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-[var(--color-texto-muted)]">
                  <Search size={32} />
               </div>
               <p className="text-[var(--color-texto-suave)] font-medium">No se encontraron usuarios que coincidan con la búsqueda.</p>
            </div>
         )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#111] border border-[#d4af37]/20 max-w-2xl w-full p-10 space-y-8 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              
              <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--color-texto)]">Editar Perfil de Usuario</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] mt-1">Control de Administrador</p>
                 </div>
                 <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-[var(--color-texto-muted)] transition-colors"><X size={28} /></button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Nombre Completo</label>
                       <input 
                         type="text" 
                         value={formData.nombre}
                         onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                         className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-4 text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all"
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Correo Electrónico</label>
                       <input 
                         type="email" 
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-4 text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all"
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Rol de Sistema</label>
                       <select 
                         value={formData.rol}
                         onChange={(e) => setFormData({...formData, rol: e.target.value})}
                         className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-4 text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all cursor-pointer"
                       >
                          <option value="CLIENTE" className="bg-[#111]">CLIENTE</option>
                          <option value="PROVEEDOR" className="bg-[#111]">PROVEEDOR</option>
                          <option value="ADMIN" className="bg-[#111]">ADMIN</option>
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Plan de Suscripción</label>
                       <select 
                         value={formData.plan}
                         onChange={(e) => setFormData({...formData, plan: e.target.value})}
                         className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-4 text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all cursor-pointer"
                       >
                          {formData.rol === 'PROVEEDOR' ? (
                            <>
                              <option value="GRATIS" className="bg-[#111]">GRATIS</option>
                              <option value="INTERMEDIO" className="bg-[#111]">INTERMEDIO</option>
                              <option value="PREMIUM" className="bg-[#111]">PREMIUM</option>
                              <option value="ELITE" className="bg-[#111]">ELITE</option>
                            </>
                          ) : (
                            <>
                              <option value="FREE" className="bg-[#111]">FREE</option>
                              <option value="ORO" className="bg-[#111]">ORO</option>
                              <option value="PLANNER" className="bg-[#111]">PLANNER</option>
                            </>
                          )}
                       </select>
                    </div>

                    {formData.rol === 'PROVEEDOR' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Categoría</label>
                        <select 
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-4 text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all cursor-pointer"
                        >
                           <option value="SALON" className="bg-[#111]">SALÓN</option>
                           <option value="MUSICA" className="bg-[#111]">MÚSICA</option>
                           <option value="COMIDA" className="bg-[#111]">BANQUETES</option>
                           <option value="ANIMACION" className="bg-[#111]">ANIMACIÓN</option>
                           <option value="FOTOGRAFIA" className="bg-[#111]">FOTO & VIDEO</option>
                           <option value="DECORACION" className="bg-[#111]">DECORACIÓN</option>
                           <option value="RECUERDOS" className="bg-[#111]">RECUERDOS</option>
                           <option value="MOBILIARIO" className="bg-[#111]">INMOBILIARIO</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Estado</label>
                       <select 
                         value={formData.estado}
                         onChange={(e) => setFormData({...formData, estado: e.target.value, ciudad: ''})}
                         className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-4 text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all cursor-pointer"
                       >
                          <option value="" className="bg-[#111]">Seleccionar estado...</option>
                          {Object.keys(MEXICO_LOCATIONS).sort().map(estado => (
                            <option key={estado} value={estado} className="bg-[#111]">{estado}</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Ciudad / Municipio</label>
                       <select 
                         value={formData.ciudad}
                         onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                         className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-4 text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all cursor-pointer disabled:opacity-50"
                         disabled={!formData.estado}
                       >
                          <option value="" className="bg-[#111]">Seleccionar ciudad...</option>
                          {formData.estado && MEXICO_LOCATIONS[formData.estado]?.map(ciudad => (
                            <option key={ciudad} value={ciudad} className="bg-[#111]">{ciudad}</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-1.5 md:col-span-2 pt-4 border-t border-white/5">
                        <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest ml-1">Forzar Nueva Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] group-focus-within:text-[#d4af37] transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Dejar en blanco para mantener actual..."
                                value={formData.newPassword}
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl pl-12 pr-5 py-4 text-[var(--color-texto)] outline-none focus:border-[#d4af37] transition-all"
                            />
                        </div>
                        <p className="text-[9px] text-[var(--color-texto-muted)] ml-1 italic">* El usuario deberá usar esta contraseña en su próximo inicio de sesión.</p>
                    </div>
                 </div>

                 <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl flex items-start gap-4">
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><AlertTriangle size={20} /></div>
                    <div>
                       <p className="text-xs font-black uppercase text-rose-400 tracking-widest mb-1">Zona de Peligro</p>
                       <p className="text-[11px] text-rose-400/70 font-medium">Cualquier cambio realizado aquí afectará directamente el acceso y privilegios del usuario en la plataforma de forma inmediata.</p>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4 border-t border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)] hover:text-white transition-colors"
                      disabled={loading}
                    >
                      Descartar
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-white text-black py-4 rounded-[2rem] font-black uppercase italic text-sm shadow-xl hover:bg-[#d4af37] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} strokeWidth={3} /> Guardar Cambios</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
