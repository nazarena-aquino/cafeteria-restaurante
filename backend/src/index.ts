import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ========================
// MIDDLEWARES DE SEGURIDAD
// ========================
app.use(helmet());
app.use(morgan('dev'));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: true, // permite cualquier origen en producción
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500,
  message: { success: false, error: 'Demasiadas solicitudes, intenta más tarde' },
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,             // suficiente para desarrollo y uso normal
  message: { success: false, error: 'Demasiados pedidos, espera un momento' },
});

app.use('/api/', limiter);
app.use('/api/orders', orderLimiter);

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ========================
// RUTAS
// ========================
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '☕ Cafetería API - Funcionando correctamente',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// Error handler global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

// ========================
// INICIAR SERVIDOR
// ========================
app.listen(PORT, () => {
  console.log(`\n☕ ================================`);
  console.log(`   Cafetería API corriendo`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`================================\n`);
});

export default app;
