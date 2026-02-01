"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_1 = require("../controllers/settings");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public - get all settings (for frontend)
router.get('/', settings_1.getSettings);
// Public - get a single setting
router.get('/:key', settings_1.getSetting);
// Admin only - update a single setting
router.put('/:key', auth_1.authenticate, auth_1.isAdmin, settings_1.updateSetting);
// Admin only - bulk update settings
router.put('/', auth_1.authenticate, auth_1.isAdmin, settings_1.updateSettings);
exports.default = router;
