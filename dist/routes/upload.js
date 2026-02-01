"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/upload.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Upload base64 image
router.post('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { image, filename } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'No image provided' });
        }
        // Extract base64 data
        const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ message: 'Invalid image format' });
        }
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        // Generate unique filename
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = path_1.default.join(uploadsDir, uniqueName);
        // Save file
        fs_1.default.writeFileSync(filePath, buffer);
        // Return URL (in production, this would be a CDN URL)
        const imageUrl = `/uploads/${uniqueName}`;
        res.json({ url: imageUrl, filename: uniqueName });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
}));
exports.default = router;
