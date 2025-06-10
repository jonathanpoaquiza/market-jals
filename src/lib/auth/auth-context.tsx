// src/lib/auth/auth-context.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  auth,
  db,
} from '@/lib/firebase/client';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  UserProfile,
  AuthContextType,
  UserRole,
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email ?? '',
              displayName: user.displayName ?? '',
              role: profileData.role as UserRole ?? 'client',
              createdAt: profileData.createdAt.toDate(),
            });
          } else {
            console.warn(`User document not found for UID: ${user.uid}. Creating default profile.`);
            const defaultProfile: UserProfile = {
              uid: user.uid,
              email: user.email ?? '',
              displayName: user.displayName ?? '',
              role: 'client',
              createdAt: new Date(),
            };
            await setDoc(userDocRef, {
              ...defaultProfile,
              createdAt: Timestamp.fromDate(defaultProfile.createdAt),
            });
            setCurrentUser(defaultProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser({
            uid: user.uid,
            email: user.email ?? '',
            displayName: user.displayName ?? '',
            role: 'client',
            createdAt: new Date(),
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, expectedRole?: UserRole) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (expectedRole) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await signOut(auth);
          throw new Error('Perfil de usuario no encontrado');
        }

        const userData = userDocSnap.data();
        const userRole = userData.role as UserRole;

        if (userRole !== expectedRole) {
          await signOut(auth);
          throw new Error(`No tienes permisos de ${expectedRole}. Tu rol es: ${userRole}`);
        }
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Error al establecer la sesión');
      }

      return { success: true };
    } catch (error) {
      //console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole = 'client'
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email ?? '',
        displayName,
        role,
        createdAt: new Date(),
      };

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
      });

      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Error al establecer la sesión');
      }

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Revisa tu correo electrónico para resetear tu contraseña.',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data();
        setCurrentUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email ?? '',
          displayName: auth.currentUser.displayName ?? '',
          role: profileData.role as UserRole ?? 'client',
          createdAt: profileData.createdAt.toDate(),
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const hasRole = (role: UserRole): boolean => currentUser?.role === role;

  const hasMinimumRole = (minimumRole: UserRole): boolean => {
    if (!currentUser) return false;

    const roleHierarchy: Record<UserRole, number> = {
      client: 1,
      employee: 2,
      admin: 3,
    };

    return roleHierarchy[currentUser.role] >= roleHierarchy[minimumRole];
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
    refreshUser,
    hasRole,
    hasMinimumRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
