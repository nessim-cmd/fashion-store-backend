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
exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get all addresses for the logged-in user
const getAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const addresses = yield db_1.default.address.findMany({
            where: { userId: req.user.id },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        res.json(addresses);
    }
    catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ message: 'Failed to get addresses' });
    }
});
exports.getAddresses = getAddresses;
// Create a new address
const createAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;
        // Validate required fields
        if (!name || !phone || !street || !city || !state || !postalCode || !country) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // If this is the default address, unset other defaults
        if (isDefault) {
            yield db_1.default.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false },
            });
        }
        // Check if this is the first address, make it default
        const existingCount = yield db_1.default.address.count({
            where: { userId: req.user.id },
        });
        const address = yield db_1.default.address.create({
            data: {
                userId: req.user.id,
                name,
                phone,
                street,
                city,
                state,
                postalCode,
                country,
                isDefault: isDefault || existingCount === 0,
            },
        });
        res.status(201).json(address);
    }
    catch (error) {
        console.error('Create address error:', error);
        res.status(500).json({ message: 'Failed to create address' });
    }
});
exports.createAddress = createAddress;
// Update an address
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;
        // Check if address belongs to user
        const existing = yield db_1.default.address.findFirst({
            where: { id, userId: req.user.id },
        });
        if (!existing) {
            return res.status(404).json({ message: 'Address not found' });
        }
        // If setting as default, unset other defaults
        if (isDefault) {
            yield db_1.default.address.updateMany({
                where: { userId: req.user.id, id: { not: id } },
                data: { isDefault: false },
            });
        }
        const address = yield db_1.default.address.update({
            where: { id },
            data: {
                name,
                phone,
                street,
                city,
                state,
                postalCode,
                country,
                isDefault,
            },
        });
        res.json(address);
    }
    catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Failed to update address' });
    }
});
exports.updateAddress = updateAddress;
// Delete an address
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if address belongs to user
        const existing = yield db_1.default.address.findFirst({
            where: { id, userId: req.user.id },
        });
        if (!existing) {
            return res.status(404).json({ message: 'Address not found' });
        }
        yield db_1.default.address.delete({ where: { id } });
        // If this was the default, make another one default
        if (existing.isDefault) {
            const nextAddress = yield db_1.default.address.findFirst({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' },
            });
            if (nextAddress) {
                yield db_1.default.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true },
                });
            }
        }
        res.json({ message: 'Address deleted' });
    }
    catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Failed to delete address' });
    }
});
exports.deleteAddress = deleteAddress;
// Set an address as default
const setDefaultAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if address belongs to user
        const existing = yield db_1.default.address.findFirst({
            where: { id, userId: req.user.id },
        });
        if (!existing) {
            return res.status(404).json({ message: 'Address not found' });
        }
        // Unset all other defaults
        yield db_1.default.address.updateMany({
            where: { userId: req.user.id },
            data: { isDefault: false },
        });
        // Set this one as default
        const address = yield db_1.default.address.update({
            where: { id },
            data: { isDefault: true },
        });
        res.json(address);
    }
    catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ message: 'Failed to set default address' });
    }
});
exports.setDefaultAddress = setDefaultAddress;
