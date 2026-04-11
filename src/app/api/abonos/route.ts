import { NextRequest, NextResponse } from 'next/server';
import { registrarAbono } from '@/lib/actions/paymentActions';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.reservaId || data.monto === undefined) {
      return NextResponse.json({ success: false, error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const res = await registrarAbono(data);

    // Aseguramos que la respuesta se pueda serializar correctamente eliminando refs
    return NextResponse.json(JSON.parse(JSON.stringify(res)), { status: 200 });
  } catch (error: any) {
    console.error('Error en API abonos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Error interno al procesar el abono a través de la API externa' 
    }, { status: 500 });
  }
}
