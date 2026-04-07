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

app.use(cors());
app.use(express.json());

// connect to mongodb
mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use(authRoutes);
app.use(expenseRoutes);

// app.use(express.static(path.join(__dirname, "../frontend/dist")));

// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`running on port : ${PORT}`);
});