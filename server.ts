import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const rootDir = process.cwd();
const configPath = path.join(rootDir, 'firebase-applet-config.json');
const uploadsDir = path.join(rootDir, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

interface FirebaseConfigFile {
  projectId?: string;
}

let firebaseProjectId = '';
if (fs.existsSync(configPath)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as FirebaseConfigFile;
    firebaseProjectId = parsed.projectId ?? '';
  } catch (err) {
    console.error('Failed to read firebase-applet-config.json:', err);
  }
}

const adminApp =
  firebaseProjectId && firebaseProjectId !== 'remixed-project-id'
    ? getApps().length > 0
      ? getApp()
      : initializeApp({ projectId: firebaseProjectId })
    : null;

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed formats: JPEG, PNG, WEBP, GIF, SVG.'));
    }
  },
});

interface AuthenticatedRequest extends Request {
  verifiedEmail?: string;
}

async function requireVerifiedFirebaseUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!adminApp) {
    res.status(503).json({ error: 'Firebase project is not configured on the server.' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Authorization Bearer token.' });
    return;
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken) {
    res.status(401).json({ error: 'Empty ID token.' });
    return;
  }

  try {
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    if (!decoded.email || !decoded.email_verified) {
      res.status(403).json({ error: 'A verified Google account email is required.' });
      return;
    }
    req.verifiedEmail = decoded.email.toLowerCase();
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Serve uploaded media safely with nosniff header
  app.use(
    '/uploads',
    (_req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=604800');
      next();
    },
    express.static(uploadsDir)
  );

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'aws-sbg-ucer' });
  });

  app.post(
    '/api/media/upload',
    requireVerifiedFirebaseUser,
    upload.single('file'),
    (req: AuthenticatedRequest, res: Response) => {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided.' });
        return;
      }

      const ext = ALLOWED_MIME_TYPES[req.file.mimetype];
      if (!ext) {
        res.status(400).json({ error: 'Invalid image format.' });
        return;
      }

      const safeFilename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      const targetPath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(targetPath, req.file.buffer);

      res.status(201).json({
        url: `/uploads/${safeFilename}`,
        filename: safeFilename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.verifiedEmail ?? '',
      });
    }
  );

  app.delete(
    '/api/media/:filename',
    requireVerifiedFirebaseUser,
    (req: AuthenticatedRequest, res: Response) => {
      const rawName = String(req.params.filename || '');
      if (!/^[0-9]+-[a-f0-9]+\.(jpg|png|webp|gif|svg)$/.test(rawName)) {
        res.status(400).json({ error: 'Invalid filename.' });
        return;
      }
      const targetPath = path.join(uploadsDir, rawName);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      res.json({ deleted: true });
    }
  );

  // Multer & Express error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(400).json({ error: err.message || 'Upload failed.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(rootDir, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
