// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

// Definición de tipos para las rutas
type RouteConfig = {
  path: string;
  requiresAuth: boolean;
  redirectTo?: string;
};

// Configuración de rutas con más detalle
const routeConfigs: RouteConfig[] = [
  { path: '/dashboard', requiresAuth: true, redirectTo: '/login' },
  { path: '/products', requiresAuth: true, redirectTo: '/login' },
  { path: '/chat', requiresAuth: true, redirectTo: '/login' },
  { path: '/invoicing', requiresAuth: true, redirectTo: '/login' },
  { path: '/login', requiresAuth: false, redirectTo: '/dashboard' },
  { path: '/register', requiresAuth: false, redirectTo: '/dashboard' },
  { path: '/reset-password', requiresAuth: false, redirectTo: '/dashboard' },
];

// Función para verificar si una ruta coincide con el patrón
const isMatchingRoute = (path: string, route: string): boolean => {
  return path.startsWith(route);
};

// Función para obtener la configuración de la ruta actual
const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routeConfigs.find(config => isMatchingRoute(path, config.path));
};

// Función para manejar redirecciones
const handleRedirect = (request: NextRequest, redirectTo: string): NextResponse => {
  const url = new URL(redirectTo, request.url);
  url.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(url);
};

export function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    const routeConfig = getRouteConfig(path);
    const idToken = request.cookies.get('firebaseIdToken')?.value;

    // Si no hay configuración específica para la ruta, permitir el acceso
    if (!routeConfig) {
      return NextResponse.next();
    }

    // Manejar rutas que requieren autenticación
    if (routeConfig.requiresAuth && !idToken) {
      return handleRedirect(request, routeConfig.redirectTo || '/login');
    }

    // Manejar rutas de autenticación cuando el usuario ya está autenticado
    if (!routeConfig.requiresAuth && idToken) {
      return handleRedirect(request, routeConfig.redirectTo || '/dashboard');
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error en middleware:', error);
    // En caso de error, redirigir a una página de error
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
