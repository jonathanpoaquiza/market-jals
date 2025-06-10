// src/app/(main)/chat/page.tsx
'use client'; // Esto indica que es un Client Component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context'; // Para obtener el usuario actual
import { ChatMessage } from '@/types/chat'; // Asegúrate de que tu tipo ChatMessage sea correcto
import { format } from 'date-fns'; // Para formatear fechas
import {es} from 'date-fns/locale/es'; // Importar el locale español
import { useRouter } from 'next/navigation'; // Para la navegación programática

// Importar el SDK de Firebase Client
import { db, auth } from '@/lib/firebase/client'; // Asegúrate de importar 'auth' para el token
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot, // Importar la función para escuchar en tiempo real
  // addDoc, // No lo usaremos directamente aquí para escribir, lo haremos vía API POST
  // serverTimestamp // No lo usaremos directamente aquí
} from 'firebase/firestore';

export default function ChatPage() {
  const { currentUser, loading } = useAuth(); // `auth` se accede vía `auth.currentUser`
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatRoomId = 'general_market_chat'; // ID de sala de chat fijo por simplicidad
  const messagesEndRef = useRef<HTMLDivElement>(null); // Referencia para el scroll automático
  const [isConnected, setIsConnected] = useState(false); // Estado de conexión a Firestore
  const [isSending, setIsSending] = useState(false); // Estado para controlar el envío

  useEffect(() => {
    // Redirigir si el usuario no está autenticado y no está cargando
    if (!loading && !currentUser) {
      router.push('/login');
      return;
    }

    // No hacer nada si aún está cargando o no hay usuario autenticado
    if (!currentUser || !chatRoomId) return;

    // --- Establecer el listener de Firestore para mensajes en tiempo real ---
    // 1. Obtener la referencia a la colección de mensajes de la sala específica
    const messagesCollectionRef = collection(db, 'chatRooms', chatRoomId, 'messages');
    // 2. Crear una consulta para ordenar por timestamp y limitar la cantidad de mensajes
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'), limit(100)); // Limita a los últimos 100 mensajes

    // 3. Suscribirse a los cambios en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIsConnected(true); // Se considera conectado si el listener está activo
        const newMessages: ChatMessage[] = [];
        snapshot.docChanges().forEach((change) => {
          // Si es un mensaje nuevo añadido
          if (change.type === 'added') {
            const data = change.doc.data();
            const message: ChatMessage = {
              id: change.doc.id,
              chatRoomId: chatRoomId,
              senderId: data.senderId,
              senderName: data.senderName,
              message: data.message,
              // Convertir el Timestamp de Firestore a un objeto Date de JavaScript
              timestamp: data.timestamp?.toDate() || new Date(),
            };
            newMessages.push(message);
          }
          // Puedes añadir lógica para 'modified' o 'removed' si tu UI los necesita
        });

        // Actualizar el estado de los mensajes solo si hay nuevos mensajes
        if (newMessages.length > 0) {
          setMessages((prev) => {
            // Filtrar duplicados y combinar mensajes existentes con los nuevos
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
            const combined = [...prev, ...uniqueNewMessages];
            // Asegurar que los mensajes estén ordenados cronológicamente
            return combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          });
        } else if (messages.length === 0 && snapshot.docs.length > 0) {
          // Si el estado de mensajes está vacío pero el snapshot tiene docs, es la carga inicial
          const initialMessages = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                  id: doc.id,
                  chatRoomId: chatRoomId,
                  senderId: data.senderId,
                  senderName: data.senderName,
                  message: data.message,
                  timestamp: data.timestamp?.toDate() || new Date(),
              };
          }).sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
          setMessages(initialMessages);
      }
      },
      (error) => {
        // Manejo de errores en la conexión o suscripción a Firestore
        console.error('Error listening to messages:', error);
        setIsConnected(false); // Marcar como desconectado en caso de error
      },
    );

    // --- Función de limpieza: Desuscribirse del listener cuando el componente se desmonte ---
    return () => {
      unsubscribe(); // Deja de escuchar los cambios en Firestore
      setIsConnected(false);
    };
  }, [loading, currentUser, router, chatRoomId]); // Removido messages.length de las dependencias

  // Efecto para hacer scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // Se ejecuta cada vez que el array de mensajes cambia

  // Función para enviar un nuevo mensaje
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Validar el input del mensaje y la disponibilidad del usuario/sala
    if (!inputMessage.trim() || !currentUser || !chatRoomId || isSending) {
      return;
    }

    setIsSending(true); // Marcar como enviando

    try {
      // Verificar que el usuario de Firebase esté disponible
      if (!auth.currentUser) {
        throw new Error('Usuario no autenticado en Firebase. Por favor, inicia sesión nuevamente.');
      }

      console.log('Usuario actual:', {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified
      });

      // 1. Obtener el ID Token del usuario autenticado (forzar refresh para evitar tokens expirados)
      const idToken = await auth.currentUser.getIdToken(true); // true fuerza un refresh del token
      
      if (!idToken) {
        throw new Error('No se pudo obtener el token de autenticación.');
      }

      console.log('Token obtenido, enviando mensaje...');

      // 2. Enviar el mensaje a la API Route POST /api/chat/messages
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // Enviar el token en el encabezado
        },
        body: JSON.stringify({
          chatRoomId: chatRoomId,
          message: inputMessage,
        }),
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      // 3. Manejar la respuesta de la API
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.message || `Error del servidor: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Mensaje enviado exitosamente:', result);

      setInputMessage(''); // Limpiar el input después de enviar el mensaje
    } catch (error) {
      console.error('Error completo sending message:', error);
      
      // Proporcionar mensajes de error más específicos
      let errorMessage = 'Error desconocido al enviar mensaje';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Error de autenticación. Por favor, cierra sesión e inicia sesión nuevamente.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert('Error al enviar mensaje: ' + errorMessage);
    } finally {
      setIsSending(false); // Restaurar estado de envío
    }
  };

  // Renderizar un mensaje de carga si el usuario aún no ha cargado
  if (loading || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Cargando chat...
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] flex-col rounded-lg border border-gray-300 bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700">
      {/* Encabezado del chat */}
      <div className="border-b p-4 text-lg font-semibold bg-gray-50 dark:bg-gray-700 dark:text-white">
        Chat General
        <span
          className={`ml-2 text-sm font-medium ${
            isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          ({isConnected ? 'conectado' : 'desconectado'})
        </span>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`mb-3 flex ${
              msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs rounded-lg p-3 ${
                msg.senderId === currentUser.uid
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
              }`}
            >
              <div className="text-sm font-semibold">
                {msg.senderId === currentUser.uid ? 'Tú' : msg.senderName}
              </div>
              <p className="text-base mt-1">{msg.message}</p>
              <div className="mt-1 text-right text-xs opacity-80">
                {format(msg.timestamp, 'p', { locale: es })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario de envío */}
      <form onSubmit={sendMessage} className="flex border-t p-4 bg-white dark:bg-gray-800">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-l-md border border-gray-300 p-3 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          disabled={isSending}
        />
        <button
          type="submit"
          className="rounded-r-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
          disabled={!inputMessage.trim() || isSending}
        >
          {isSending ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </span>
          ) : (
            'Enviar'
          )}
        </button>
      </form>
    </div>
  );
}