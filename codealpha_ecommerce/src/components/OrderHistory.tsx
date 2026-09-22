import React from 'react';
import { Package, Truck, Calendar, ShoppingBag, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Order, User, ActiveView } from '../types';
import { fetchUserOrders } from '../services/api';

interface OrderHistoryProps {
  user: User | null;
  onNavigate: (view: ActiveView) => void;
  onViewOrderReceipt?: (order: Order) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  user,
  onNavigate,
  onViewOrderReceipt
}) => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchEmail, setSearchEmail] = React.useState(user?.email || '');

  const loadOrders = React.useCallback(async (email?: string) => {
    setLoading(true);
    try {
      const data = await fetchUserOrders(email);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders(user?.email);
  }, [user, loadOrders]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      loadOrders(searchEmail.trim());
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Confirmed':
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
            Order History & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Track live delivery status, review past purchases, and view invoices.
          </p>
        </div>

        <button
          id="btn-refresh-orders"
          onClick={() => loadOrders(user?.email || searchEmail)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Guest lookup bar if not logged in */}
      {!user && (
        <div className="mb-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Lookup orders placed as a guest:
              </label>
              <input
                type="email"
                placeholder="Enter customer email address"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto self-end px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              Search Orders
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-neutral-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-neutral-300" />
          <p className="text-sm">Fetching recorded orders from database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">No orders recorded yet</h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
            When you complete a purchase, your order records will be permanently saved here in the database.
          </p>
          <button
            id="btn-empty-orders-shop"
            onClick={() => onNavigate('catalog')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Store Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:border-neutral-300 transition-colors"
            >
              {/* Order Header */}
              <div className="p-4 sm:p-5 bg-neutral-50/70 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-medium block">
                      Order Placed
                    </span>
                    <span className="font-semibold text-neutral-900 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-medium block">
                      Total
                    </span>
                    <span className="font-bold text-neutral-900 mt-0.5 block">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-medium block">
                      Ship To
                    </span>
                    <span className="font-medium text-neutral-800 mt-0.5 block truncate max-w-[130px]">
                      {order.shippingAddress.fullName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>

                  <span className="text-neutral-400 text-xs font-mono">
                    {order.orderNumber}
                  </span>
                </div>
              </div>

              {/* Order Details & Items */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Item preview list */}
                  <div className="flex-1 space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover bg-neutral-100 border border-neutral-200/60 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-medium text-neutral-900 truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Qty: {item.quantity} • ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery ETA and Action */}
                  <div className="lg:w-64 pt-4 lg:pt-0 lg:border-l lg:border-neutral-100 lg:pl-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                        <Truck className="w-4 h-4 text-neutral-700" />
                        <span>Estimated Delivery:</span>
                      </div>
                      <p className="text-sm font-bold text-neutral-900">
                        {order.estimatedDelivery}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Carrier: Express Priority Logistics
                      </p>
                    </div>

                    {onViewOrderReceipt && (
                      <button
                        onClick={() => onViewOrderReceipt(order)}
                        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <span>View Order Receipt</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
