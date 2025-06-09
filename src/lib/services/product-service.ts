// src/lib/services/product-service.ts
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} from '@/lib/db/products'; // Importa las funciones de la DAL
import { Product } from '@/types/product'; // Importa el tipo Product
import { UserProfile } from '@/types/auth'; // Necesario para validar permisos

export const productService = {
  /**
   * Crea un nuevo producto.
   * @param productData Datos del producto.
   * @param sellerUser El perfil del usuario que intenta crear el producto.
   * @returns El producto creado.
   */
  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sellerId'>,
    sellerUser: UserProfile,
  ): Promise<Product> {
    // Validación de rol: Solo 'admin' o 'employee' pueden crear productos
    if (sellerUser.role !== 'admin' && sellerUser.role !== 'employee') {
      throw new Error('Unauthorized: Only administrators or employees can create products.');
    }
    if (!productData.name || productData.name.trim() === '') {
      throw new Error('Product name cannot be empty.');
    }
    if (productData.price <= 0) {
      throw new Error('Product price must be greater than zero.');
    }
    if (productData.stock < 0) {
      throw new Error('Product stock cannot be negative.');
    }
    // Puedes añadir más validaciones aquí

    const newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      ...productData,
      sellerId: sellerUser.uid, // Asignar el UID del vendedor
      isAvailable: productData.isAvailable ?? true, // Por defecto disponible
    };

    return await createProduct(newProductData);
  },

  /**
   * Obtiene un producto por su ID.
   * @param productId ID del producto.
   * @returns El producto.
   */
  async getProduct(productId: string): Promise<Product | null> {
    return await getProductById(productId);
  },

  /**
   * Obtiene una lista de productos.
   * @param options Opciones de filtrado/paginación.
   * @returns Array de productos.
   */
  async getAllProducts(options?: {
    limit?: number;
    startAfterId?: string;
    category?: string;
    sellerId?: string;
    includeUnavailable?: boolean;
  }): Promise<Product[]> {
    return await getProducts(options);
  },

  /**
   * Actualiza un producto existente.
   * @param productId ID del producto.
   * @param updateData Datos a actualizar.
   * @param requestingUser Perfil del usuario que solicita la actualización.
   */
  async updateProduct(
    productId: string,
    updateData: Partial<Omit<Product, 'id' | 'createdAt' | 'sellerId'>>,
    requestingUser: UserProfile,
  ): Promise<void> {
    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      throw new Error('Product not found.');
    }

    // Autorización: Solo el empleado/vendedor del producto o un administrador pueden actualizarlo
    if (requestingUser.role !== 'admin' && requestingUser.uid !== existingProduct.sellerId) {
      throw new Error('Unauthorized: You are not authorized to update this product.');
    }

    // Validaciones específicas para actualizaciones
    if (updateData.price !== undefined && updateData.price <= 0) {
      throw new Error('Product price must be greater than zero.');
    }
    if (updateData.stock !== undefined && updateData.stock < 0) {
      throw new Error('Product stock cannot be negative.');
    }

    await updateProduct(productId, updateData);
  },

  /**
   * Elimina un producto.
   * @param productId ID del producto.
   * @param requestingUser Perfil del usuario que solicita la eliminación.
   */
  async deleteProduct(productId: string, requestingUser: UserProfile): Promise<void> {
    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      throw new Error('Product not found.');
    }

    // Autorización: Solo el empleado/vendedor del producto o un administrador pueden eliminarlo
    if (requestingUser.role !== 'admin' && requestingUser.uid !== existingProduct.sellerId) {
      throw new Error('Unauthorized: You are not authorized to delete this product.');
    }

    await deleteProduct(productId);
  },
};