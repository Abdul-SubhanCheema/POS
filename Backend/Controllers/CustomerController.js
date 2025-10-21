
const customerSchema = require("../Models/CustomerSchema");

const CustomerController = {
    
    // Create a new customer
    createnewcustomer: async (req, res) => {
        try {
            const { name, email, phone, address } = req.body;

            // Validation
            if (!name || !phone || !address) {
                return res.status(400).json({
                    success: false,
                    message: "Name, phone, and address are required fields"
                });
            }

            // Check if customer with same email already exists (if email provided)
            if (email) {
                const existingCustomer = await customerSchema.findOne({ email });
                if (existingCustomer) {
                    return res.status(409).json({
                        success: false,
                        message: "Customer with this email already exists"
                    });
                }
            }

            // Create new customer
            const newCustomer = new customerSchema({
                name,
                email,
                phone,
                address
            });

            const savedCustomer = await newCustomer.save();

            res.status(201).json({
                success: true,
                message: "Customer created successfully",
                data: savedCustomer
            });

        } catch (error) {
            console.error("Error creating customer:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get all customers
    getAllCustomers: async (req, res) => {
        try {
            const customers = await customerSchema.find().sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Customers retrieved successfully",
                data: customers,
                count: customers.length
            });

        } catch (error) {
            console.error("Error getting customers:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get all active customers
    getAllActiveCustomers: async (req, res) => {
        try {
            const activeCustomers = await customerSchema.find({ status: 'active' }).sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Active customers retrieved successfully",
                data: activeCustomers,
                count: activeCustomers.length
            });

        } catch (error) {
            console.error("Error getting active customers:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get customer by ID
    getCustomerById: async (req, res) => {
        try {
            const { id } = req.params;

            const customer = await customerSchema.findById(id);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Customer retrieved successfully",
                data: customer
            });

        } catch (error) {
            console.error("Error getting customer:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Update customer
    updateCustomer: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone, address } = req.body;

            // Check if customer exists
            const existingCustomer = await customerSchema.findById(id);
            if (!existingCustomer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            // Check if email is being updated and if it already exists
            if (email && email !== existingCustomer.email) {
                const emailExists = await customerSchema.findOne({ email, _id: { $ne: id } });
                if (emailExists) {
                    return res.status(409).json({
                        success: false,
                        message: "Customer with this email already exists"
                    });
                }
            }

            // Update customer
            const updatedCustomer = await customerSchema.findByIdAndUpdate(
                id,
                { name, email, phone, address },
                { new: true, runValidators: true }
            );

            res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                data: updatedCustomer
            });

        } catch (error) {
            console.error("Error updating customer:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Toggle customer status (active/inactive)
    toggleCustomerStatus: async (req, res) => {
        try {
            const { id } = req.params;

            const customer = await customerSchema.findById(id);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            // Toggle status between active and inactive
            const newStatus = customer.status === 'active' ? 'inactive' : 'active';
            
            const updatedCustomer = await customerSchema.findByIdAndUpdate(
                id,
                { status: newStatus },
                { new: true }
            );

            res.status(200).json({
                success: true,
                message: `Customer status changed to ${newStatus}`,
                data: updatedCustomer
            });

        } catch (error) {
            console.error("Error toggling customer status:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Search customers by name or email
    searchCustomers: async (req, res) => {
        try {
            const { query } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: "Search query is required"
                });
            }

            const customers = await customerSchema.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { phone: { $regex: query, $options: 'i' } }
                ]
            }).sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Search completed successfully",
                data: customers,
                count: customers.length
            });

        } catch (error) {
            console.error("Error searching customers:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Get customer statistics
    getCustomerStatistics: async (req, res) => {
        try {
            const totalCustomers = await customerSchema.countDocuments();
            
            // Get customers created today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const newCustomersToday = await customerSchema.countDocuments({
                createdAt: {
                    $gte: today,
                    $lt: tomorrow
                }
            });

            // Get customers created this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const newCustomersThisWeek = await customerSchema.countDocuments({
                createdAt: {
                    $gte: weekAgo
                }
            });

            res.status(200).json({
                success: true,
                message: "Customer statistics retrieved successfully",
                data: {
                    totalCustomers,
                    newCustomersToday,
                    newCustomersThisWeek
                }
            });

        } catch (error) {
            console.error("Error getting customer statistics:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
};

module.exports = CustomerController;