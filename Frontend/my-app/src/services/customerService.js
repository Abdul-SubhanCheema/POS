const API_BASE_URL=import.meta.env.VITE_API_BASE_URL;

const customerService = {
    // Get all customers
    getAllCustomers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },

    // Get all active customers
    getAllActiveCustomers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/active`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching active customers:', error);
            throw error;
        }
    },

    // Get customer by ID
    getCustomerById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    },

    // Create new customer
    createCustomer: async (customerData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    },

    // Update customer
    updateCustomer: async (id, customerData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },

    // Toggle customer status (active/inactive)
    toggleCustomerStatus: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/${id}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error toggling customer status:', error);
            throw error;
        }
    },

    // Search customers
    searchCustomers: async (query) => {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/search/query?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    },

    // Get customer statistics
    getCustomerStatistics: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/statistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching customer statistics:', error);
            return {
                success: false,
                message: 'Failed to fetch customer statistics'
            };
        }
    },
};

export default customerService;