// src/lib/db/users.ts
import { adminDb } from '@/lib/firebase/server'; // Usa la instancia admin de Firestore
import { UserProfile, UserRole } from '@/types/auth'; // Reutiliza el tipo UserProfile

const usersCollection = adminDb.collection('users');

/**
 * Guarda o actualiza el perfil de un usuario en Firestore.
 * Útil para establecer el rol inicial o actualizar datos.
 * @param uid El UID del usuario.
 * @param data Los datos del perfil a guardar/actualizar.
 */
export const saveUserProfile = async (
  uid: string,
  data: Partial<Omit<UserProfile, 'uid'>>, // Partial Omit<UserProfile, 'uid'> para permitir actualizaciones parciales
): Promise<void> => {
  await usersCollection.doc(uid).set(data, { merge: true }); // merge: true para no sobrescribir todo el documento
};

/**
 * Obtiene el perfil completo de un usuario por su UID.
 * @param uid El UID del usuario.
 * @returns El UserProfile si existe, de lo contrario null.
 */
export const getUserProfileByUid = async (
  uid: string,
): Promise<UserProfile | null> => {
  const docSnap = await usersCollection.doc(uid).get();
  if (docSnap.exists) {
    const data = docSnap.data();
    return {
      uid: docSnap.id,
      email: data?.email || null,
      displayName: data?.displayName || null,
      role: data?.role as UserRole || 'client',
      createdAt: data?.createdAt?.toDate() || new Date(), // Asume que createdAt es un Timestamp
    };
  }
  return null;
};

/**
 * Lista todos los usuarios (o un subconjunto si se añade paginación/filtros).
 * @returns Un array de UserProfile.
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  const snapshot = await usersCollection.get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data?.email || null,
      displayName: data?.displayName || null,
      role: data?.role as UserRole || 'client',
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  });
};