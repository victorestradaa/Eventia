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
            cookiesToSet.forEach(({ name, value, options }) => {
              // Ensure secure is false on local dev (especially for IP access from mobile)
              const secure = process.env.NODE_ENV === 'production'
              const adjustedOptions = { ...options, secure }
              
              request.cookies.set(name, value)
              supabaseResponse.cookies.set(name, value, adjustedOptions)
            })
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
      // Lista de administradores garantizados (Fallback de emergencia)
      const ADMIN_EMAILS = ['admin@eventia.com', 'admin@gestor.com'];
      const isHardcodedAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

      let dbUserRole: string | null = null;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (serviceRoleKey && serviceRoleKey !== '') {
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
            console.warn(`⚠️ Middleware | DB Query Error for ${user.email}:`, dbError.message);
          } else {
            dbUserRole = dbUser?.rol || null;
          }
        } catch (e) {
          console.warn('⚠️ Middleware | Service role execution error:', e);
        }
      } else {
        console.warn('⚠️ Middleware | SUPABASE_SERVICE_ROLE_KEY is missing/empty. DB check skipped.');
      }

      // IMPORTANTE: Unimos todas las fuentes de rol posibles
      const metadataRole = user.app_metadata?.rol || user.user_metadata?.rol;
      
      let userRole = 'CLIENTE'; // Default
      
      if (isHardcodedAdmin) {
        userRole = 'ADMIN';
        console.log(`⭐ Middleware | Emergency Admin detected by email: ${user.email}`);
      } else if (dbUserRole) {
        userRole = String(dbUserRole).toUpperCase();
      } else if (metadataRole) {
        userRole = String(metadataRole).toUpperCase();
      }

      const path = request.nextUrl.pathname
      console.log(`👤 Middleware | User: ${user.email} | Detected Role: ${userRole} | Path: ${path} | Source: ${isHardcodedAdmin ? 'Hardcoded' : (dbUserRole ? 'Database' : (metadataRole ? 'Metadata' : 'Default'))}`);

      // Redirect to respective dashboard if at root or login/registro
      if (path === '/' || path === '/login' || path === '/registro') {
        const url = request.nextUrl.clone()
        if (userRole === 'ADMIN') url.pathname = '/admin/dashboard'
        else if (userRole === 'PROVEEDOR') url.pathname = '/proveedor/dashboard'
        else url.pathname = '/cliente/dashboard'
        
        console.log(`🚀 Middleware | Redirecting to: ${url.pathname}`)
        // IMPORTANTE: Al redireccionar debemos pasar las cookies del objeto original
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        })
        return redirectResponse
      }

      // Role protection - CASE INSENSITIVE
      if (path.startsWith('/admin') && userRole !== 'ADMIN') {
        console.warn(`🚫 Middleware | Access Denied: User ${user.email} (Role: ${userRole}) tried to access /admin. Redirecting to safe dashboard.`)
        const url = request.nextUrl.clone()
        url.pathname = userRole === 'PROVEEDOR' ? '/proveedor/dashboard' : '/cliente/dashboard'
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        })
        return redirectResponse
      }

      const isProveedorPath = path.startsWith('/proveedor')
      const isClientePath = path.startsWith('/cliente')

      if (isProveedorPath && userRole !== 'PROVEEDOR' && userRole !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = '/cliente/dashboard'
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        })
        return redirectResponse
      }

      if (isClientePath && userRole !== 'CLIENTE' && userRole !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = '/proveedor/dashboard'
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        })
        return redirectResponse
      }
    }
  } catch (err) {
    console.error('🔥 Critical error in middleware:', err)
  }

  return supabaseResponse
}
