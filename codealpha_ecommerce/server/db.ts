import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  stock: number;
  image: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  isFeatured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  createdAt: string;
  estimatedDelivery: string;
}

interface DatabaseSchema {
  products: Product[];
  users: User[];
  orders: Order[];
  sessions: Record<string, string>; // token -> userId
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Aura Sound Pro Wireless Noise-Cancelling Headphones',
    category: 'Audio & Tech',
    price: 249.99,
    originalPrice: 299.99,
    rating: 4.9,
    ratingCount: 142,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in studio-grade acoustic clarity with active adaptive noise cancellation, 40-hour continuous battery life, and ultra-soft memory foam ear cushions.',
    features: [
      'Hybrid active noise cancellation with dual-sensor microphones',
      'Up to 40 hours of playback on a single charge',
      'Quick charging: 10 minutes gives 4 hours of listening',
      'Ultra-low latency Bluetooth 5.3 with multipoint pairing',
      'Custom EQ tuning via companion interface'
    ],
    specs: {
      'Driver Size': '40mm Neodymium',
      'Frequency Response': '20Hz - 40kHz',
      'Weight': '250g',
      'Charging Port': 'USB-C Fast Charging'
    },
    isFeatured: true
  },
  {
    id: 'prod-2',
    title: 'Minimalist Chrono Sapphire Wristwatch',
    category: 'Accessories',
    price: 185.00,
    originalPrice: 220.00,
    rating: 4.8,
    ratingCount: 96,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'Crafted with surgical-grade 316L stainless steel and scratch-resistant sapphire crystal glass. An understated modern timepiece built for everyday precision.',
    features: [
      'Swiss quartz analog movement with date calendar aperture',
      'Scratch-resistant domed sapphire crystal',
      'Interchangeable Italian full-grain leather band',
      '5 ATM / 50 meters water resistance'
    ],
    specs: {
      'Case Diameter': '40mm',
      'Case Thickness': '7.8mm',
      'Band Width': '20mm',
      'Movement': 'Swiss Quartz Caliber'
    },
    isFeatured: true
  },
  {
    id: 'prod-3',
    title: 'Ergonomic Hot-Swappable Mechanical Keyboard',
    category: 'Electronics',
    price: 139.50,
    rating: 4.7,
    ratingCount: 88,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    description: 'Anodized aluminum frame, gasket-mounted sound dampening, and hot-swappable switches make this the ultimate tactile typing companion for developers and creators.',
    features: [
      'Gasket-mount construction for soft, cushioned keystrokes',
      'Pre-lubed linear switches for smooth, quiet typing',
      'Per-key RGB backlight with programmable profiles',
      'Tri-mode connectivity: 2.4GHz wireless, Bluetooth 5.1, and USB-C'
    ],
    specs: {
      'Layout': '75% Compact (82 Keys)',
      'Battery Capacity': '4000mAh',
      'Keycaps': 'Double-shot PBT Cherry Profile',
      'Compatibility': 'macOS, Windows, Linux, iOS'
    },
    isFeatured: true
  },
  {
    id: 'prod-4',
    title: 'Handcrafted Ceramic Dripper & Mug Set',
    category: 'Home & Kitchen',
    price: 46.00,
    originalPrice: 55.00,
    rating: 4.9,
    ratingCount: 64,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    description: 'Each piece is hand-thrown and kiln-fired with a matte stone reactive glaze. Engineered for optimal thermal retention and slow pour-over coffee rituals.',
    features: [
      'Internal spiral ribs promote balanced extraction rates',
      'Lead-free, non-toxic stoneware clay construction',
      'Microwave and dishwasher safe durable design',
      'Includes cone dripper, server carafe, and 350ml mug'
    ],
    specs: {
      'Material': 'High-density Stoneware',
      'Capacity': 'Server 500ml / Mug 350ml',
      'Finish': 'Matte Oatmeal Speckle',
      'Origin': 'Artisan Handcrafted'
    }
  },
  {
    id: 'prod-5',
    title: 'Merino Wool Thermal Everyday Crewneck',
    category: 'Apparel',
    price: 98.00,
    rating: 4.8,
    ratingCount: 110,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    description: 'Spun from 100% superfine Australian merino wool. Naturally moisture-wicking, odor-resistant, and climate-regulating across seasons.',
    features: [
      'Superfine 18.5 micron merino fibers for zero itch comfort',
      'Natural temperature regulation keeps you warm in cold and cool in heat',
      'Reinforced collar, hem, and cuffs for shape retention',
      'Machine washable on gentle wool cycle'
    ],
    specs: {
      'Fabric Weight': '260 gsm Midweight',
      'Fiber': '100% Responsible Wool Standard Certified',
      'Fit': 'Tailored Regular',
      'Care': 'Cold water gentle wash'
    }
  },
  {
    id: 'prod-6',
    title: 'Ultra-Slim 15.6" 4K Portable IPS Monitor',
    category: 'Electronics',
    price: 269.00,
    originalPrice: 319.00,
    rating: 4.7,
    ratingCount: 73,
    stock: 9,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    description: 'Expand your visual workspace anywhere. Features crisp 3840x2160 UHD resolution, 100% sRGB color gamut, and single-cable USB-C power/signal delivery.',
    features: [
      'Stunning 4K UHD IPS panel with 178-degree wide viewing angle',
      'Single USB-C cable for both video transmission and power',
      'Built-in stereo speakers and 3.5mm audio headphone jack',
      'Magnetic origami smart protective stand case included'
    ],
    specs: {
      'Screen Size': '15.6 inches (3840 x 2160)',
      'Brightness': '400 cd/m²',
      'Ports': '2x Full-feature USB-C, 1x Mini-HDMI',
      'Thickness': '5.5mm at thinnest point'
    },
    isFeatured: true
  },
  {
    id: 'prod-7',
    title: 'Full-Grain Leather Weekender Duffle',
    category: 'Accessories',
    price: 215.00,
    originalPrice: 250.00,
    rating: 4.9,
    ratingCount: 52,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted from vegetable-tanned full-grain cowhide that develops a rich, golden patina over years of travel. Features separate shoe compartment and brass hardware.',
    features: [
      'Ventilated side compartment for footwear or laundry',
      'Solid brass YKK antique finish dual zippers',
      'Detachable padded ergonomic leather shoulder strap',
      'Compliant with standard airline carry-on overhead dimensions'
    ],
    specs: {
      'Dimensions': '52cm x 28cm x 26cm',
      'Capacity': '42 Liters',
      'Weight': '1.85 kg',
      'Hardware': 'Antique Solid Brass'
    }
  },
  {
    id: 'prod-8',
    title: 'Cold Brew Precision Vacuum Carafe',
    category: 'Home & Kitchen',
    price: 39.95,
    rating: 4.6,
    ratingCount: 89,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    description: 'Silky smooth, low-acidity cold brew extracted over 12-24 hours. Features a dual-mesh 304 stainless steel microfilter that blocks all sediment.',
    features: [
      'Extra-fine stainless steel mesh filter prevents bitter sludge',
      'BPA-free silicone airtight seal locks in flavor for up to 2 weeks',
      'Thermal shock-resistant borosilicate glass body',
      'Ergonomic nonslip handle and drip-free pouring spout'
    ],
    specs: {
      'Capacity': '1.5 Liters (approx. 6 cups)',
      'Filter': 'Laser-cut 304 Stainless Steel',
      'Glass Type': 'Borosilicate (-20°C to 150°C)',
      'Cleaning': 'All parts dishwasher safe'
    }
  },
  {
    id: 'prod-9',
    title: 'Smart Ambient Nordic Light Bar & Lamp',
    category: 'Home & Living',
    price: 78.00,
    originalPrice: 92.00,
    rating: 4.8,
    ratingCount: 114,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    description: 'Sculptural matte finish aluminum luminaire providing diffuse, flicker-free circadian lighting. Seamless capacitive touch dimming and warm-to-cool white spectrum.',
    features: [
      'Stepless touch dimming from 1% to 100% luminance',
      'Adjustable color temperature (2700K warm sunrise to 6500K daylight)',
      'Eye-care flicker-free optical diffuser with CRI > 95',
      'Weighted silicone padded base prevents desk scratches'
    ],
    specs: {
      'Luminous Flux': '900 Lumens',
      'Power Consumption': '12 Watts',
      'LED Lifespan': '50,000 Hours',
      'Materials': 'Aviation-grade Aluminum & Polycarbonate'
    }
  },
  {
    id: 'prod-10',
    title: 'All-Weather Waterproof Technical Shell Jacket',
    category: 'Apparel',
    price: 145.00,
    rating: 4.7,
    ratingCount: 67,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    description: 'Engineered for unpredictable forecasts. Three-layer microporous membrane with 20,000mm hydrostatic head rating and taped seam construction.',
    features: [
      '20,000mm waterproof / 15,000g breathability rating',
      'Fully taped waterproof seams and AquaGuard water-repellent zippers',
      'Dual underarm zipper vents for rapid thermal dumping',
      'Adjustable storm hood with stiffened visor'
    ],
    specs: {
      'Membrane': '3-Layer HydroShield Tech',
      'Weight': '380g (Size Medium)',
      'Pockets': '2 hand pockets, 1 internal chest pocket, 1 pass pocket',
      'Fit': 'Athletic regular with room for base layers'
    }
  },
  {
    id: 'prod-11',
    title: 'Precision Ergonomic Wireless Mouse',
    category: 'Electronics',
    price: 64.99,
    rating: 4.9,
    ratingCount: 156,
    stock: 28,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    description: 'Designed to fit the natural contours of your hand with a 57° ergonomic vertical angle, reducing wrist muscle strain and fatigue over long work hours.',
    features: [
      '4000 DPI high-precision optical sensor works on any surface',
      'Whisper-quiet acoustic switches reduce click noise by 90%',
      'Rechargeable via USB-C with 70-day battery life per full charge',
      'Multi-device flow across up to 3 computers via Bluetooth/2.4G'
    ],
    specs: {
      'Sensor': 'Advanced Darkfield Laser / Optical',
      'Angle': '57° Natural Handshake Posture',
      'Buttons': '6 customizable buttons',
      'Weight': '135g'
    }
  },
  {
    id: 'prod-12',
    title: 'Ultrasonic Ceramic Aromatherapy Mist Diffuser',
    category: 'Home & Living',
    price: 52.00,
    originalPrice: 60.00,
    rating: 4.8,
    ratingCount: 82,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    description: 'Transform your living space into a tranquil oasis. Ultrasonic 2.4MHz vibration diffuses pure essential oil molecules without heat damage.',
    features: [
      'Handmade stone ceramic cover with architectural fluted texture',
      'Ultrasonic quiet operation (<20dB) suitable for nightstands',
      'Auto shut-off protection when water reservoir empties',
      'Warm ambient breathing nightlight function'
    ],
    specs: {
      'Water Capacity': '200ml (Up to 8 hours continuous mist)',
      'Coverage Area': 'Up to 300 sq ft',
      'Mist Modes': 'Continuous or 30s Intermittent',
      'Material': 'Porcelain Ceramic & BPA-Free Reservoir'
    }
  }
];

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
          users: parsed.users || [],
          orders: parsed.orders || [],
          sessions: parsed.sessions || {}
        };
      }
    } catch (err) {
      console.warn('Failed to parse existing db file, resetting with initial state:', err);
    }

    // Default seeded database
    const initialUser: User = {
      id: 'user-demo-1',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      passwordHash: hashPassword('password123'),
      createdAt: new Date().toISOString()
    };

    const initialOrder: Order = {
      id: 'ord-1001',
      orderNumber: 'ORD-98421',
      userId: 'user-demo-1',
      customerName: 'Alex Morgan',
      customerEmail: 'alex@example.com',
      shippingAddress: {
        fullName: 'Alex Morgan',
        email: 'alex@example.com',
        phone: '+1 (555) 234-5678',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zipCode: '97477',
        country: 'United States'
      },
      items: [
        {
          productId: 'prod-1',
          title: 'Aura Sound Pro Wireless Noise-Cancelling Headphones',
          price: 249.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
        },
        {
          productId: 'prod-4',
          title: 'Handcrafted Ceramic Dripper & Mug Set',
          price: 46.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
        }
      ],
      subtotal: 295.99,
      shippingFee: 0,
      tax: 23.68,
      discount: 0,
      total: 319.67,
      paymentMethod: 'Credit Card (ending in 4242)',
      status: 'Shipped',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      estimatedDelivery: 'Sep 24, 2026'
    };

    const schema: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      users: [initialUser],
      orders: [initialOrder],
      sessions: {}
    };

    this.save(schema);
    return schema;
  }

  private save(data?: DatabaseSchema) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  // --- Products ---
  public getProducts(params?: { category?: string; search?: string; sort?: string }): Product[] {
    let result = [...this.data.products];

    if (params?.category && params.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (params?.sort) {
      switch (params.sort) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'featured':
        default:
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return result;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public getCategories(): { name: string; count: number }[] {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const p of this.data.products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
      total++;
    }
    const categories = [{ name: 'All', count: total }];
    for (const [name, count] of Object.entries(counts)) {
      categories.push({ name, count });
    }
    return categories;
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(name: string, email: string, password: string): { user: User; token: string } {
    if (this.findUserByEmail(email)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: 'user-' + crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    const token = 'token-' + crypto.randomUUID();
    this.data.sessions[token] = newUser.id;
    this.save();

    return { user: newUser, token };
  }

  public loginUser(email: string, password: string): { user: User; token: string } {
    const user = this.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    if (user.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid email or password.');
    }

    const token = 'token-' + crypto.randomUUID();
    this.data.sessions[token] = user.id;
    this.save();

    return { user, token };
  }

  public getUserByToken(token: string): User | undefined {
    const userId = this.data.sessions[token];
    if (!userId) return undefined;
    return this.findUserById(userId);
  }

  public logoutToken(token: string) {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
    }
  }

  // --- Orders ---
  public createOrder(data: {
    userId?: string;
    customerName: string;
    customerEmail: string;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    paymentMethod: string;
    discount?: number;
  }): Order {
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    // Validate and deduct stock
    for (const item of data.items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.title}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.title}". Only ${product.stock} left in stock.`);
      }
    }

    // Deduct stock
    for (const item of data.items) {
      const product = this.getProductById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }

    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = data.discount || 0;
    const shippingFee = subtotal >= 100 ? 0 : 9.99;
    const tax = Math.round(Math.max(0, subtotal - discount) * 0.08 * 100) / 100;
    const total = Math.round((Math.max(0, subtotal - discount) + shippingFee + tax) * 100) / 100;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${randomSuffix}`;

    // Delivery date 3 business days from now
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const newOrder: Order = {
      id: 'ord-' + crypto.randomUUID(),
      orderNumber,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      shippingAddress: data.shippingAddress,
      items: data.items,
      subtotal: Math.round(subtotal * 100) / 100,
      shippingFee,
      tax,
      discount,
      total,
      paymentMethod: data.paymentMethod,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      estimatedDelivery
    };

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public getOrders(userId?: string, email?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId || (email && o.customerEmail.toLowerCase() === email.toLowerCase()));
    }
    if (email) {
      return this.data.orders.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
    }
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }
}

export const db = new Database();
