'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth/get-token'; // Asegúrate de tener este helper

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(res => {
        if (res.status === 404) {
          router.push('/products');
          return;
        }
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => setProduct(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No autenticado');

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          description: product.description
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al actualizar el producto');
      }

      router.push('/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando producto...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!product) return <div>Producto no encontrado.</div>;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Editar producto</h1>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <input
          type="text"
          value={product.name}
          onChange={e => setProduct({ ...product, name: e.target.value })}
          placeholder="Nombre"
          className="border p-2 rounded"
          disabled={saving}
        />
        <input
          type="number"
          value={product.price}
          onChange={e => setProduct({ ...product, price: parseFloat(e.target.value) })}
          placeholder="Precio"
          className="border p-2 rounded"
          disabled={saving}
          min="0"
          step="0.01"
        />
        <textarea
          value={product.description || ''}
          onChange={e => setProduct({ ...product, description: e.target.value })}
          placeholder="Descripción"
          className="border p-2 rounded"
          rows={4}
          disabled={saving}
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
