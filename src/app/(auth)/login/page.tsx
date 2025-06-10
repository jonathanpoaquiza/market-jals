// src/app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

// Esquema de validación con Yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es obligatorio'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
});

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setError(null); // Limpia errores previos
    try {
      await login(data.email, data.password);
      router.push('/dashboard'); // Redirige al dashboard tras el login exitoso
    } catch (err: any) {
      // Firebase Auth errors
      let errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado. Verifica tu email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'El formato del email es inválido.';
      }
      setError(errorMessage);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-center text-3xl font-bold">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
          ¿No tienes cuenta? Regístrate
        </Link>
        <br />
        <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </>
  );
}