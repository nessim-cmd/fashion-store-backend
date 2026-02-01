"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/attributes.ts
const express_1 = __importDefault(require("express"));
const attributes_1 = require("../controllers/attributes");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Public routes
router.get('/', attributes_1.getAttributes);
// Admin routes
router.post('/', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.attributeValidation, attributes_1.createAttribute);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.attributeValidation, attributes_1.updateAttribute);
router.delete('/:type/:id', auth_1.authenticate, auth_1.authorizeAdmin, attributes_1.deleteAttribute);
exports.default = router;
