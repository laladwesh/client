import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import blogsRoutes from './routes/blogs.js';
import adminApiRoutes from './routes/adminApi.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/users', usersRoutes);
// AdminJS dashboard (protected by existing JWT + admin middleware)
import { protect, admin } from './middleware/auth.js';
import adminRouter from './adminjs.js';
app.use('/admin',  adminRouter);

app.get('/', (req, res) => res.send('Backend API running'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));