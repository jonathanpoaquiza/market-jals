import { saveUserProfile, getUserProfileByUid, getAllUserProfiles } from '@/lib/db/users';
import { UserProfile, UserRole, AuthenticatedUser } from '@/types/auth';

export const userService = {
  /**
   * Asigna un rol a un usuario. Requiere que el llamante sea un administrador.
   * @param targetUid El UID del usuario al que se le asignará el rol.
   * @param newRole El nuevo rol a asignar.
   * @param callerUser El usuario que realiza la acción (debe ser admin).
   */
  async assignRole(
    targetUid: string,
    newRole: UserRole,
    callerUser: AuthenticatedUser, // Cambiado de UserProfile a AuthenticatedUser
  ): Promise<void> {
    if (callerUser.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can assign roles.');
    }

    const targetUser = await getUserProfileByUid(targetUid);
    if (!targetUser) {
      throw new Error('User not found.');
    }

    // Evitar que un admin se quite a sí mismo el rol de admin
    if (callerUser.uid === targetUid && newRole !== 'admin') {
      throw new Error('Cannot change your own role from admin.');
    }

    await saveUserProfile(targetUid, { role: newRole });
  },

  /**
   * Obtiene el perfil de un usuario.
   * @param uid El UID del usuario.
   * @returns El perfil completo del usuario.
   * @throws Error si el usuario no se encuentra.
   */
  async getById(uid: string): Promise<UserProfile> {
    const user = await getUserProfileByUid(uid);
    if (!user) {
      throw new Error('User not found.');
    }
    return user;
  },

  /**
   * Lista todos los usuarios. Requiere que el llamante sea un administrador.
   * @param callerUser El usuario que realiza la acción (debe ser admin).
   * @returns Un array de perfiles completos de usuario.
   */
  async listAll(callerUser: AuthenticatedUser): Promise<UserProfile[]> { // Cambiado de UserProfile a AuthenticatedUser
    if (callerUser.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can list all users.');
    }
    return await getAllUserProfiles();
  },

  /**
   * Versión segura para obtener datos básicos del usuario actual
   * @param callerUser Usuario autenticado
   * @returns Datos básicos del usuario
   */
  async getCurrentUser(callerUser: AuthenticatedUser): Promise<AuthenticatedUser> {
    return {
      uid: callerUser.uid,
      email: callerUser.email,
      role: callerUser.role
    };
  }
};