import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import FileUpload from '../models/FileUpload';
import logger from '../config/logger';
import { UPLOAD_DIR } from '../middleware/upload';

// POST /api/files/upload
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const record = await FileUpload.create({
      uploadedBy:   req.user!._id,
      originalName: req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'), // sanitize display name
      storedName:   req.file.filename,
      mimeType:     req.file.mimetype,
      size:         req.file.size,
      path:         req.file.path,
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id:           record._id,
        originalName: record.originalName,
        mimeType:     record.mimeType,
        size:         record.size,
        isApproved:   record.isApproved,
        uploadedAt:   record.uploadedAt,
      },
    });
  } catch (err) {
    logger.error('uploadFile error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/files  (teacher / admin)
export const listFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter = req.user!.role === 'admin' ? {} : { uploadedBy: req.user!._id };
    const files  = await FileUpload.find(filter).populate('uploadedBy', 'name email').sort('-uploadedAt');
    res.json({ files });
  } catch (err) {
    logger.error('listFiles error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/files/:id  — serve file via authenticated endpoint (NOT static)
export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await FileUpload.findById(req.params.id);
    if (!record) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Ownership check: only owner or admin can download
    const isOwner = String(record.uploadedBy) === String(req.user!._id);
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Resolve and verify path stays within UPLOAD_DIR (prevent traversal)
    const resolved = path.resolve(UPLOAD_DIR, record.storedName);
    if (!resolved.startsWith(UPLOAD_DIR)) {
      res.status(400).json({ error: 'Invalid file path' });
      return;
    }

    if (!fs.existsSync(resolved)) {
      res.status(404).json({ error: 'File not found on disk' });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${record.originalName}"`);
    res.setHeader('Content-Type', record.mimeType);
    fs.createReadStream(resolved).pipe(res);
  } catch (err) {
    logger.error('downloadFile error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};
