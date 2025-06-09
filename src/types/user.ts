// src/types/user.ts
// Ya definido en auth.ts, pero puede ser extendido si hay más detalles del usuario
// fuera del contexto de autenticación directa.
import { UserProfile } from './auth';

export interface DetailedUserProfile extends UserProfile {
  address?: string;
  phone?: string;
  // ... otros campos específicos de usuario
}