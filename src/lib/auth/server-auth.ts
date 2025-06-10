// src/lib/auth/server-auth.ts
import { adminAuth, adminDb } from '@/lib/firebase/server'; // Importa las instancias de Firebase Admin
import { UserProfile, UserRole } from '@/types/auth';

interface AuthenticatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

/**
 * Verifica el token de autenticación de Firebase en el servidor
 * y obtiene el perfil completo del usuario, incluyendo su rol de Firestore.
 * Si el perfil no existe, lo crea automáticamente.
 * @param idToken El token de Firebase ID JWT del usuario.
 * @returns Un objeto AuthenticatedUser si el token es válido.
 * @throws Error si el token es inválido.
 */
export const verifyIdTokenAndGetUser = async (
  idToken: string,
): Promise<AuthenticatedUser> => {
  try {
    console.log('🔍 Verificando token de ID...');
    
    // Verificar el token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    console.log('✅ Token verificado para usuario:', { 
      uid, 
      email: decodedToken.email,
      name: decodedToken.name 
    });

    // Obtener el perfil del usuario de Firestore
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDocSnap = await userDocRef.get();

    let role: UserRole = 'admin'; // Rol por defecto

    if (!userDocSnap.exists) {
      console.log('⚠️ Perfil de usuario no encontrado en Firestore, creando uno nuevo...');
      
      // Crear el perfil del usuario automáticamente
      const newUserProfile: UserProfile = {
        uid: uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || decodedToken.email || 'Usuario',
        role: role,
        createdAt: new Date(),
      };

      try {
        await userDocRef.set(newUserProfile);
        console.log('✅ Perfil de usuario creado exitosamente');
        role = newUserProfile.role;
      } catch (createError) {
        console.error('❌ Error creando perfil de usuario:', createError);
        // Continuar con rol por defecto en lugar de fallar
        console.log('⚠️ Continuando con rol por defecto');
      }
    } else {
      const userData = userDocSnap.data();
      
      console.log('✅ Perfil de usuario encontrado en Firestore',userData);
      role = userData?.role || role;
    }

    const authenticatedUser: AuthenticatedUser = {
      uid: uid,
      email: decodedToken.email || null,
      displayName: decodedToken.name || decodedToken.email || null,
      role: role,
    };

    console.log('✅ Usuario autenticado:', authenticatedUser);
    return authenticatedUser;

  } catch (error: any) {
    console.error('❌ Error en verifyIdTokenAndGetUser:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.code === 'auth/id-token-expired') {
      throw new Error('Authentication token has expired. Please log in again.');
    } else if (error.code === 'auth/invalid-id-token') {
      throw new Error('Invalid authentication token. Please log in again.');
    } else if (error.code === 'auth/id-token-revoked') {
      throw new Error('Authentication token has been revoked. Please log in again.');
    } else {
      throw new Error(`Authentication failed: ${error.message || 'Invalid token or server error'}`);
    }
  }
};

/**
 * Verifica si el usuario autenticado tiene un rol específico o superior.
 * @param user El objeto AuthenticatedUser.
 * @param requiredRole El rol mínimo requerido (role, 'employee', 'admin').
 * @returns true si el usuario tiene el rol requerido o superior, false en caso contrario.
 */
export const checkUserRole = (
  user: AuthenticatedUser,
  requiredRole: UserRole,
): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    client: 1,
    employee: 2,
    admin: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};