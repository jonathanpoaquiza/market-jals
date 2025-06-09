// src/types/chat.ts
export interface ChatMessage {
  id: string; // Firestore document ID for the message
  chatRoomId: string; // ID of the chat room
  senderId: string; // UID of the user who sent the message
  senderName: string; // Display name of the sender
  message: string;
  timestamp: Date; // Server timestamp
}

export interface ChatRoom {
  id: string; // Firestore document ID for the chat room
  participants: string[]; // UIDs of participants
  lastMessage?: ChatMessage; // Optional: last message for quick overview
  createdAt: Date;
  updatedAt?: Date;
}