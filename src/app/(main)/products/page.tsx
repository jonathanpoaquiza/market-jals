'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthToken } from '@/lib/auth/get-token'; // asegúrate de tener este helper

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (productId: string) => {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (!confirmDelete) return;

    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No autenticado');

      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al eliminar el producto');
      }

      // Eliminar del estado local
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Productos</h1>
      <Link href="/products/new" className="mb-4 inline-block text-blue-600 underline">
        Crear nuevo producto
      </Link>
      {products.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <ul className="space-y-2">
          {products.map(p => (
            <li key={p.id} className="flex justify-between items-center border p-2 rounded">
              <span>
                <Link href={`/products/${p.id}`} className="text-blue-500 hover:underline">
                  {p.name}
                </Link> - ${p.price.toFixed(2)}
              </span>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
