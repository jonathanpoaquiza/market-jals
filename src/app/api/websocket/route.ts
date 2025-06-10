import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

let wss: WebSocketServer;

export async function GET(req: Request) {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    
    wss.on('connection', (ws) => {
      console.log('Cliente conectado');

      ws.on('message', (message) => {
        console.log('Mensaje recibido:', message.toString());
        // Aquí puedes manejar diferentes tipos de mensajes
        // Por ejemplo, actualizaciones de inventario, notificaciones, etc.
      });

      ws.on('close', () => {
        console.log('Cliente desconectado');
      });
    });
  }

  return new NextResponse('WebSocket server running');
} 