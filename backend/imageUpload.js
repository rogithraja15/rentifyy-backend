import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Image } from "./models/imageModel.js";
import express from "express";
import { formatError, formatResponse } from "./utils/response.js";

const imageRouter = express.Router();

// Multer configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Middleware to serve static files
imageRouter.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route to handle image upload
imageRouter.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    // Save the image URL in MongoDB
    const newImage = new Image({ url: imageUrl });
    await newImage.save();

    res.status(201).json(formatResponse(imageUrl));
  } catch (error) {
    res.status(500).json(formatError("Failed to upload image"));
  }
});

export { imageRouter };
