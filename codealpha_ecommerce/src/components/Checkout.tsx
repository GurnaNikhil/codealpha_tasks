import React from 'react';
import { ArrowLeft, ShieldCheck, CreditCard, Banknote, Truck, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { CartItem, User, ShippingAddress, Order } from '../types';
import { submitOrder } from '../services/api';

interface CheckoutProps {
  user: User | null;
  cartItems: CartItem[];
  discountRate: number;
  promoCode: string;
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({
  user,
  cartItems,
  discountRate,
  onBack,
  onOrderComplete
}) => {
  const [formData, setFormData] = React.useState<ShippingAddress>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 019-2834',
    street: '124 Market Street, Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States'
  });

  const [paymentMethod, setPaymentMethod] = React.useState<'card' | 'cod' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = React.useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = React.useState('08/28');
  const [cardCvc, setCardCvc] = React.useState('842');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Sync with user if user logs in during session
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email
      }));
    }
  }, [user]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = subtotal * discountRate;
  const shippingFee = subtotal >= 100 || subtotal === 0 ? 0 : 9.99;
  const tax = Math.max(0, subtotal - discount) * 0.08;
  const total = Math.max(0, subtotal - discount) + shippingFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.street.trim() || !formData.city.trim() || !formData.zipCode.trim()) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      const paymentLabel =
        paymentMethod === 'card'
          ? `Credit Card (ending in ${cardNumber.slice(-4) || '4242'})`
          : paymentMethod === 'paypal'
          ? 'PayPal Checkout'
          : 'Cash on Delivery (Pay upon delivery)';

      const createdOrder = await submitOrder({
        customerName: formData.fullName,
        customerEmail: formData.email,
        shippingAddress: formData,
        items: orderItems,
        paymentMethod: paymentLabel,
        discount: Math.round(discount * 100) / 100
      });

      onOrderComplete(createdOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        id="btn-checkout-back"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Return to shopping</span>
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
          Secure Order Checkout
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Complete your delivery and payment details below to place your order.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Details */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </div>
                  <h2 className="text-base font-semibold text-neutral-900">
                    Shipping & Delivery Address
                  </h2>
                </div>
                <Truck className="w-5 h-5 text-neutral-400" />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="123 Main St, Suite 100"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    ZIP / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="94105"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </div>
                  <h2 className="text-base font-semibold text-neutral-900">
                    Payment Method
                  </h2>
                </div>
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>

              {/* Payment selector options */}
              <div className="mt-5 space-y-3">
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-neutral-900 bg-neutral-50/70 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-neutral-900"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-neutral-900 block">
                        Credit or Debit Card
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Instant encrypted 256-bit payment simulation
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-neutral-700" />
                </label>

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• 4242"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          Security CVC
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-neutral-900 bg-neutral-50/70 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-neutral-900"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-neutral-900 block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Pay cash when the courier arrives at your door
                      </span>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-neutral-700" />
                </label>

                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-neutral-900 bg-neutral-50/70 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="text-neutral-900"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-neutral-900 block">
                        PayPal
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Connect with one click via PayPal sandbox
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-800 italic">PayPal</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs sticky top-24">
              <h3 className="text-base font-semibold text-neutral-900 pb-3 border-b border-neutral-100">
                Order Review ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
              </h3>

              {/* Items List */}
              <div className="py-4 space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200/60 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-900 truncate">
                        {item.product.title}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-neutral-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({(discountRate * 100).toFixed(0)}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-neutral-900 font-medium">
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-neutral-900 font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-neutral-200 flex justify-between text-base font-bold text-neutral-950">
                  <span>Order Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                id="btn-submit-order"
                type="submit"
                disabled={isProcessing || cartItems.length === 0}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Pay ${total.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted transaction • 30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
