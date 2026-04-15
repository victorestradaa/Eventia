import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase URL is set and valid
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') {
    console.warn('⚠️ Supabase environment variables are missing or placeholders. Skipping middleware auth.')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Do not run on static files
    if (
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.includes('/api/') ||
      request.nextUrl.pathname.includes('.')
    ) {
      return supabaseResponse
    }

    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Supabase auth error in middleware:', error.message)
      // If error occurs, let it pass to avoid infinite loading/redirects
      return supabaseResponse
    }

    // 1. If no user and trying to access protected routes, redirect to login
    const isProtectedPath = 
      request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/proveedor') || 
      request.nextUrl.pathname.startsWith('/cliente')

    if (!user && isProtectedPath) {
      console.log('🔒 Access denied: No user. Redirecting to /login')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // 2. Role-based Redirection
    if (user) {
      // Usamos el Service Role Key para bypassar RLS y siempre leer el rol real de la DB.
      // El cliente anon falla silenciosamente por las políticas de RLS en la tabla Usuario.
      let dbUserRole: string | null = null;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (serviceRoleKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const adminClient = createClient(supabaseUrl!, serviceRoleKey, {
            auth: { persistSession: false }
          });
          const { data: dbUser, error: dbError } = await adminClient
            .from('Usuario')
            .select('rol')
            .eq('email', user.email)
            .single();
          
          if (dbError) {
            console.warn('⚠️ Middleware (Service Role) | DB Error:', dbError.message);
          } else {
            dbUserRole = dbUser?.rol || null;
          }
        } catch (e) {
          console.warn('⚠️ Middleware | Service role client error:', e);
        }
      } else {
        console.warn('⚠️ Middleware | SUPABASE_SERVICE_ROLE_KEY not set. Falling back to user metadata.');
      }

      // IMPORTANTE: Convertimos a mayúsculas para evitar errores de case-sensitivity (admin vs ADMIN)
      const rawRole = dbUserRole || user.app_metadata?.rol || user.user_metadata?.rol || 'CLIENTE'
      const userRole = String(rawRole).toUpperCase()
      const path = request.nextUrl.pathname

      console.log(`👤 Middleware Debug | User: ${user.email} | Detected Role: ${userRole} | Path: ${path}`)

      // Redirect to respective dashboard if at root or login/registro
      if (path === '/' || path === '/login' || path === '/registro') {
        const url = request.nextUrl.clone()
        if (userRole === 'ADMIN') url.pathname = '/admin/dashboard'
        else if (userRole === 'PROVEEDOR') url.pathname = '/proveedor/dashboard'
        else url.pathname = '/cliente/dashboard'
        
        console.log(`🚀 Middleware Debug | Redirecting to: ${url.pathname}`)
        return NextResponse.redirect(url)
      }

      // Role protection - CASE INSENSITIVE
      if (path.startsWith('/admin') && userRole !== 'ADMIN') {
        console.warn(`🚫 Middleware Debug | Access Blocked: User ${user.email} with role ${userRole} tried to access /admin`)
        const url = request.nextUrl.clone()
        url.pathname = userRole === 'PROVEEDOR' ? '/proveedor/dashboard' : '/cliente/dashboard'
        return NextResponse.redirect(url)
      }

      if (path.startsWith('/proveedor') && userRole !== 'PROVEEDOR' && userRole !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = '/cliente/dashboard'
        return NextResponse.redirect(url)
      }

      if (path.startsWith('/cliente') && userRole !== 'CLIENTE' && userRole !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = '/proveedor/dashboard'
        return NextResponse.redirect(url)
      }
    }
  } catch (err) {
    console.error('🔥 Critical error in middleware:', err)
  }

  return supabaseResponse
}
