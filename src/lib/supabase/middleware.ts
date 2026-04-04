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
      // Query the public.Usuario table to get the true role using Supabase client
      const { data: dbUser } = await supabase
        .from('Usuario')
        .select('rol')
        .eq('id', user.id)
        .single()

      const userRole = dbUser?.rol || user.app_metadata?.rol || user.user_metadata?.rol || 'CLIENTE'
      const path = request.nextUrl.pathname

      console.log(`👤 User logged in: ${user.email} | Role: ${userRole} | Path: ${path}`)

      // Redirect to respective dashboard if at root or login/registro
      if (path === '/' || path === '/login' || path === '/registro') {
        const url = request.nextUrl.clone()
        if (userRole === 'ADMIN') url.pathname = '/admin/dashboard'
        else if (userRole === 'PROVEEDOR') url.pathname = '/proveedor/dashboard'
        else url.pathname = '/cliente/dashboard'
        
        console.log(`🚀 Redirecting to dashboard: ${url.pathname}`)
        return NextResponse.redirect(url)
      }

      // Role protection
      if (path.startsWith('/admin') && userRole !== 'ADMIN') {
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
