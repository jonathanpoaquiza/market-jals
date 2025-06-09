// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/products', '/chat', '/invoicing'];
const authRoutes = ['/login', '/register', '/reset-password'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  const idToken = request.cookies.get('firebaseIdToken')?.value;

  // Redirige si no hay token en rutas protegidas
  if (isProtectedRoute && !idToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirige si ya tiene token y accede a rutas como login/register
  if (isAuthRoute && idToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
