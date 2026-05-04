import { getGlobalEventos } from '@/lib/actions/adminActions';
import EventosAdminClient from './EventosAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminEventosPage() {
  const res = await getGlobalEventos();
  const eventos = res.success ? (res.data as any[]) : [];
  return <EventosAdminClient initialEventos={eventos} />;
}
