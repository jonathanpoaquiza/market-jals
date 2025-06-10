import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  stock: number;
  onAddToCart: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  imageUrl,
  rating,
  stock,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      await onAddToCart(id);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className="text-yellow-400">
        {index < Math.floor(rating) ? (
          <StarIcon className="h-5 w-5" />
        ) : (
          <StarOutlineIcon className="h-5 w-5" />
        )}
      </span>
    ));
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        {stock <= 5 && stock > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            ¡Últimas {stock} unidades!
          </div>
        )}
        {stock === 0 && (
          <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-sm">
            Agotado
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>
        
        <div className="flex items-center mb-2">
          {renderStars()}
          <span className="text-gray-600 text-sm ml-2">({rating})</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isLoading || stock === 0}
            className={`
              flex items-center px-4 py-2 rounded-full
              ${stock === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
              text-white transition-colors duration-200
            `}
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            {isLoading ? 'Agregando...' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}; 