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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductBySlug = exports.getProductById = exports.getFeaturedProducts = exports.getProducts = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
// Get all products with filtering
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, subcategory, subSubcategory, featured, inStock, minPrice, maxPrice, search, sort, limit = 10, page = 1 } = req.query;
        // Build filter object
        const filter = {};
        // Support both category ID and category name/slug
        if (category) {
            const categoryStr = category;
            // Check if it's a UUID or a name/slug
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryStr);
            if (isUUID) {
                filter.categoryId = categoryStr;
            }
            else {
                // First find the category by name or slug
                const foundCategory = yield db_1.default.category.findFirst({
                    where: {
                        OR: [
                            { name: { equals: categoryStr, mode: 'insensitive' } },
                            { slug: { equals: categoryStr.toLowerCase() } }
                        ]
                    }
                });
                if (foundCategory) {
                    filter.categoryId = foundCategory.id;
                }
                else {
                    // No category found, return empty results
                    return res.json({ products: [], total: 0, page: 1, limit: Number(limit), totalPages: 0 });
                }
            }
        }
        if (subcategory)
            filter.subcategoryId = subcategory;
        if (subSubcategory)
            filter.subSubcategoryId = subSubcategory;
        if (featured === 'true')
            filter.featured = true;
        if (inStock === 'true')
            filter.inStock = true;
        // Search by name or description
        if (search) {
            filter.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        // Price range
        if (minPrice || maxPrice) {
            filter.AND = [];
            if (minPrice)
                filter.AND.push({ price: { gte: parseFloat(minPrice) } });
            if (maxPrice)
                filter.AND.push({ price: { lte: parseFloat(maxPrice) } });
        }
        // Determine sort order
        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc')
            orderBy = { price: 'asc' };
        if (sort === 'price_desc')
            orderBy = { price: 'desc' };
        if (sort === 'name_asc')
            orderBy = { name: 'asc' };
        if (sort === 'name_desc')
            orderBy = { name: 'desc' };
        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get products
        const products = yield db_1.default.product.findMany({
            where: filter,
            orderBy,
            skip,
            take: Number(limit),
            include: {
                category: true,
                subcategory: true,
                subSubcategory: true,
                productSizes: true,
                productColors: true,
                images: true
            }
        });
        // Get total count for pagination
        const total = yield db_1.default.product.count({ where: filter });
        // Format response
        const formattedProducts = products.map(product => (Object.assign(Object.assign({}, product), { images: product.images.map(img => img.url), sizes: product.productSizes.map(ps => ps.size), colors: product.productColors.map(pc => ({
                name: pc.name,
                hex: pc.hex
            })) })));
        res.json({
            products: formattedProducts,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getProducts = getProducts;
// Get featured products
const getFeaturedProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield db_1.default.product.findMany({
            where: { featured: true },
            include: {
                category: true,
                productSizes: true,
                productColors: true,
                images: true
            },
            take: 8
        });
        // Format response
        const formattedProducts = products.map(product => (Object.assign(Object.assign({}, product), { images: product.images.map(img => img.url), sizes: product.productSizes.map(ps => ps.size), colors: product.productColors.map(pc => ({
                name: pc.name,
                hex: pc.hex
            })) })));
        res.json(formattedProducts);
    }
    catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getFeaturedProducts = getFeaturedProducts;
// Get product by ID
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield db_1.default.product.findUnique({
            where: { id },
            include: {
                category: true,
                subcategory: true,
                subSubcategory: true,
                productSizes: true,
                productColors: true,
                images: true
            }
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Format response
        const formattedProduct = Object.assign(Object.assign({}, product), { images: product.images.map(img => img.url), sizes: product.productSizes.map(ps => ps.size), colors: product.productColors.map(pc => ({
                name: pc.name,
                hex: pc.hex
            })) });
        res.json(formattedProduct);
    }
    catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getProductById = getProductById;
// Get product by slug
const getProductBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const product = yield db_1.default.product.findUnique({
            where: { slug },
            include: {
                category: true,
                subcategory: true,
                subSubcategory: true,
                productSizes: true,
                productColors: true,
                images: true
            }
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Format response
        const formattedProduct = Object.assign(Object.assign({}, product), { images: product.images.map(img => img.url), sizes: product.productSizes.map(ps => ps.size), colors: product.productColors.map(pc => ({
                name: pc.name,
                hex: pc.hex
            })) });
        res.json(formattedProduct);
    }
    catch (error) {
        console.error('Get product by slug error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getProductBySlug = getProductBySlug;
// Create product (admin only)
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, description, price, salePrice, images, categoryId, subcategoryId, subSubcategoryId, featured, inStock, slug, sizes, colors } = req.body;
        // Create product
        const product = yield db_1.default.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                images: {
                    create: images.map(url => ({ url }))
                },
                categoryId,
                subcategoryId,
                subSubcategoryId,
                featured: featured || false,
                inStock: inStock !== undefined ? inStock : true,
                rating: 0,
                reviewCount: 0,
                slug
            }
        });
        // Add sizes if provided
        if (sizes && sizes.length > 0) {
            yield Promise.all(sizes.map((size) => db_1.default.productSize.create({
                data: {
                    size,
                    productId: product.id
                }
            })));
        }
        // Add colors if provided
        if (colors && colors.length > 0) {
            yield Promise.all(colors.map((color) => db_1.default.productColor.create({
                data: {
                    name: color.name,
                    hex: color.hex,
                    productId: product.id
                }
            })));
        }
        // Get complete product with relations
        const createdProduct = yield db_1.default.product.findUnique({
            where: { id: product.id },
            include: {
                category: true,
                subcategory: true,
                subSubcategory: true,
                productSizes: true,
                productColors: true,
                images: true
            }
        });
        // Format response
        const formattedProduct = Object.assign(Object.assign({}, createdProduct), { images: (createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct.images.map(img => img.url)) || [], sizes: (createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct.productSizes.map(ps => ps.size)) || [], colors: (createdProduct === null || createdProduct === void 0 ? void 0 : createdProduct.productColors.map(pc => ({
                name: pc.name,
                hex: pc.hex
            }))) || [] });
        res.status(201).json(formattedProduct);
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createProduct = createProduct;
// Update product (admin only)
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { name, description, price, salePrice, images, categoryId, subcategoryId, subSubcategoryId, featured, inStock, slug, sizes, colors } = req.body;
        // Check if product exists
        const existingProduct = yield db_1.default.product.findUnique({
            where: { id }
        });
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Update product
        const product = yield db_1.default.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                images: {
                    deleteMany: {},
                    create: images.map(url => ({ url }))
                },
                categoryId,
                subcategoryId,
                subSubcategoryId,
                featured,
                inStock,
                slug
            }
        });
        // Update sizes if provided
        if (sizes) {
            // Delete existing sizes
            yield db_1.default.productSize.deleteMany({
                where: { productId: id }
            });
            // Add new sizes
            if (sizes.length > 0) {
                yield Promise.all(sizes.map((size) => db_1.default.productSize.create({
                    data: {
                        size,
                        productId: product.id
                    }
                })));
            }
        }
        // Update colors if provided
        if (colors) {
            // Delete existing colors
            yield db_1.default.productColor.deleteMany({
                where: { productId: id }
            });
            // Add new colors
            if (colors.length > 0) {
                yield Promise.all(colors.map((color) => db_1.default.productColor.create({
                    data: {
                        name: color.name,
                        hex: color.hex,
                        productId: product.id
                    }
                })));
            }
        }
        // Get updated product with relations
        const updatedProduct = yield db_1.default.product.findUnique({
            where: { id },
            include: {
                category: true,
                subcategory: true,
                subSubcategory: true,
                productSizes: true,
                productColors: true,
                images: true
            }
        });
        // Format response
        const formattedProduct = Object.assign(Object.assign({}, updatedProduct), { images: (updatedProduct === null || updatedProduct === void 0 ? void 0 : updatedProduct.images.map(img => img.url)) || [], sizes: (updatedProduct === null || updatedProduct === void 0 ? void 0 : updatedProduct.productSizes.map(ps => ps.size)) || [], colors: (updatedProduct === null || updatedProduct === void 0 ? void 0 : updatedProduct.productColors.map(pc => ({
                name: pc.name,
                hex: pc.hex
            }))) || [] });
        res.json(formattedProduct);
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateProduct = updateProduct;
// Delete product (admin only)
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if product exists
        const existingProduct = yield db_1.default.product.findUnique({
            where: { id }
        });
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Delete product (cascade will handle related records)
        yield db_1.default.product.delete({
            where: { id }
        });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteProduct = deleteProduct;
