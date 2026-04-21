import Link from 'next/link';
import { ReactNode } from 'react';
import { cerrarSesion, getCurrentProfile } from '@/lib/actions/authActions';
import { LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profileRes = await getCurrentProfile();
  const userName = profileRes.success && profileRes.data ? profileRes.data.nombre : 'Administrador';
  const userEmail = profileRes.success && profileRes.data ? profileRes.data.email : 'admin@eventia.com';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex bg-[var(--color-fondo)] min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/admin/dashboard" className="text-2xl font-bold gradient-texto">
            Admin Panel
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/admin/dashboard" className="sidebar-item activo">
            <span className="text-lg">📊</span>
            Dashboard
          </Link>
          <Link href="/admin/usuarios" className="sidebar-item">
            <span className="text-lg">👥</span>
            Usuarios
          </Link>
          <Link href="/admin/eventos" className="sidebar-item">
            <span className="text-lg">📅</span>
            Eventos
          </Link>
          <Link href="/admin/reportes" className="sidebar-item">
            <span className="text-lg">📈</span>
            Reportes
          </Link>
          <Link href="/admin/configuracion" className="sidebar-item">
            <span className="text-lg">⚙️</span>
            Configuración
          </Link>
          <Link href="/admin/catalogo" className="sidebar-item hover:bg-[var(--color-primario)]/10 text-[var(--color-primario)]">
            <span className="text-lg">🖼️</span>
            Catálogo D. Invitaciones
          </Link>
        </nav>

        <div className="mt-auto p-4 border-t border-[var(--color-borde-suave)]">
          <form action={cerrarSesion}>
            <button type="submit" className="sidebar-item w-full text-left text-red-400 hover:bg-red-500/10 transition-colors">
              <span className="text-lg">🚪</span>
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-con-sidebar w-full">
        {/* Header simple */}
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-[var(--color-borde-suave)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-texto-muted)] uppercase tracking-wider">
              Sistema de Gestión
            </h2>
            <p className="text-[var(--color-texto-suave)]">Panel Central de Control</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">{userName}</p>
              <p className="text-xs text-[var(--color-texto-muted)]">{userEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primario)] to-[var(--color-acento)] flex items-center justify-center font-bold">
              {initial}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
