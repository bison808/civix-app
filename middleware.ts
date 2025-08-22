import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/verify'];

// Define routes that require verified status
const verifiedOnlyRoutes: string[] = []; // Allow anonymous access to all routes for now

// Define admin routes (future implementation)
const adminRoutes: string[] = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Get session token from cookies (more secure than localStorage)
  const sessionToken = request.cookies.get('sessionToken')?.value;
  const anonymousId = request.cookies.get('anonymousId')?.value;
  const verificationLevel = request.cookies.get('verificationLevel')?.value;
  
  // Allow public routes
  if (isPublicRoute) {
    // If user is logged in and tries to access login/register, redirect to feed
    // But only if they also have the required ZIP code (prevent redirect loops)
    if ((pathname === '/login' || pathname === '/register') && sessionToken && anonymousId && request.cookies.get('userZipCode')?.value) {
      return NextResponse.redirect(new URL('/feed', request.url));
    }
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  if (!sessionToken || !anonymousId) {
    // Check if we're dealing with a static resource
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }
    
    // For /feed specifically, redirect to register if no session
    // For other protected routes, redirect to login
    if (pathname === '/feed') {
      return NextResponse.redirect(new URL('/register', request.url));
    }
    
    // Store the intended destination for other routes
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check ZIP verification
  const hasZipCode = request.cookies.get('userZipCode')?.value;
  if (!hasZipCode && pathname !== '/verify') {
    return NextResponse.redirect(new URL('/verify', request.url));
  }
  
  // Check verification level for specific routes
  if (verifiedOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (verificationLevel !== 'verified' && verificationLevel !== 'revealed') {
      // Redirect to verification prompt
      return NextResponse.redirect(new URL('/settings?prompt=verify', request.url));
    }
  }
  
  // Check admin access (future implementation)
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // For now, block all admin routes
    return NextResponse.redirect(new URL('/feed', request.url));
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP header for additional security
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - image files (jpg, jpeg, png, gif, svg, ico, webp)
     * - other static assets (css, js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|css|js)$).*)',
  ],
};