// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { productService } from '@/lib/services/product-service';
import { verifyIdTokenAndGetUser, checkUserRole } from '@/lib/auth/server-auth';

// GET: Obtener un producto por su ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const productId = params.id;
    const product = await productService.getProduct(productId);

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    // Si el producto no está disponible, solo admins o el seller pueden verlo
    if (!product.isAvailable) {
      const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
      if (!idToken) {
        return NextResponse.json({ message: 'Authentication required to view this product.' }, { status: 401 });
      }
      const user = await verifyIdTokenAndGetUser(idToken);
      // Corregir: usar checkUserRole individual y verificar seller
      const isAdmin = checkUserRole(user, 'admin');
      const isSeller = user.uid === product.sellerId;
      
      if (!isAdmin && !isSeller) {
        return NextResponse.json({ message: 'Unauthorized to view this product.' }, { status: 403 });
      }
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching product by ID:', error.message);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PUT/PATCH: Actualizar un producto por su ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const productId = params.id;
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
    }

    const authenticatedUser = await verifyIdTokenAndGetUser(idToken);
    const updateData = await request.json();

    // Crear UserProfile compatible desde AuthenticatedUser
    const userProfile = {
      uid: authenticatedUser.uid,
      email: authenticatedUser.email,
      displayName: authenticatedUser.displayName,
      role: authenticatedUser.role,
      createdAt: new Date(),
    };

    await productService.updateProduct(productId, updateData, userProfile);

    return NextResponse.json({ message: 'Product updated successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating product:', error.message);
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Eliminar un producto por su ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const productId = params.id;
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
    }

    const authenticatedUser = await verifyIdTokenAndGetUser(idToken);

    // Crear UserProfile compatible desde AuthenticatedUser
    const userProfile = {
      uid: authenticatedUser.uid,
      email: authenticatedUser.email,
      displayName: authenticatedUser.displayName,
      role: authenticatedUser.role,
      createdAt: new Date(),
    };

    await productService.deleteProduct(productId, userProfile);

    return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting product:', error.message);
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}