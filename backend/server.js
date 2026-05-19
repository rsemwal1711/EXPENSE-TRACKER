import dotenv from 'dotenv';
dotenv.config(); // ← FIRST, before everything

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import session from "express-session";
import cookieParser from "cookie-parser";
import receiptRoutes from './routes/receiptRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

// CORS — must be before routes
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://expense-tracker-frontend-8171.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Cookie parser
app.use(cookieParser());

// Session
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  }
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// EJS page routes
// app.get('/login', (req, res) => res.render('login'));
// app.get('/signup', (req, res) => res.render('signup'));

// ✅ API routes FIRST
app.use('/users', authRoutes);
app.use(expenseRoutes);
app.use(receiptRoutes); 

// ── TEMPORARY MIGRATION ROUTE — DELETE AFTER USE ──
app.get('/migrate-expenses', async (req, res) => {
  try {
    const User = mongoose.models.User;
    const Expense = mongoose.models.Expense;
    
    const users = await User.find({ expenses: { $exists: true, $ne: [] } });
    let total = 0;

    for (const user of users) {
      for (const exp of user.expenses) {
        await Expense.create({
          userId: user._id,
          title: exp.title,
          amount: exp.amount,
          date: exp.date,
          type: exp.type || 'expense',
          expenseType: exp.expenseType || 'other'
        });
        total++;
      }
    }

    res.json({ message: `Migrated ${total} expenses successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ── END MIGRATION ROUTE ──

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ✅ Static files and wildcard LAST
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

// Only serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment variables');
  process.exit(1);
}

const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();