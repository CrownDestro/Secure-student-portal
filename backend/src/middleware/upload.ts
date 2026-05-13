import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // UUID filename — eliminates directory traversal & execution-by-name attacks
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = `${crypto.randomUUID()}${ext}`;
    cb(null, safe);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error(`File type not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export { UPLOAD_DIR, ALLOWED_MIME_TYPES };
