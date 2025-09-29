import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js"
import diagnosisRoutes from "./routes/diagnosesRoutes.js"
import path from "path";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const allowed = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);
app.use(cors({
  origin: allowed,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/diagnoses", diagnosisRoutes);

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "frontend", "dist");
  app.use(express.static(distPath));

  app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
}
 
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});