import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { createServer as createViteServer } from 'vite';
import apiRouter from './routes/api.js';
import prisma from './db.js';

dotenv.config();

// Ensure public and upload directories exist
const ensureDirectories = () => {
  const publicDir = path.join(process.cwd(), 'public');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};
ensureDirectories();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS configuration
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health checks
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Static assets
  app.use(express.static(path.join(process.cwd(), 'public')));
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // API router
  app.use('/api', apiRouter);

  // Favicon route
  app.get('/favicon.png', async (req, res) => {
    try {
      const faviconPath = path.join(process.cwd(), 'public', 'favicon.png');
      if (fs.existsSync(faviconPath)) {
        return res.sendFile(faviconPath);
      }
      const company = await prisma.company.findFirst();
      if (company && company.logo_url) {
        const logoPath = path.join(process.cwd(), 'public', company.logo_url.replace('/uploads/', ''));
        if (fs.existsSync(logoPath)) {
          const circleMask = Buffer.from(
            `<svg width="32" height="32"><circle cx="16" cy="16" r="16" fill="white"/></svg>`
          );
          await sharp(logoPath)
            .resize(32, 32)
            .composite([{ input: circleMask, blend: 'dest-in' }])
            .toFormat('png')
            .toFile(faviconPath);
          return res.sendFile(faviconPath);
        }
      }
      res.status(404).send('Favicon not found');
    } catch (error) {
      console.error('Error sirviendo favicon:', error);
      res.status(500).send('Error generating favicon');
    }
  });

  // Frontend integration: Vite middleware in development, static in production
  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        root: path.join(process.cwd(), 'client'),
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error('Vite middleware error:', err);
    }
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist'))
      ? path.join(process.cwd(), 'dist')
      : path.join(process.cwd(), 'client', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling
  app.use((err, req, res, next) => {
    console.error('Error del servidor:', err.stack || err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      error: err.message || 'Error interno del servidor'
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API and Frontend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
