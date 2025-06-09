'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(res => {
        if (res.status === 404) {
          router.push('/products'); // Redirigir si no existe
          return;
        }
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => setProduct(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div>Cargando producto...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!product) return <div>Producto no encontrado.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="mb-2">Precio: ${product.price.toFixed(2)}</p>
      <p>{product.description || 'Sin descripción'}</p>
    </div>
  );
}
