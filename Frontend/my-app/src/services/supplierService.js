// API service for supplier operations
const API_BASE_URL=import.meta.env.VITE_API_BASE_URL;

const supplierService = {
    // Get all suppliers
    getAllSuppliers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error;
        }
    },

    // Get all active suppliers
    getAllActiveSuppliers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/active`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching active suppliers:', error);
            throw error;
        }
    },

    // Get supplier by ID
    getSupplierById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching supplier:', error);
            throw error;
        }
    },

    // Create new supplier
    createSupplier: async (supplierData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating supplier:', error);
            throw error;
        }
    },

    // Update supplier
    updateSupplier: async (id, supplierData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    },

    // Toggle supplier status (active/inactive)
    toggleSupplierStatus: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/${id}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error toggling supplier status:', error);
            throw error;
        }
    },

    // Search suppliers
    searchSuppliers: async (query) => {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/search/query?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching suppliers:', error);
            throw error;
        }
    },

    // Get supplier statistics
    getSupplierStatistics: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/statistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching supplier statistics:', error);
            return {
                success: false,
                message: 'Failed to fetch supplier statistics'  
            };
        }
    },
};

export default supplierService;