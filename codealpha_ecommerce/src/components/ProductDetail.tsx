import React from 'react';
import { ArrowLeft, Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Check, Plus, Minus } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const [addedNotice, setAddedNotice] = React.useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb / Back button */}
      <button
        id="btn-back-to-catalog"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950 font-medium mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to all products</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Showcase */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="relative aspect-4/3 sm:aspect-square w-full bg-neutral-50 overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-md text-neutral-800 rounded-full shadow-xs border border-neutral-200">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
              <Truck className="w-5 h-5 mx-auto text-neutral-700 mb-1.5" />
              <p className="text-xs font-semibold text-neutral-800">Free Delivery</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Orders over $100</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
              <ShieldCheck className="w-5 h-5 mx-auto text-neutral-700 mb-1.5" />
              <p className="text-xs font-semibold text-neutral-800">2-Year Warranty</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Full coverage</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
              <RefreshCw className="w-5 h-5 mx-auto text-neutral-700 mb-1.5" />
              <p className="text-xs font-semibold text-neutral-800">30-Day Returns</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Hassle-free refund</p>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-current'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-neutral-900">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400">
                • {product.ratingCount} verified reviews
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Price & Savings */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-neutral-950">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-neutral-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs font-medium text-neutral-700">
                {product.stock > 0
                  ? product.stock <= 5
                    ? `Only ${product.stock} items remaining in stock`
                    : 'In stock and ready to ship'
                  : 'Currently out of stock'}
              </span>
            </div>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector and Purchase CTAs */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Quantity Control */}
                <div className="flex items-center border border-neutral-300 rounded-xl bg-white px-2 py-1.5 justify-between sm:justify-start">
                  <button
                    id="btn-qty-minus"
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-semibold text-neutral-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    id="btn-qty-plus"
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  id="btn-detail-add-cart"
                  type="button"
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-sm transition-all shadow-sm ${
                    addedNotice
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart • ${(product.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>

                {/* Buy Now */}
                <button
                  id="btn-detail-buy-now"
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="py-3 px-6 rounded-xl font-medium text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  Highlights & Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600">
                      <div className="w-4 h-4 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-neutral-700" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                      <span className="text-neutral-400 block text-[11px] font-medium uppercase tracking-wider">{key}</span>
                      <span className="font-medium text-neutral-800 mt-0.5 block">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
