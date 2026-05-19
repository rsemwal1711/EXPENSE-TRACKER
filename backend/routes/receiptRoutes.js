import express from 'express';
import multer from 'multer';
import {
  uploadReceipt,
  getReceiptByTransaction,
  getReceiptsByMonth,
  getReceiptsByYear,
  deleteReceipt,
} from '../controllers/receiptController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer — save to temp folder
const upload = multer({ dest: 'uploads/' });

router.post('/receipts/upload', authenticateToken, upload.single('receipt'), uploadReceipt);
router.get('/receipts/transaction/:transactionId', authenticateToken, getReceiptByTransaction);
router.get('/receipts/month/:month', authenticateToken, getReceiptsByMonth);
router.get('/receipts/year/:year', authenticateToken, getReceiptsByYear);
router.delete('/receipts/:id', authenticateToken, deleteReceipt);

export default router;