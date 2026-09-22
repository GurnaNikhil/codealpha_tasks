import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request parser
  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Products
  app.get('/api/products', (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const sort = req.query.sort as string | undefined;

      const products = db.getProducts({ category, search, sort });
      res.json({ products });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    try {
      const product = db.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json({ product });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch product' });
    }
  });

  app.get('/api/categories', (req: Request, res: Response) => {
    try {
      const categories = db.getCategories();
      res.json({ categories });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch categories' });
    }
  });

  // Auth Helper
  const getAuthUser = (req: Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    const token = authHeader.split(' ')[1];
    return db.getUserByToken(token);
  };

  // Auth routes
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
      }
      const { user, token } = db.createUser(name, email, password);
      res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email },
        token
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const { user, token } = db.loginUser(email, password);
      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token
      });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Invalid email or password' });
    }
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      db.logoutToken(token);
    }
    res.json({ success: true });
  });

  // Orders routes
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      const { customerName, customerEmail, shippingAddress, items, paymentMethod, discount } = req.body;

      if (!customerName || !customerEmail || !shippingAddress || !items || !paymentMethod) {
        res.status(400).json({ error: 'Missing required order fields' });
        return;
      }

      const order = db.createOrder({
        userId: user?.id,
        customerName,
        customerEmail,
        shippingAddress,
        items,
        paymentMethod,
        discount
      });

      res.status(201).json({ order });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to process order' });
    }
  });

  app.get('/api/orders', (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      const email = (req.query.email as string) || user?.email;
      const orders = db.getOrders(user?.id, email);
      res.json({ orders });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch orders' });
    }
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json({ order });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch order' });
    }
  });

  // --- Vite Frontend Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
