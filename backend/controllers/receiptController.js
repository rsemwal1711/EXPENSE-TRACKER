import cloudinary from '../config/cloudinary.js';
import prisma from '../config/prisma.js';
import fs from 'fs';

// Upload receipt for a transaction
export const uploadReceipt = async (req, res) => {
  try {
    console.log('Upload called');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    console.log('User:', req.user);

    const { transactionId, date } = req.body;
    const userId = req.user.id;

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Fix Windows path backslashes
    const filePath = req.file.path.replace(/\\/g, '/');
    console.log('File path:', filePath);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `expense-tracker/${userId}/receipts`,
      resource_type: 'auto',
    });
    console.log('Cloudinary result:', result.secure_url);

    fs.unlinkSync(req.file.path);

    const month = date?.slice(0, 7) || new Date().toISOString().slice(0, 7);
    const year = month.slice(0, 4);

    // Save to PostgreSQL via Prisma
    const receipt = await prisma.receipt.create({
      data: {
        transactionId,
        userId,
        fileUrl: result.secure_url,
        filePublicId: result.public_id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype.startsWith('image') ? 'image' : 'pdf',
        month,
        year,
      },
    });
    console.log('Receipt saved:', receipt.id);

    res.status(201).json(receipt);
  } catch (err) {
    console.error('Upload error:', err);
    // Log stack when available and full object for debugging
    if (err && err.stack) console.error(err.stack);
    try {
      console.error('Upload error (serialized):', JSON.stringify(err));
    } catch (e) {
      console.error('Upload error (inspect):', err);
    }
    const errMsg = err && err.message ? err.message : (typeof err === 'string' ? err : JSON.stringify(err || {}));
    res.status(500).json({ message: errMsg });
  }
};

// Get receipt for a single transaction
export const getReceiptByTransaction = async (req, res) => {
  try {
    const receipt = await prisma.receipt.findFirst({
      where: { transactionId: req.params.transactionId, userId: req.user.id },
    });
    // Return null explicitly if not found
    res.json(receipt || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all receipts for a month
export const getReceiptsByMonth = async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      where: { userId: req.user.id, month: req.params.month },
      orderBy: { createdAt: 'desc' },
    });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all receipts for a year
export const getReceiptsByYear = async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      where: { userId: req.user.id, year: req.params.year },
      orderBy: { createdAt: 'desc' },
    });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a receipt
export const deleteReceipt = async (req, res) => {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: req.params.id },
    });
    if (!receipt) return res.status(404).json({ message: 'Not found' });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(receipt.filePublicId);

    // Delete from PostgreSQL
    await prisma.receipt.delete({ where: { id: req.params.id } });

    res.json({ message: 'Receipt deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};