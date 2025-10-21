const productSchema = require("../Models/ProductSchema");
const supplierSchema = require("../Models/SupplierSchema");

const ProductController = {
    
    // Create a new product
    createNewProduct: async (req, res) => {
        try {
            const {
                name, description, quantity, category, batchName, price, 
                discount, supplier, status, expiryDate
            } = req.body;

            // Validation for required fields
            if (!name || !description || quantity === undefined || !category || !batchName || !price || !supplier) {
                return res.status(400).json({
                    success: false,
                    message: "Name, description, quantity, category, batch name, price, and supplier are required fields"
                });
            }

            // Validate supplier exists
            const supplierExists = await supplierSchema.findById(supplier);
            if (!supplierExists) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid supplier ID"
                });
            }

            // Validate expiry date
            if (expiryDate) {
                if (new Date(expiryDate) <= new Date()) {
                    return res.status(400).json({
                        success: false,
                        message: "Expiry date must be in the future"
                    });
                }
            }

            // Create new product
            const newProduct = new productSchema({
                name,
                description,
                quantity,
                category,
                batchName,
                price,
                discount: discount || 0,
                supplier,
                status: status || 'active',
                expiryDate: expiryDate ? new Date(expiryDate) : undefined
            });

            const savedProduct = await newProduct.save();
            
            // Populate supplier information
            await savedProduct.populate('supplier', 'name phone email');

            res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: savedProduct
            });

        } catch (error) {
            console.error("Error creating product:", error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: validationErrors
                });
            }

            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Product with this SKU already exists"
                });
            }

            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get all products with pagination and filtering
    getAllProducts: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                category,
                status,
                supplier,
                minPrice,
                maxPrice,
                search,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            // Build filter object
            const filter = {};

            if (category) filter.category = category;
            if (status) filter.status = status;
            if (supplier) filter.supplier = supplier;
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = Number(minPrice);
                if (maxPrice) filter.price.$lte = Number(maxPrice);
            }
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { batchName: { $regex: search, $options: 'i' } }
                ];
            }

            // Calculate pagination
            const skip = (Number(page) - 1) * Number(limit);

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const products = await productSchema.find(filter)
                .populate('supplier', 'name phone email')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit));
            const totalProducts = await productSchema.countDocuments(filter);

            res.status(200).json({
                success: true,
                message: "Products retrieved successfully",
                data: products,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalProducts / Number(limit)),
                    totalProducts,
                    limit: Number(limit)
                }
            });

        } catch (error) {
            console.error("Error getting products:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get product by ID
    getProductById: async (req, res) => {
        try {
            const { id } = req.params;

            const product = await productSchema.findById(id)
                .populate('supplier', 'name phone email address');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Product retrieved successfully",
                data: product
            });

        } catch (error) {
            console.error("Error getting product:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Update product
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if product exists
            const existingProduct = await productSchema.findById(id);
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // Validate supplier if being updated
            if (updateData.supplier) {
                const supplierExists = await supplierSchema.findById(updateData.supplier);
                if (!supplierExists) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid supplier ID"
                    });
                }
            }

            // Check if SKU is being updated and if it already exists
            if (updateData.sku && updateData.sku !== existingProduct.sku) {
                const skuExists = await productSchema.findOne({ 
                    sku: updateData.sku.toUpperCase(), 
                    _id: { $ne: id } 
                });
                if (skuExists) {
                    return res.status(409).json({
                        success: false,
                        message: "Product with this SKU already exists"
                    });
                }
                updateData.sku = updateData.sku.toUpperCase();
            }

            // Validate dates if being updated
            if (updateData.manufacturingDate && updateData.expiryDate) {
                if (new Date(updateData.expiryDate) <= new Date(updateData.manufacturingDate)) {
                    return res.status(400).json({
                        success: false,
                        message: "Expiry date must be after manufacturing date"
                    });
                }
            }

            // Update product
            const updatedProduct = await productSchema.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).populate('supplier', 'name phone email');

            res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: updatedProduct
            });

        } catch (error) {
            console.error("Error updating product:", error);
            
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: validationErrors
                });
            }

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Product with this SKU already exists"
                });
            }

            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Delete product
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedProduct = await productSchema.findByIdAndDelete(id);

            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Product deleted successfully",
                data: deletedProduct
            });

        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Search products
    searchProducts: async (req, res) => {
        try {
            const { query, category, limit = 20 } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: "Search query is required"
                });
            }

            const searchFilter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { batchName: { $regex: query, $options: 'i' } }
                ]
            };

            if (category) {
                searchFilter.category = category;
            }

            const products = await productSchema.find(searchFilter)
                .populate('supplier', 'name phone email')
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Search completed successfully",
                data: products,
                count: products.length
            });

        } catch (error) {
            console.error("Error searching products:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get out of stock products
    getOutOfStockProducts: async (req, res) => {
        try {
            const products = await productSchema.find({ quantity: 0 })
                .populate('supplier', 'name phone email')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Out of stock products retrieved successfully",
                data: products,
                count: products.length
            });

        } catch (error) {
            console.error("Error getting out of stock products:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Update product stock
    updateProductStock: async (req, res) => {
        try {
            const { id } = req.params;
            const { quantity, operation = 'set' } = req.body; // operation: 'add', 'subtract', 'set'

            if (quantity === undefined || quantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Valid quantity is required"
                });
            }

            const product = await productSchema.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            let newQuantity;
            switch (operation) {
                case 'add':
                    newQuantity = product.quantity + Number(quantity);
                    break;
                case 'subtract':
                    newQuantity = Math.max(0, product.quantity - Number(quantity));
                    break;
                case 'set':
                default:
                    newQuantity = Number(quantity);
                    break;
            }

            const updatedProduct = await productSchema.findByIdAndUpdate(
                id,
                { quantity: newQuantity },
                { new: true, runValidators: true }
            ).populate('supplier', 'name phone email');

            res.status(200).json({
                success: true,
                message: "Product stock updated successfully",
                data: updatedProduct
            });

        } catch (error) {
            console.error("Error updating product stock:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get product categories
    getProductCategories: async (req, res) => {
        try {
            // Get categories from existing products
            const existingCategories = await productSchema.distinct('category');
            
            // Define some default categories
            const defaultCategories = [
                'Electronics',
                'Clothing & Fashion', 
                'Food & Beverages',
                'Home & Garden',
                'Health & Beauty',
                'Sports & Outdoors',
                'Books & Media',
                'Toys & Games',
                'Automotive',
                'Office Supplies',
                'Other'
            ];
            
            // Combine and deduplicate categories
            const allCategories = [...new Set([...defaultCategories, ...existingCategories])];
            
            res.status(200).json({
                success: true,
                message: "Product categories retrieved successfully",
                data: allCategories
            });

        } catch (error) {
            console.error("Error getting product categories:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get product statistics
    getProductStatistics: async (req, res) => {
        try {
            const stats = await productSchema.aggregate([
                {
                    $group: {
                        _id: null,
                        totalProducts: { $sum: 1 },
                        totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
                        averagePrice: { $avg: "$price" },
                        outOfStockCount: {
                            $sum: {
                                $cond: [{ $eq: ["$quantity", 0] }, 1, 0]
                            }
                        }
                    }
                }
            ]);

            const categoryStats = await productSchema.aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 },
                        totalValue: { $sum: { $multiply: ["$quantity", "$price"] } }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            res.status(200).json({
                success: true,
                message: "Product statistics retrieved successfully",
                data: {
                    overview: stats[0] || {
                        totalProducts: 0,
                        totalValue: 0,
                        averagePrice: 0,
                        outOfStockCount: 0
                    },
                    categoryBreakdown: categoryStats
                }
            });

        } catch (error) {
            console.error("Error getting product statistics:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
};

module.exports = ProductController;