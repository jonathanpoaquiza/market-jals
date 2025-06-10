// src/app/(auth)/reset-password/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/lib/auth/auth-context';

// Esquema de validación con Yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es obligatorio'),
});

export default function ResetPasswordPage() {
  const { resetPassword, loading } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setMessage(null);
    setError(null);
    try {
      await resetPassword(data.email);
      setMessage(
        'Si tu email está registrado, recibirás un enlace para resetear tu contraseña.',
      );
    } catch (err: any) {
      setError(
        'Error al enviar el email de reseteo. Inténtalo de nuevo más tarde.',
      );
    }
  };

  return (
    <>
      <h1 className="mb-6 text-center text-3xl font-bold">
        Recuperar Contraseña
      </h1>
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
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Enlace de Reseteo'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Volver a Iniciar Sesión
        </Link>
      </div>
    </>
  );
}