// src/lib/auth/auth-context.tsx
'use client'; // Esto indica que es un Client Component en Next.js

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { auth, db } from '@/lib/firebase/client'; // Importa la instancia de Firebase cliente
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Para Firestore cliente
import { UserProfile, AuthContextType, UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation'; // Hook para redirección en Next.js App Router

// Define el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario logueado, obtener su perfil y rol de Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data();
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: profileData.role as UserRole || 'client', // Asegura un rol por defecto
            createdAt: profileData.createdAt.toDate(),
          });
        } else {
          // Si el usuario no tiene un documento en Firestore (raro si se registró por la app)
          // Puedes crear uno con un rol por defecto, o manejar este caso.
          console.warn(`User document not found for UID: ${user.uid}. Assigning default role.`);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'client', // Rol por defecto
            createdAt: new Date(),
          });
        }
      } else {
        // Usuario deslogueado
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken(); // Obtener el ID Token

      // Enviar el ID Token a tu API Route para establecer la cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      // useRouter().push('/dashboard'); // La redirección puede ir aquí o en el componente
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Guardar el perfil de usuario en Firestore con un rol inicial
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'client', // Rol por defecto al registrarse
        createdAt: new Date(),
      });

      // Actualizar el displayName en Firebase Auth también
      if (user.displayName !== displayName) {
        await updateProfile(user, { displayName: displayName });
      }

      const idToken = await user.getIdToken(); // Obtener el ID Token
      // Enviar el ID Token a tu API Route para establecer la cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      // useRouter().push('/dashboard'); // La redirección puede ir aquí o en el componente
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // Borrar la cookie de sesión en el backend también
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Revisa tu correo electrónico para resetear tu contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar los datos del usuario desde Firestore
  const refreshUser = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data();
        setCurrentUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          role: profileData.role as UserRole || 'client',
          createdAt: profileData.createdAt.toDate(),
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
    refreshUser, // Agregar la función faltante
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Renderiza los children solo cuando no está cargando */}
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