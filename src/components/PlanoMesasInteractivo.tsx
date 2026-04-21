'use client';

import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
// Importa tu Server Action (Ajusta la ruta si es diferente en tu proyecto)
// import { savePlanoMesas } from '@/lib/actions/eventActions';

// Tipos básicos para el ejemplo
type Modo = 'MOVER_CAMARA' | 'ASIGNAR_LUGAR';

export default function PlanoMesasInteractivo({ eventoId, invitadosIniciales, planoInicial }: any) {
    const [modo, setModo] = useState<Modo>('MOVER_CAMARA');
    const [invitadoSeleccionado, setInvitadoSeleccionado] = useState<string | null>(null);
    const [mesaDetalleAbierta, setMesaDetalleAbierta] = useState<string | null>(null);

    // Estado simulado de mesas (En tu app real esto viene de tu base de datos)
    const [mesas, setMesas] = useState([
        { id: '1', nombre: 'Mesa Principal', x: 200, y: 300, invitados: [] as string[] },
        { id: '2', nombre: 'Mesa 2', x: 500, y: 300, invitados: [] as string[] },
    ]);

    // Función de Tap-to-Move (Tocar para asignar)
    const handleMesaClick = async (mesaId: string) => {
        if (modo === 'ASIGNAR_LUGAR' && invitadoSeleccionado) {
            const nuevasMesas = mesas.map(mesa => {
                if (mesa.id === mesaId) {
                    return { ...mesa, invitados: [...mesa.invitados, invitadoSeleccionado] };
                }
                return mesa;
            });

            setMesas(nuevasMesas);
            setInvitadoSeleccionado(null);

            // 🚨 Llamada a la base de datos (Server Action)
            try {
                // await savePlanoMesas(eventoId, nuevasMesas);
                console.log('✅ Plano guardado automáticamente');
            } catch (error) {
                console.error('Error al guardar el plano en BD:', error);
            }
        } else if (modo === 'MOVER_CAMARA') {
            // Tocar una mesa en modo cámara abre el Bottom Sheet
            setMesaDetalleAbierta(mesaId);
        }
    };

    // Función para quitar a alguien desde el Bottom Sheet
    const handleQuitarInvitado = async (mesaId: string, nombreInvitado: string) => {
        const nuevasMesas = mesas.map(mesa => {
            if (mesa.id === mesaId) return { ...mesa, invitados: mesa.invitados.filter(inv => inv !== nombreInvitado) };
            return mesa;
        });
        setMesas(nuevasMesas);

        try {
            // await savePlanoMesas(eventoId, nuevasMesas);
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50">

            {/* --- PANEL DE CONTROLES SUPERIOR (Fijo en celular) --- */}
            <div className="p-4 bg-white shadow-md z-10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Organizador de Mesas</h2>

                    {/* Toggle para cambiar de modo */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            className={`px-4 py-2 rounded-md text-sm transition-all ${modo === 'MOVER_CAMARA' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}
                            onClick={() => setModo('MOVER_CAMARA')}
                        >
                            ✋ Mover
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm transition-all ${modo === 'ASIGNAR_LUGAR' ? 'bg-green-600 text-white shadow' : 'text-gray-600'}`}
                            onClick={() => setModo('ASIGNAR_LUGAR')}
                        >
                            🪑 Asignar
                        </button>
                    </div>
                </div>

                {/* Selector de Invitados (Solo se muestra en modo Asignar) */}
                {modo === 'ASIGNAR_LUGAR' && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex flex-col gap-2">
                        <label className="text-sm font-semibold text-green-800">
                            1. Selecciona un invitado y toca una mesa:
                        </label>
                        <select
                            className="w-full p-2 rounded border-gray-300"
                            value={invitadoSeleccionado || ''}
                            onChange={(e) => setInvitadoSeleccionado(e.target.value)}
                        >
                            <option value="" disabled>-- Elige un invitado --</option>
                            <option value="Juan Pérez">Juan Pérez</option>
                            <option value="María Gómez">María Gómez</option>
                        </select>
                    </div>
                )}
            </div>

            {/* --- ÁREA DEL PLANO (LIENZO) --- */}
            <div className="flex-1 relative overflow-hidden bg-gray-200 cursor-grab active:cursor-grabbing">
                {/* 
          TransformWrapper maneja el Zoom y el Panning en celular automáticamente.
          Deshabilitamos el "panning" (desplazamiento) si el usuario está en modo asignar, 
          para que los toques accidentales no muevan la cámara.
        */}
                <TransformWrapper
                    initialScale={1}
                    disabled={modo === 'ASIGNAR_LUGAR'}
                    wheel={{ step: 0.1 }}
                    pinch={{ step: 5 }}
                >
                    <TransformComponent wrapperClass="w-full h-full" contentClass="w-[2000px] h-[2000px] bg-white bg-[url('/grid-pattern.png')] border-2 border-gray-300">
                        {/* Aquí renderizamos las mesas de forma absoluta basándonos en sus coordenadas X, Y */}
                        {mesas.map((mesa) => (
                            <div
                                key={mesa.id}
                                onClick={() => handleMesaClick(mesa.id)}
                                className={`absolute w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-transform ${modo === 'ASIGNAR_LUGAR' && invitadoSeleccionado ? 'hover:scale-105 cursor-pointer border-green-500 bg-green-100' : 'border-gray-800 bg-gray-100'}`}
                                style={{ left: mesa.x, top: mesa.y }}
                            >
                                <span className="font-bold text-center text-sm">{mesa.nombre}</span>
                                <span className="text-xs text-gray-600">{mesa.invitados.length} sentados</span>
                            </div>
                        ))}
                    </TransformComponent>
                </TransformWrapper>
            </div>

            {/* --- BOTTOM SHEET (MENÚ INFERIOR) PARA DETALLES --- */}
            {mesaDetalleAbierta && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] transition-opacity cursor-pointer"
                        onClick={() => setMesaDetalleAbierta(null)}
                    />

                    {/* Panel Deslizante (Estilo iOS/Android) */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-300">
                        {/* Handle drag decorativo */}
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                {mesas.find(m => m.id === mesaDetalleAbierta)?.nombre}
                            </h3>
                            <button onClick={() => setMesaDetalleAbierta(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 font-bold">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[50vh] overflow-y-auto pb-4">
                            <p className="text-sm text-gray-500 font-semibold mb-2">Lista de invitados:</p>
                            {mesas.find(m => m.id === mesaDetalleAbierta)?.invitados.length === 0 ? (
                                <p className="text-gray-400 italic text-center py-6 bg-gray-50 rounded-xl">La mesa está vacía</p>
                            ) : (
                                <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    {mesas.find(m => m.id === mesaDetalleAbierta)?.invitados.map((inv, idx) => (
                                        <li key={idx} className="py-3 px-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                                            <span className="font-medium text-gray-700">{inv}</span>
                                            <button
                                                className="text-red-600 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                                onClick={() => handleQuitarInvitado(mesaDetalleAbierta, inv)}
                                            >
                                                Quitar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}