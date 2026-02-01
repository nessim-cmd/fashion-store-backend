"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const addresses_1 = require("../controllers/addresses");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', addresses_1.getAddresses);
router.post('/', addresses_1.createAddress);
router.put('/:id', addresses_1.updateAddress);
router.delete('/:id', addresses_1.deleteAddress);
router.patch('/:id/default', addresses_1.setDefaultAddress);
exports.default = router;
