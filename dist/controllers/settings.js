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
exports.initializeSettings = exports.updateSettings = exports.updateSetting = exports.getSetting = exports.getSettings = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get all settings
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield db_1.default.settings.findMany();
        // Convert to object format
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getSettings = getSettings;
// Get a single setting by key
const getSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        const setting = yield db_1.default.settings.findUnique({
            where: { key }
        });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(setting);
    }
    catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getSetting = getSetting;
// Update or create a setting (upsert)
const updateSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, value } = req.body;
        const setting = yield db_1.default.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(setting);
    }
    catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateSetting = updateSetting;
// Bulk update settings
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = req.body; // { currency: 'USD', language: 'en', ... }
        const updates = Object.entries(settings).map(([key, value]) => db_1.default.settings.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        }));
        yield db_1.default.$transaction(updates);
        // Return updated settings
        const allSettings = yield db_1.default.settings.findMany();
        const settingsObj = {};
        allSettings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateSettings = updateSettings;
// Initialize default settings
const initializeSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    const defaults = [
        { key: 'currency', value: 'USD' },
        { key: 'currencySymbol', value: '$' },
        { key: 'language', value: 'en' },
        { key: 'storeName', value: 'Fashion Store' },
        { key: 'storeEmail', value: 'contact@fashionstore.com' },
        { key: 'taxRate', value: '0' },
        { key: 'shippingFee', value: '0' },
        { key: 'freeShippingThreshold', value: '100' },
    ];
    for (const setting of defaults) {
        yield db_1.default.settings.upsert({
            where: { key: setting.key },
            update: {},
            create: setting
        });
    }
});
exports.initializeSettings = initializeSettings;
