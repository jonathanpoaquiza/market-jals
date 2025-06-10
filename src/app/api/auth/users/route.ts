// src/app/api/auth/users/route.ts
import { NextResponse } from 'next/server';
import { verifyIdTokenAndGetUser, checkUserRole } from '@/lib/auth/server-auth';
import { userService } from '@/lib/services/user-service';
import { UserRole } from '@/types/auth'; // Importa el tipo UserRole

// GET: Listar usuarios (solo para admins)
export async function GET(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ message: 'No authentication token provided.' }, { status: 401 });
    }

    const authenticatedUser = await verifyIdTokenAndGetUser(idToken);

    // Verificar que el usuario autenticado sea un administrador
    if (!checkUserRole(authenticatedUser, 'admin')) {
      return NextResponse.json({ message: 'Unauthorized: Admins only.' }, { status: 403 });
    }

    const users = await userService.listAll(authenticatedUser);
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error.message);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Asignar rol a un usuario (solo para admins)
export async function PATCH(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    const { uid: targetUid, role: newRole } = await request.json();

    if (!idToken) {
      return NextResponse.json({ message: 'No authentication token provided.' }, { status: 401 });
    }
    if (!targetUid || !newRole) {
      return NextResponse.json({ message: 'UID and new role are required.' }, { status: 400 });
    }

    const authenticatedUser = await verifyIdTokenAndGetUser(idToken);

    // Verificar que el usuario autenticado sea un administrador
    if (!checkUserRole(authenticatedUser, 'admin')) {
      return NextResponse.json({ message: 'Unauthorized: Admins only.' }, { status: 403 });
    }

    // Asegurarse de que el nuevo rol sea válido
    const validRoles: UserRole[] = ['client', 'employee', 'admin'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ message: 'Invalid role provided.' }, { status: 400 });
    }

    await userService.assignRole(targetUid, newRole, authenticatedUser);

    return NextResponse.json({ message: 'User role updated successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error assigning role:', error.message);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}