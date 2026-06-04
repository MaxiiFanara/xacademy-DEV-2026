import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sube dos niveles: desde src/middleware/ hasta xacademy-api/img/
const uploadDir = path.join(__dirname, '../../img');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes en formato WebP'), false);
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadCsv = multer({
  storage: multer.memoryStorage(), // guardar en memoria, no en disco
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
});

// Parsea los campos posiciones y skills que vienen como strings JSON en multipart/form-data
export const parseMultipartBody = (req, res, next) => {
  if (req.body.posiciones && typeof req.body.posiciones === 'string') {
    req.body.posiciones = JSON.parse(req.body.posiciones);
  }
  if (req.body.skills && typeof req.body.skills === 'string') {
    req.body.skills = JSON.parse(req.body.skills);
  }
  next();
};