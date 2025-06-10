// src/lib/db/product.ts
import { adminDb } from '@/lib/firebase/server'; // Importa la instancia de Firebase Admin SDK
import { FieldValue } from 'firebase-admin/firestore'; // Importa FieldValue por separado
import { Product } from '@/types/product'; // Importa el tipo Product

const productsCollection = adminDb.collection('products');

/**
 * Crea un nuevo producto en Firestore.
 * @param productData Los datos del producto a crear (sin ID, createdAt, updatedAt).
 * @returns El objeto Product completo con ID y timestamps.
 */
export const createProduct = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Product> => {
  const timestamp = FieldValue.serverTimestamp(); // Usar FieldValue importado
  const docRef = await productsCollection.add({
    ...productData,
    createdAt: timestamp,
    updatedAt: timestamp,
    isAvailable: true, // Por defecto, el producto está disponible al crearse
  });

  const productSnap = await docRef.get();
  const data = productSnap.data();

  if (!data) {
    throw new Error('Failed to retrieve product data after creation.');
  }

  return {
    id: docRef.id,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl,
    category: data.category,
    stock: data.stock,
    sellerId: data.sellerId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    isAvailable: data.isAvailable,
  };
};

/**
 * Obtiene un producto por su ID.
 * @param productId El ID del producto.
 * @returns El objeto Product o null si no se encuentra.
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  const docSnap = await productsCollection.doc(productId).get();
  if (docSnap.exists) {
    const data = docSnap.data();
    if (!data) return null;

    return {
      id: docSnap.id,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      category: data.category,
      stock: data.stock,
      sellerId: data.sellerId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      isAvailable: data.isAvailable,
    };
  }
  return null;
};

/**
 * Obtiene una lista de productos, con opciones de paginación y filtrado.
 * @param options Opciones de consulta como límite, última ID, categoría, etc.
 * @returns Un array de objetos Product.
 */
export const getProducts = async (options?: {
  limit?: number;
  startAfterId?: string;
  category?: string;
  sellerId?: string;
  includeUnavailable?: boolean; // Para administradores o vendedores
}): Promise<Product[]> => {
  let query: FirebaseFirestore.Query = productsCollection;

  if (options?.category) {
    query = query.where('category', '==', options.category);
  }
  if (options?.sellerId) {
    query = query.where('sellerId', '==', options.sellerId);
  }
  if (!options?.includeUnavailable) {
    query = query.where('isAvailable', '==', true);
  }

  query = query.orderBy('createdAt', 'desc'); // Ordenar por los más recientes

  if (options?.startAfterId) {
    const startAfterDoc = await productsCollection.doc(options.startAfterId).get();
    if (startAfterDoc.exists) {
      query = query.startAfter(startAfterDoc);
    }
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      category: data.category,
      stock: data.stock,
      sellerId: data.sellerId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      isAvailable: data.isAvailable,
    };
  });
};

/**
 * Actualiza un producto existente.
 * @param productId El ID del producto a actualizar.
 * @param updateData Los datos a actualizar.
 */
export const updateProduct = async (
  productId: string,
  updateData: Partial<Omit<Product, 'id' | 'createdAt' | 'sellerId'>>, // No permitir actualizar ID, createdAt, sellerId
): Promise<void> => {
  await productsCollection.doc(productId).update({
    ...updateData,
    updatedAt: FieldValue.serverTimestamp(), // Usar FieldValue importado
  });
};

/**
 * Elimina un producto.
 * @param productId El ID del producto a eliminar.
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  await productsCollection.doc(productId).delete();
};