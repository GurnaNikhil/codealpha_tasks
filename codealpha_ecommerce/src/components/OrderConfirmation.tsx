import React from 'react';
import { CheckCircle2, Package, Truck, Printer, ShoppingBag, ArrowRight } from 'lucide-react';
import { Order, ActiveView } from '../types';

interface OrderConfirmationProps {
  order: Order;
  onNavigate: (view: ActiveView) => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  onNavigate
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-xs">
        {/* Header Badge */}
        <div className="text-center pb-8 border-b border-neutral-100">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-3">
            Thank you for your order!
          </h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            We've sent a receipt and tracking confirmation to{' '}
            <span className="font-semibold text-neutral-800">{order.customerEmail}</span>.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-neutral-100 text-xs">
          <div>
            <span className="text-neutral-400 block uppercase tracking-wider font-medium text-[10px]">Order Number</span>
            <span className="font-bold text-neutral-900 mt-0.5 block">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-neutral-400 block uppercase tracking-wider font-medium text-[10px]">Date Placed</span>
            <span className="font-medium text-neutral-800 mt-0.5 block">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block uppercase tracking-wider font-medium text-[10px]">Estimated Delivery</span>
            <span className="font-semibold text-emerald-700 mt-0.5 block">{order.estimatedDelivery}</span>
          </div>
          <div>
            <span className="text-neutral-400 block uppercase tracking-wider font-medium text-[10px]">Total Paid</span>
            <span className="font-bold text-neutral-950 mt-0.5 block">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Purchased Items */}
        <div className="py-6 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-neutral-500" />
            Purchased Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-neutral-200"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-neutral-100 text-xs">
          <div>
            <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-neutral-500" />
              Shipping Destination
            </h4>
            <div className="text-neutral-600 leading-relaxed">
              <p className="font-medium text-neutral-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-1 text-neutral-500">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-2">Payment Details</h4>
            <div className="space-y-1.5 text-neutral-600">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="text-neutral-900 font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-neutral-900 font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-medium">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-neutral-900 font-medium">
                  {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="text-neutral-900 font-medium">${order.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-950 text-sm">
                <span>Total Amount:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-print-receipt"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="btn-track-orders"
              onClick={() => onNavigate('order-history')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-xs font-semibold transition-colors"
            >
              <Package className="w-4 h-4" />
              View My Orders
            </button>

            <button
              id="btn-continue-shopping"
              onClick={() => onNavigate('catalog')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
