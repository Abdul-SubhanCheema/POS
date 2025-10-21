const supplierSchema = require("../Models/SupplierSchema");

const SupplierController = {
    
    // Create a new supplier
    createNewSupplier: async (req, res) => {
        try {
            const { name, phone, email, address } = req.body;

            // Validation
            if (!name || !phone || !address) {
                return res.status(400).json({
                    success: false,
                    message: "Name, phone, and address are required fields"
                });
            }

            // Check if supplier with same name already exists
            const existingSupplier = await supplierSchema.findOne({ name });
            if (existingSupplier) {
                return res.status(409).json({
                    success: false,
                    message: "Supplier with this name already exists"
                });
            }

            // Create new supplier
            const newSupplier = new supplierSchema({
                name,
                phone,
                email,
                address
            });

            const savedSupplier = await newSupplier.save();

            res.status(201).json({
                success: true,
                message: "Supplier created successfully",
                data: savedSupplier
            });

        } catch (error) {
            console.error("Error creating supplier:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get all suppliers
    getAllSuppliers: async (req, res) => {
        try {
            const suppliers = await supplierSchema.find().sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Suppliers retrieved successfully",
                data: suppliers,
                count: suppliers.length
            });

        } catch (error) {
            console.error("Error getting suppliers:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get all active suppliers
    getAllActiveSuppliers: async (req, res) => {
        try {
            const activeSuppliers = await supplierSchema.find({ status: 'active' }).sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Active suppliers retrieved successfully",
                data: activeSuppliers,
                count: activeSuppliers.length
            });

        } catch (error) {
            console.error("Error getting active suppliers:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get supplier by ID
    getSupplierById: async (req, res) => {
        try {
            const { id } = req.params;

            const supplier = await supplierSchema.findById(id);

            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: "Supplier not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Supplier retrieved successfully",
                data: supplier
            });

        } catch (error) {
            console.error("Error getting supplier:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Update supplier
    updateSupplier: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, phone, email, address } = req.body;

            // Check if supplier exists
            const existingSupplier = await supplierSchema.findById(id);
            if (!existingSupplier) {
                return res.status(404).json({
                    success: false,
                    message: "Supplier not found"
                });
            }

            // Check if name is being updated and if it already exists
            if (name && name !== existingSupplier.name) {
                const nameExists = await supplierSchema.findOne({ name, _id: { $ne: id } });
                if (nameExists) {
                    return res.status(409).json({
                        success: false,
                        message: "Supplier with this name already exists"
                    });
                }
            }

            // Update supplier
            const updatedSupplier = await supplierSchema.findByIdAndUpdate(
                id,
                { name, phone, email, address },
                { new: true, runValidators: true }
            );

            res.status(200).json({
                success: true,
                message: "Supplier updated successfully",
                data: updatedSupplier
            });

        } catch (error) {
            console.error("Error updating supplier:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Toggle supplier status (active/inactive)
    toggleSupplierStatus: async (req, res) => {
        try {
            const { id } = req.params;

            // Find the supplier first
            const supplier = await supplierSchema.findById(id);
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: "Supplier not found"
                });
            }

            // Toggle the status
            const newStatus = supplier.status === 'active' ? 'inactive' : 'active';
            
            // Update the supplier with new status
            const updatedSupplier = await supplierSchema.findByIdAndUpdate(
                id,
                { status: newStatus },
                { new: true, runValidators: true }
            );

            res.status(200).json({
                success: true,
                message: `Supplier status changed to ${newStatus}`,
                data: updatedSupplier
            });

        } catch (error) {
            console.error("Error toggling supplier status:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Search suppliers by name or phone
    searchSuppliers: async (req, res) => {
        try {
            const { query } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: "Search query is required"
                });
            }

            const suppliers = await supplierSchema.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { phone: { $regex: query, $options: 'i' } }
                ]
            }).sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Search completed successfully",
                data: suppliers,
                count: suppliers.length
            });

        } catch (error) {
            console.error("Error searching suppliers:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get supplier statistics
    getSupplierStatistics: async (req, res) => {
        try {
            const totalSuppliers = await supplierSchema.countDocuments();
            
            // Get suppliers created today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const newSuppliersToday = await supplierSchema.countDocuments({
                createdAt: {
                    $gte: today,
                    $lt: tomorrow
                }
            });

            // Get suppliers created this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const newSuppliersThisWeek = await supplierSchema.countDocuments({
                createdAt: {
                    $gte: weekAgo
                }
            });

            res.status(200).json({
                success: true,
                message: "Supplier statistics retrieved successfully",
                data: {
                    totalSuppliers,
                    newSuppliersToday,
                    newSuppliersThisWeek
                }
            });

        } catch (error) {
            console.error("Error getting supplier statistics:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
};

module.exports = SupplierController;