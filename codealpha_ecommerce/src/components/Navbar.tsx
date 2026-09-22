import React from 'react';
import { ShoppingBag, Search, User as UserIcon, Package, LogOut, ChevronDown, Store } from 'lucide-react';
import { User, CartItem, ActiveView } from '../types';

interface NavbarProps {
  user: User | null;
  cartItems: CartItem[];
  activeView: ActiveView;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (view: ActiveView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  cartItems,
  activeView,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenAuth,
  onLogout,
  onNavigate
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <button
          id="nav-brand-logo"
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <Store className="w-5 h-5 text-neutral-100" />
          </div>
          <div>
            <span className="font-semibold text-neutral-900 tracking-tight text-lg block leading-none">
              SimpleStore
            </span>
            <span className="text-[11px] text-neutral-500 font-medium tracking-wide uppercase">
              E-Commerce
            </span>
          </div>
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-input"
              type="text"
              placeholder="Search products, gear, accessories..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activeView !== 'catalog') {
                  onNavigate('catalog');
                }
              }}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-transparent rounded-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-300 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 bg-neutral-200/60 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Navigation, Auth, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Shop button */}
          <button
            id="nav-shop-button"
            onClick={() => onNavigate('catalog')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'catalog'
                ? 'text-neutral-900 bg-neutral-100'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Shop
          </button>

          {/* Orders quick link */}
          <button
            id="nav-orders-button"
            onClick={() => onNavigate('order-history')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'order-history'
                ? 'text-neutral-900 bg-neutral-100'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden md:inline">Orders</span>
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <button
                id="nav-user-menu-button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-300 transition-colors bg-white text-sm text-neutral-800"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate font-medium hidden md:inline">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-30 text-sm">
                    <div className="px-3.5 py-2 border-b border-neutral-100">
                      <p className="font-semibold text-neutral-900 truncate">{user.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('order-history');
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-neutral-500" />
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              id="nav-login-button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Trigger */}
          <button
            id="nav-cart-button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalCartCount > 0 && (
              <span className="bg-white text-neutral-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search row */}
      <div className="sm:hidden px-4 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (activeView !== 'catalog') {
                onNavigate('catalog');
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-transparent rounded-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-300 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};
