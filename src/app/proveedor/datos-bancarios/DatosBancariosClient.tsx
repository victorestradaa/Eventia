'use client';

import { useState } from 'react';
import { Landmark, Plus, Trash2, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { createCuentaBancaria, deleteCuentaBancaria, setCuentaPrincipal } from '@/lib/actions/bancosActions';

// Lista de bancos en México
const BANCOS_MX = [
  'BBVA', 'Santander', 'Banamex', 'Banorte', 'HSBC', 'Scotiabank', 'Inbursa', 
  'Banco Azteca', 'Bancoppel', 'Hey Banco', 'Nu', 'Otro'
];

interface CuentaBancaria {
  id: string;
  banco: string;
  tipo: string;
  numero: string;
  titular: string;
  esPrincipal: boolean;
}

export default function DatosBancariosClient({ cuentasIniciales }: { cuentasIniciales: CuentaBancaria[] }) {
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>(cuentasIniciales);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    banco: '',
    tipo: 'CLABE',
    numero: '',
    titular: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.banco || !formData.numero || !formData.titular) {
      setError('Por favor llena todos los campos');
      return;
    }

    if (formData.tipo === 'CLABE' && formData.numero.length !== 18) {
      setError('La CLABE debe tener 18 dígitos');
      return;
    }
    
    if (formData.tipo === 'TARJETA' && formData.numero.length !== 16) {
      setError('La tarjeta debe tener 16 dígitos');
      return;
    }

    setIsLoading(true);
    const res = await createCuentaBancaria(formData);
    
    if (res.success && res.data) {
      setCuentas([res.data, ...cuentas.map(c => res.data.esPrincipal ? {...c, esPrincipal: false} : c)]);
      setIsModalOpen(false);
      setFormData({ banco: '', tipo: 'CLABE', numero: '', titular: '' });
    } else {
      setError(res.error || 'Error al guardar la cuenta');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta?')) return;
    
    const res = await deleteCuentaBancaria(id);
    if (res.success) {
      setCuentas(cuentas.filter(c => c.id !== id));
      // Reload is simulated since Next's revalidatePath updates server components but we have state
      const updatedList = cuentas.filter(c => c.id !== id);
      if (updatedList.length > 0 && !updatedList.some(c => c.esPrincipal)) {
        updatedList[0].esPrincipal = true;
      }
      setCuentas(updatedList);
    } else {
      alert(res.error || 'Error al eliminar');
    }
  };

  const handleSetPrincipal = async (id: string) => {
    const res = await setCuentaPrincipal(id);
    if (res.success) {
      setCuentas(cuentas.map(c => ({ ...c, esPrincipal: c.id === id })));
    } else {
      alert(res.error || 'Error al actualizar');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
             <Landmark className="text-[var(--color-primario-claro)]" size={32} />
             Datos Bancarios
          </h1>
          <p className="text-[var(--color-texto-suave)] mt-2">
            Administra tus cuentas donde recibirás los pagos de tus reservas.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primario flex items-center gap-2 font-bold"
        >
          <Plus size={18} /> Agregar Cuenta
        </button>
      </div>

      {cuentas.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-2 border-white/10">
           <Landmark size={48} className="mx-auto text-[var(--color-texto-muted)] mb-4" />
           <h3 className="text-xl font-bold mb-2">No tienes cuentas registradas</h3>
           <p className="text-[var(--color-texto-suave)] max-w-md mx-auto mb-6">
             Agrega al menos una cuenta bancaria para que los clientes sepan dónde realizar los abonos o liquidaciones de tus servicios.
           </p>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secundario inline-flex items-center gap-2"
           >
             <Plus size={18} /> Registrar mi primera cuenta
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cuentas.map(cuenta => (
            <div 
              key={cuenta.id} 
              className={`card relative overflow-hidden transition-all border-2 ${
                cuenta.esPrincipal 
                  ? 'border-[var(--color-primario-claro)]/50 shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
                  : 'border-transparent hover:border-white/10'
              }`}
            >
              {cuenta.esPrincipal && (
                <div className="absolute top-0 right-0 bg-[var(--color-primario-claro)] text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Principal
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-primario-claro)]">
                     <Landmark size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{cuenta.banco}</h3>
                    <p className="text-[10px] text-[var(--color-texto-muted)] font-black uppercase tracking-widest">{cuenta.tipo}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[var(--color-fondo-input)] p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1">Número de {cuenta.tipo}</p>
                  <p className="font-mono text-lg tracking-widest text-emerald-400">{cuenta.numero.match(/.{1,4}/g)?.join(' ') || cuenta.numero}</p>
                </div>
                
                <div>
                  <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1">Titular de la cuenta</p>
                  <p className="font-bold uppercase text-sm">{cuenta.titular}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                {!cuenta.esPrincipal && (
                  <button 
                    onClick={() => handleSetPrincipal(cuenta.id)}
                    className="flex-1 btn btn-secundario py-2 text-xs border-dashed"
                  >
                    Hacer Principal
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(cuenta.id)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-auto border border-transparent hover:border-rose-500/20"
                  title="Eliminar cuenta"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Agregar Cuenta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-fondo-card)] border border-white/10 p-8 rounded-2xl w-full max-w-md animate-in zoom-in-95 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="text-[var(--color-primario-claro)]" /> Nueva Cuenta
            </h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-2">Banco</label>
                <select 
                  className="input w-full bg-[var(--color-fondo-input)]"
                  value={formData.banco}
                  onChange={e => setFormData({...formData, banco: e.target.value})}
                  required
                >
                  <option value="">Selecciona un banco</option>
                  {BANCOS_MX.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-2">Tipo de Datos</label>
                <select 
                  className="input w-full bg-[var(--color-fondo-input)]"
                  value={formData.tipo}
                  onChange={e => {
                    setFormData({...formData, tipo: e.target.value, numero: ''});
                  }}
                >
                  <option value="CLABE">CLABE Interbancaria (18 dígitos)</option>
                  <option value="TARJETA">Número de Tarjeta (16 dígitos)</option>
                  <option value="CUENTA">Número de Cuenta</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-2">
                  {formData.tipo === 'CLABE' ? 'CLABE' : formData.tipo === 'TARJETA' ? 'Número de Tarjeta' : 'Número de Cuenta'}
                </label>
                <input 
                  type="text"
                  className="input w-full bg-[var(--color-fondo-input)] font-mono text-emerald-400 placeholder:text-emerald-900/50"
                  placeholder={formData.tipo === 'CLABE' ? '000000000000000000' : formData.tipo === 'TARJETA' ? '0000000000000000' : '0000000000'}
                  value={formData.numero}
                  onChange={e => setFormData({...formData, numero: e.target.value.replace(/\D/g, '')})}
                  maxLength={formData.tipo === 'CLABE' ? 18 : formData.tipo === 'TARJETA' ? 16 : 20}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-2">Nombre del Titular</label>
                <input 
                  type="text"
                  className="input w-full bg-[var(--color-fondo-input)] uppercase"
                  placeholder="JUAN PEREZ GARCIA"
                  value={formData.titular}
                  onChange={e => setFormData({...formData, titular: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secundario border-dashed"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primario disabled:opacity-50 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : <><Plus size={16} /> Guardar Cuenta</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
