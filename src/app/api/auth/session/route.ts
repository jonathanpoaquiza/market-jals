// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { message: 'ID Token is required' },
        { status: 400 },
      );
    }

    // Crear una cookie de sesión con el token de Firebase ID
    // Esto permite que el middleware verifique la autenticación sin hacer
    // múltiples llamadas a la API de Firebase.
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días en milisegundos

    // Crear la cookie de sesión (usando el token de Firebase ID como valor)
    // Opcional: Se puede crear un token de sesión de Firebase más robusto si es necesario
    // const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json(
      { message: 'Session cookie set' },
      { status: 200 },
    );

    response.cookies.set({
      name: 'firebaseIdToken', // Nombre de la cookie que usará el middleware
      value: idToken, // El valor es el ID token de Firebase
      maxAge: expiresIn / 1000, // Duración de la cookie en segundos
      httpOnly: true, // No accesible desde JavaScript del cliente
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      path: '/', // Accesible desde cualquier ruta
      sameSite: 'lax', // Protección CSRF
    });

    return response;
  } catch (error) {
    console.error('Error handling session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Para cerrar sesión, el cliente puede llamar a esta API para borrar la cookie
export async function DELETE(request: Request) {
  try {
    const response = NextResponse.json(
      { message: 'Session cookie cleared' },
      { status: 200 },
    );
    response.cookies.delete('firebaseIdToken'); // Borra la cookie de sesión
    return response;
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}