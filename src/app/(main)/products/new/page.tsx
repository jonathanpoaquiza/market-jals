'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';

export async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !price) {
      setError('Por favor completa todos los campos');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      setError('Precio inválido');
      return;
    }

    setLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No se pudo autenticar al usuario.');
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, price: priceNumber, description }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error creando producto');
      }

      router.push('/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Crear nuevo producto</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 rounded"
          disabled={loading}
          min="0"
          step="0.01"
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
          rows={4}
          disabled={loading}
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
