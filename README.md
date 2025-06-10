# Market Jals - Plataforma de Comercio Electrónico

Este es un proyecto de comercio electrónico desarrollado con Next.js, TypeScript y Tailwind CSS.

## Características Implementadas

- 🛍️ Catálogo de productos con búsqueda y filtrado
- 🔐 Autenticación de usuarios
- 🛒 Carrito de compras
- 💳 Proceso de pago seguro
- 📱 Diseño responsive
- 🔍 Búsqueda en tiempo real
- ⭐ Sistema de valoraciones

## Tecnologías Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- Firebase (Autenticación y Base de datos)
- Stripe (Procesamiento de pagos)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/market-jals.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar el servidor de desarrollo
npm run dev
```

## Estructura del Proyecto

```
src/
  ├── app/          # Rutas y páginas de la aplicación
  ├── components/   # Componentes reutilizables
  ├── lib/         # Utilidades y configuraciones
  ├── hooks/       # Custom hooks
  └── types/       # Definiciones de TypeScript
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviarnos pull requests.

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
