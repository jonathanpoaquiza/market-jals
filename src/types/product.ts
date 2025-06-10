// src/types/product.ts

export interface Product {
  id: string; // ID único del producto (generado por Firestore)
  name: string; // Nombre del producto
  description: string; // Descripción detallada
  price: number; // Precio del producto
  imageUrl: string; // URL de la imagen principal del producto en Firebase Storage
  rating: number;
  stock: number; // Cantidad disponible en stock
  category: string; // Categoría del producto (ej. "Electrónica", "Ropa", "Alimentos")
  tags: string[];
  sellerId: string; // UID del vendedor (usuario que creó el producto)
  createdAt: Date; // Timestamp de creación
  updatedAt: Date; // Timestamp de última actualización
  isAvailable: boolean; // Si el producto está disponible para la venta
}

// Puedes añadir más campos según tus necesidades, como:
// - images: string[]; // Un array de URLs para múltiples imágenes
// - weight: number;
// - dimensions: { length: number; width: number; height: number; };
// - reviews: string[]; // IDs de las reseñas

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductSort {
  field: 'price' | 'rating' | 'name' | 'createdAt';
  order: 'asc' | 'desc';
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
}

export interface ProductResponse {
  products: Product[];
  pagination: ProductPagination;
  filters: ProductFilters;
  sort: ProductSort;
}