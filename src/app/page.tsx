// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Aquí puedes poner cualquier lógica condicional si es necesario

  // Redirige directamente a /login
  redirect('/login');
}
