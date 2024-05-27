import express from "express";
import mongoose from "mongoose";
import { propertyRouter } from "./routes/property.js";
import { authRouter } from "./routes/auth.js";
import { sellerRouter } from "./routes/seller.js";
import { buyerRouter } from "./routes/buyer.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { formatResponse } from "./utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();
const DB = "mongodb://localhost/te";

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
});

const Image = mongoose.model("Image", imageSchema);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });
app.use(cors({origin: "http://127.0.0.1:5500"}))
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    const image = new Image({ url: imageUrl });
    await image.save();
    res.json(formatResponse(imageUrl, "Image uploaded successfully"));
  } catch (error) {
    console.error("Error uploading image", error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
});

// Use routers
app.use("/Rentify", propertyRouter);
app.use("/Rentify", sellerRouter);
app.use("/Rentify", buyerRouter);
app.use("/Rentify", authRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening at Port ${PORT}`);
});

// app.js