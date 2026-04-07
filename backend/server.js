// import express from "express";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// import authRoutes from "./routes/authRoutes.js";
// import expenseRoutes from "./routes/expenseRoutes.js";

// const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(cors());

// app.use(express.json());

// app.use(authRoutes);
// app.use(expenseRoutes);

// app.use(express.static(path.join(__dirname, "../frontend/dist")));

// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

// const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//   console.log(`running on port : ${PORT}`);
// });



import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose"; // ✅ added
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://expense-tracker-frontend-8171.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment');
  process.exit(1);
}

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('MongoDB connected');

    app.use(authRoutes);
    app.use(expenseRoutes);

    app.get('/', (req, res) => {
      res.send('API is running 🚀');
    });

    app.listen(PORT, () => {
      console.log(`running on port : ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

startServer();

app.listen(PORT, () => {
  console.log(`running on port : ${PORT}`);
});