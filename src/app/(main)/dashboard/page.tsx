'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function DashboardPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [loading, currentUser, router]);

  // Cargar productos cuando el usuario está listo
  useEffect(() => {
    if (!loading && currentUser) {
      setLoadingProducts(true);
      setError(null);
      fetch('/api/products')
        .then(res => {
          if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts([]);
            setError('Respuesta inesperada del servidor');
          }
        })
        .catch(err => setError('Error cargando productos: ' + err.message))
        .finally(() => setLoadingProducts(false));
    } else {
      // Limpiar productos si no hay usuario
      setProducts([]);
      setError(null);
    }
  }, [loading, currentUser]);

  if (loading) return <div>Cargando usuario...</div>;
  if (!currentUser) return <div>No autorizado</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {error && <p className="text-red-600">{error}</p>}
      <h2 className="text-xl font-semibold mb-4">Productos</h2>
      {loadingProducts ? (
        <p>Cargando productos...</p>
      ) : products.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id} className="mb-2">
              {product.name} - ${product.price.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
