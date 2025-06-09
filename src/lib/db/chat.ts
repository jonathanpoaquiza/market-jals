// src/lib/db/chat.ts
import { adminDb } from '@/lib/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import { ChatMessage, ChatRoom } from '@/types/chat'; // Asegúrate de tener definidos estos tipos

const chatRoomsCollection = adminDb.collection('chatRooms');

/**
 * Guarda un nuevo mensaje de chat en Firestore.
 * @param messageData Los datos del mensaje a guardar.
 * @returns El ID del mensaje guardado.
 */
export const saveChatMessage = async (
  messageData: Omit<ChatMessage, 'id' | 'timestamp'> & {
    timestamp?: Date | number;
  }, // timestamp puede ser Date o número para facilidad
): Promise<string> => {
  // Asegurarse de que el timestamp sea un Timestamp de Firestore
  const timestamp = FieldValue.serverTimestamp(); // Usar siempre serverTimestamp para consistencia

  const messageRef = await chatRoomsCollection
    .doc(messageData.chatRoomId)
    .collection('messages')
    .add({
      ...messageData,
      timestamp: timestamp,
    });
  return messageRef.id;
};

/**
 * Obtiene los mensajes históricos de una sala de chat.
 * @param chatRoomId El ID de la sala de chat.
 * @param limit El número máximo de mensajes a recuperar (opcional, por defecto 50).
 * @param startAfterDocId El ID del documento a partir del cual se paginará (opcional).
 * @returns Un array de ChatMessage.
 */
export const getChatMessages = async (
  chatRoomId: string,
  limit: number = 50,
  startAfterDocId?: string,
): Promise<ChatMessage[]> => {
  let query = chatRoomsCollection
    .doc(chatRoomId)
    .collection('messages')
    .orderBy('timestamp', 'desc') // Ordenar por los más recientes primero
    .limit(limit);

  if (startAfterDocId) {
    const startAfterDoc = await chatRoomsCollection
      .doc(chatRoomId)
      .collection('messages')
      .doc(startAfterDocId)
      .get();
    if (startAfterDoc.exists) {
      query = query.startAfter(startAfterDoc);
    }
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      chatRoomId: chatRoomId,
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      timestamp: data.timestamp.toDate(), // Convertir Timestamp a Date
    };
  });
};

/**
 * Crea una nueva sala de chat si no existe, o devuelve la existente para un conjunto de participantes.
 * @param participants Los UIDs de los participantes.
 * @returns El objeto ChatRoom.
 */
export const createOrGetChatRoom = async (
  participants: string[],
): Promise<ChatRoom> => {
  // Ordenar participantes para asegurar un ID de sala consistente
  const sortedParticipants = participants.sort();
  
  // Para buscar salas con exactamente estos participantes, necesitamos verificar manualmente
  // ya que 'array-contains-all' no funciona de la forma esperada para conjuntos exactos
  const allRoomsSnapshot = await chatRoomsCollection
    .where('participants', 'array-contains', sortedParticipants[0])
    .get();

  // Filtrar manualmente para encontrar una sala con exactamente los mismos participantes
  const existingRoom = allRoomsSnapshot.docs.find(doc => {
    const roomParticipants = doc.data().participants || [];
    return roomParticipants.length === sortedParticipants.length &&
           sortedParticipants.every(p => roomParticipants.includes(p));
  });

  if (existingRoom) {
    const data = existingRoom.data();
    return {
      id: existingRoom.id,
      participants: data.participants,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } else {
    // Crear una nueva sala de chat
    const newRoom: Omit<ChatRoom, 'id'> = {
      participants: sortedParticipants,
      createdAt: FieldValue.serverTimestamp() as any, // Firestore Timestamp
    };
    const docRef = await chatRoomsCollection.add(newRoom);
    const newRoomSnap = await docRef.get();
    const newRoomData = newRoomSnap.data();
    return {
      id: docRef.id,
      participants: newRoomData?.participants,
      createdAt: newRoomData?.createdAt?.toDate() || new Date(),
    } as ChatRoom;
  }
};

/**
 * Actualiza el último mensaje de una sala de chat.
 * Útil para mostrar un resumen en la lista de chats.
 */
export const updateChatRoomLastMessage = async (
  chatRoomId: string,
  message: ChatMessage,
): Promise<void> => {
  const chatRoomRef = chatRoomsCollection.doc(chatRoomId);
  const docSnap = await chatRoomRef.get();

  const updateData = {
    lastMessage: {
      senderId: message.senderId,
      senderName: message.senderName,
      message: message.message,
      timestamp: FieldValue.serverTimestamp(),
    },
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!docSnap.exists) {
    // Crea el documento si no existe
    await chatRoomRef.set({
      ...updateData,
      participants: [message.senderId], // o ajusta según tu lógica
      createdAt: FieldValue.serverTimestamp(),
    });
  } else {
    // Actualiza el documento existente
    await chatRoomRef.update(updateData);
  }
};
