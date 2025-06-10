// src/lib/services/chat-service.ts
import {
  saveChatMessage,
  getChatMessages,
  createOrGetChatRoom,
  updateChatRoomLastMessage,
} from '@/lib/db/chat';
import { ChatMessage, ChatRoom } from '@/types/chat';
import { UserProfile } from '@/types/auth'; // Para el usuario autenticado

export const chatService = {
  /**
   * Procesa y guarda un mensaje de chat.
   * @param chatRoomId El ID de la sala de chat.
   * @param senderUser El perfil del usuario que envía el mensaje.
   * @param messageText El contenido del mensaje.
   * @returns El mensaje guardado.
   */
  async sendMessage(
    chatRoomId: string,
    senderUser: UserProfile,
    messageText: string,
  ): Promise<ChatMessage> {
    if (!messageText.trim()) {
      throw new Error('Message cannot be empty.');
    }

    const messageData: Omit<ChatMessage, 'id' | 'timestamp'> = {
      chatRoomId: chatRoomId,
      senderId: senderUser.uid,
      senderName: senderUser.displayName || senderUser.email || 'Anónimo',
      message: messageText,
    };

    const messageId = await saveChatMessage(messageData);

    const savedMessage: ChatMessage = {
      ...messageData,
      id: messageId,
      timestamp: new Date(), // Usar new Date() por ahora, el serverTimestamp se ajustará en DB
    };

    // Actualizar la última actividad de la sala de chat
    await updateChatRoomLastMessage(chatRoomId, savedMessage);

    return savedMessage;
  },

  /**
   * Obtiene el historial de mensajes para una sala de chat.
   * @param chatRoomId El ID de la sala de chat.
   * @param limit El número de mensajes a obtener.
   * @param startAfterDocId El ID del documento para paginación.
   * @returns Un array de ChatMessage.
   */
  async getMessageHistory(
    chatRoomId: string,
    limit?: number,
    startAfterDocId?: string,
  ): Promise<ChatMessage[]> {
    return await getChatMessages(chatRoomId, limit, startAfterDocId);
  },

  /**
   * Crea o recupera una sala de chat para un conjunto de participantes.
   * @param participants UIDs de los participantes.
   * @returns La sala de chat.
   */
  async getOrCreateRoom(participants: string[]): Promise<ChatRoom> {
    if (participants.length < 2) {
      throw new Error('A chat room must have at least two participants.');
    }
    return await createOrGetChatRoom(participants);
  },
};