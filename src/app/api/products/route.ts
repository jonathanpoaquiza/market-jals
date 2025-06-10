// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { productService } from '@/lib/services/product-service';
import { verifyIdTokenAndGetUser, checkUserRole } from '@/lib/auth/server-auth';

// GET: Obtener todos los productos o filtrar por categoría/vendedor
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const startAfterId = searchParams.get('startAfter') || undefined;
    const category = searchParams.get('category') || undefined;
    const sellerId = searchParams.get('sellerId') || undefined;
    const includeUnavailable = searchParams.get('includeUnavailable') === 'true';

    // Opcional: Si solo admins o vendedores pueden ver productos no disponibles
    if (includeUnavailable) {
      const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
      if (idToken) {
        const user = await verifyIdTokenAndGetUser(idToken);
        // Corregir: usar string literal union type en lugar de array
        if (!checkUserRole(user, 'admin') && !checkUserRole(user, 'admin')) {
          return NextResponse.json({ message: 'Unauthorized to view unavailable products.' }, { status: 403 });
        }
      } else {
        // Si no hay token y pide no disponibles, no autorizado
        return NextResponse.json({ message: 'Authentication required to view unavailable products.' }, { status: 401 });
      }
    }

    const products = await productService.getAllProducts({
      limit,
      startAfterId,
      category,
      sellerId,
      includeUnavailable,
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching products:', error.message);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
    }

    const authenticatedUser = await verifyIdTokenAndGetUser(idToken);
    
    // Solo 'admin' o 'employee' pueden crear productos
    // Corregir: verificar el retorno de checkUserRole y usar roles individuales
    const isAdmin = checkUserRole(authenticatedUser, 'admin');
    const isEmployee = checkUserRole(authenticatedUser, 'employee');
    
    if (!isAdmin && !isEmployee) {
      return NextResponse.json({ message: 'Unauthorized to create products.' }, { status: 403 });
    }

    const productData = await request.json();
    
    // Corregir: crear un objeto UserProfile compatible desde AuthenticatedUser
    const userProfile = {
      uid: authenticatedUser.uid,
      email: authenticatedUser.email,
      displayName: authenticatedUser.displayName,
      role: authenticatedUser.role,
      createdAt: new Date(), // Agregar la propiedad faltante
      // Remover emailVerified si no existe en AuthenticatedUser
    };

    const newProduct = await productService.createProduct(productData, userProfile);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error.message);
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}