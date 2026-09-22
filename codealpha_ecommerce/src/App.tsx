import React from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { CartDrawer } from './components/CartDrawer';
import { Checkout } from './components/Checkout';
import { OrderConfirmation } from './components/OrderConfirmation';
import { OrderHistory } from './components/OrderHistory';
import { AuthModal } from './components/AuthModal';
import { Product, CartItem, User, Order, ActiveView } from './types';
import { fetchProducts, fetchCategories, getCurrentUser, logoutUser } from './services/api';
import { SlidersHorizontal, PackageOpen, Database, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<{ name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('featured');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [activeView, setActiveView] = React.useState<ActiveView>('catalog');
  const [isCartOpen, setIsCartOpen] = React.useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState<boolean>(false);
  const [latestOrder, setLatestOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [discountRate, setDiscountRate] = React.useState<number>(0);
  const [promoCode, setPromoCode] = React.useState<string>('');

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = React.useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('app_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem('app_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to sync cart', e);
    }
  }, [cartItems]);

  // Initial data loading (Auth & Products)
  React.useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [me, prods, cats] = await Promise.all([
          getCurrentUser(),
          fetchProducts({ category: 'All', sort: 'featured' }),
          fetchCategories()
        ]);
        if (me) setUser(me);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Initialization error', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Filter & Search update
  const loadFilteredProducts = React.useCallback(async (cat: string, search: string, sort: string) => {
    setLoading(true);
    try {
      const prods = await fetchProducts({ category: cat, search, sort });
      setProducts(prods);
    } catch (err) {
      console.error('Failed to fetch filtered products', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    loadFilteredProducts(catName, searchQuery, sortBy);
    if (activeView !== 'catalog') {
      setActiveView('catalog');
    }
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    loadFilteredProducts(selectedCategory, q, sortBy);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    loadFilteredProducts(selectedCategory, searchQuery, sort);
  };

  // Cart Management
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(item.product.stock, newQty) } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleApplyPromo = (code: string) => {
    if (code.toUpperCase() === 'SAVE10') {
      setDiscountRate(0.1);
      setPromoCode('SAVE10');
      return true;
    }
    return false;
  };

  // Product Selection
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Buy Now
  const handleBuyNow = (product: Product, quantity: number) => {
    handleAddToCart(product, quantity);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Checkout and Order Complete
  const handleOrderComplete = (order: Order) => {
    setLatestOrder(order);
    setCartItems([]);
    setActiveView('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Use code <strong>SAVE10</strong> for 10% off • Free shipping on orders over $100</span>
      </div>

      {/* Main Navigation */}
      <Navbar
        user={user}
        cartItems={cartItems}
        activeView={activeView}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setActiveView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        discountRate={discountRate}
        promoCode={promoCode}
        onApplyPromo={handleApplyPromo}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
        }}
      />

      {/* Main Content Areas based on Active View */}
      <main className="flex-1">
        {activeView === 'product-detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => {
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {activeView === 'checkout' && (
          <Checkout
            user={user}
            cartItems={cartItems}
            discountRate={discountRate}
            promoCode={promoCode}
            onBack={() => {
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {activeView === 'order-confirmation' && latestOrder && (
          <OrderConfirmation
            order={latestOrder}
            onNavigate={(view) => {
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'order-history' && (
          <OrderHistory
            user={user}
            onNavigate={(view) => {
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewOrderReceipt={(order) => {
              setLatestOrder(order);
              setActiveView('order-confirmation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'catalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {/* Catalog Subheader / Category Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 mb-8">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    id={`cat-filter-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200'
                    }`}
                  >
                    {cat.name}
                    <span className={`ml-1.5 text-[10px] ${selectedCategory === cat.name ? 'text-neutral-300' : 'text-neutral-400'}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sorting options */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
                <span className="text-xs text-neutral-500 font-medium">Sort:</span>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-white border border-neutral-200 text-neutral-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-400"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Results count & status */}
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-6">
              <span>
                Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-neutral-500 font-medium">Loading products from Express backend...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200 p-8">
                <PackageOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-neutral-800">No products found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any products matching your current criteria. Try resetting the search or category filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    loadFilteredProducts('All', '', sortBy);
                  }}
                  className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <span className="font-semibold text-neutral-950 text-base">SimpleStore</span>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Full-stack e-commerce experience with interactive shopping cart, product details, order processing, and user authentication backed by Express.js and local database persistence.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <Database className="w-3.5 h-3.5" />
                <span>Express API & Database Active</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Shop Categories</h4>
              <ul className="space-y-2 text-xs text-neutral-600">
                {categories.slice(1).map((cat) => (
                  <li key={cat.name}>
                    <button
                      onClick={() => handleCategorySelect(cat.name)}
                      className="hover:text-neutral-900 hover:underline"
                    >
                      {cat.name} ({cat.count})
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Customer Support</h4>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li><button onClick={() => setActiveView('order-history')} className="hover:text-neutral-900 hover:underline">Track Past Orders</button></li>
                <li><span className="hover:text-neutral-900">Shipping & Delivery Policies</span></li>
                <li><span className="hover:text-neutral-900">30-Day Money-Back Guarantee</span></li>
                <li><span className="hover:text-neutral-900">Terms of Service & Privacy</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Account & Security</h4>
              <p className="text-xs text-neutral-500 mb-3">
                {user ? `Logged in as ${user.name} (${user.email})` : 'Guest shopper. Register to track orders seamlessly across devices.'}
              </p>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-medium hover:bg-neutral-50 text-neutral-700"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
            <p>© 2026 SimpleStore. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit SSL Encrypted Checkout
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
