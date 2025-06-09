// src/app/api/chat/messages/route.ts
import { NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chat-service';
import { verifyIdTokenAndGetUser } from '@/lib/auth/server-auth';
import { UserProfile } from '@/types/auth'; // Asegúrate de que este tipo esté definido correctamente

// POST: Para enviar un nuevo mensaje de chat a Firestore
export async function POST(request: Request) {
  try {
    console.log('🚀 Iniciando POST /api/chat/messages');
    
    // 1. Obtener el token de autenticación del encabezado
    const authHeader = request.headers.get('Authorization');
    console.log('📋 Authorization header:', authHeader ? 'Presente' : 'Ausente');
    
    const idToken = authHeader?.split('Bearer ')[1];
    if (!idToken) {
      console.error('❌ No se proporcionó token de autenticación');
      return NextResponse.json({ 
        message: 'No authentication token provided.',
        error: 'MISSING_TOKEN' 
      }, { status: 401 });
    }

    console.log('🔑 Token extraído exitosamente');

    // 2. Verificar el token y obtener el usuario autenticado
    let authenticatedUser;
    try {
      console.log('🔍 Verificando token...');
      authenticatedUser = await verifyIdTokenAndGetUser(idToken);
      console.log('✅ Usuario autenticado:', {
        uid: authenticatedUser.uid,
        email: authenticatedUser.email,
        displayName: authenticatedUser.displayName
      });
    } catch (authError: any) {
      console.error('❌ Error de autenticación:', authError);
      return NextResponse.json({ 
        message: 'Authentication failed: ' + authError.message,
        error: 'AUTH_FAILED',
        details: authError.message 
      }, { status: 401 });
    }

    // 3. Obtener los datos del mensaje del cuerpo de la solicitud
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('📝 Datos del mensaje:', requestBody);
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      return NextResponse.json({ 
        message: 'Invalid JSON in request body.',
        error: 'INVALID_JSON' 
      }, { status: 400 });
    }

    const { chatRoomId, message: messageText } = requestBody;

    if (!chatRoomId || !messageText?.trim()) {
      console.error('❌ Datos faltantes:', { chatRoomId, messageText });
      return NextResponse.json({ 
        message: 'chatRoomId and message are required and message cannot be empty.',
        error: 'MISSING_DATA' 
      }, { status: 400 });
    }

    // 4. (Opcional pero recomendado) Lógica de autorización
    // Aquí deberías añadir una verificación para asegurar que el `authenticatedUser`
    // tiene permiso para enviar mensajes a `chatRoomId`. Por ejemplo, verificar
    // que es un participante de la sala. Para este ejemplo, lo omitimos por simplicidad.

    // 5. Preparar el perfil del remitente
    const senderProfile: UserProfile = {
      uid: authenticatedUser.uid,
      email: authenticatedUser.email || '',
      displayName: authenticatedUser.displayName || authenticatedUser.email || 'Anónimo',
      role: 'client', // Asigna un rol predeterminado o recupera el rol real del usuario desde tu base de datos
      createdAt: new Date(), // Esto es un placeholder; en una app real, vendría de la DB del perfil de usuario
    };

    console.log('👤 Perfil del remitente:', senderProfile);

    // 6. Usar el servicio de chat para guardar el mensaje en Firestore
    let savedMessage;
    try {
      console.log('💾 Guardando mensaje en Firestore...');
      savedMessage = await chatService.sendMessage(
        chatRoomId,
        senderProfile,
        messageText.trim(),
      );
      console.log('✅ Mensaje guardado exitosamente:', savedMessage);
    } catch (firestoreError: any) {
      console.error('❌ Error guardando en Firestore:', firestoreError);
      return NextResponse.json({ 
        message: 'Error saving message to database: ' + firestoreError.message,
        error: 'FIRESTORE_ERROR',
        details: firestoreError.message 
      }, { status: 500 });
    }

    // 7. Devolver el mensaje guardado (opcional, el frontend lo obtendrá por el listener)
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: savedMessage
    }, { status: 200 });

  } catch (error: any) {
    console.error('💥 Error general en POST /api/chat/messages:', error);
    
    // Proporcionar más detalles del error
    const errorResponse = {
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
      details: error.message || 'Unknown error occurred'
    };

    // Si es un error conocido, proporcionar más contexto
    if (error.code) {
      errorResponse.error = error.code;
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET: Este endpoint ya no se usará para obtener mensajes históricos
// El historial y las actualizaciones en tiempo real se manejarán directamente en el cliente con onSnapshot.
export async function GET() {
    return NextResponse.json({ 
      message: 'GET method not supported for /api/chat/messages. Use POST to send messages or Firestore listeners for real-time retrieval.' 
    }, { status: 405 });
}