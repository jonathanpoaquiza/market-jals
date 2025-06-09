// src/lib/firebase/storage.ts
import { storage } from '@/lib/firebase/client'; // Importa la instancia de storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos para los archivos

// Puedes instalar uuid si no lo tienes: npm install uuid @types/uuid

/**
 * Sube un archivo a Firebase Storage y devuelve su URL de descarga.
 * @param file El archivo a subir (File object).
 * @param path La ruta dentro de Storage (ej. 'product-images/', 'user-avatars/').
 * @returns La URL de descarga del archivo.
 */
export const uploadFileToFirebaseStorage = async (
  file: File,
  path: string,
): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Generar un nombre de archivo único para evitar colisiones
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}${fileName}`);

  // Subir el archivo
  const snapshot = await uploadBytes(storageRef, file);

  // Obtener la URL de descarga
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};