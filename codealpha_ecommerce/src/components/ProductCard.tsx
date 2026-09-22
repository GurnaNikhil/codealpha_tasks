import React from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart
}) => {
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, e);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase bg-white/90 backdrop-blur-md text-neutral-700 rounded-full shadow-xs border border-neutral-200/60">
            {product.category}
          </span>
        </div>

        {/* Stock / Sale Pill */}
        {product.originalPrice && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded-full shadow-xs">
              Save ${(product.originalPrice - product.price).toFixed(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-neutral-800">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-400">
              ({product.ratingCount})
            </span>
            {product.stock <= 5 && (
              <span className="ml-auto text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-700 transition-colors">
            {product.title}
          </h3>

          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Bottom Price & Add Action */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-neutral-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-500 block">
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <button
            id={`btn-add-cart-${product.id}`}
            type="button"
            onClick={handleAddClick}
            disabled={product.stock === 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              justAdded
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
