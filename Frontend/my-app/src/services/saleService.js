import { API_BASE_URL } from './api';   


const saleService = {
    // Create a new sale
    createSale: async (saleData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/sales/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating sale:', error);
            return {
                success: false,
                message: 'Failed to create sale'
            };
        }
    },

    // Get all sales with filtering
    getAllSales: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            // Add all filter parameters
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    queryParams.append(key, params[key]);
                }
            });

            const response = await fetch(`${API_BASE_URL}/sales?${queryParams.toString()}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching sales:', error);
            return {
                success: false,
                message: 'Failed to fetch sales'
            };
        }
    },

    // Get sale by ID
    getSaleById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/sales/${id}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching sale:', error);
            return {
                success: false,
                message: 'Failed to fetch sale'
            };
        }
    },

    // Get customer price history for a product
    getCustomerPriceHistory: async (customerId, productId, limit = 10) => {
        try {
            const response = await fetch(`${API_BASE_URL}/sales/price-history/${customerId}/${productId}?limit=${limit}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching price history:', error);
            return {
                success: false,
                message: 'Failed to fetch price history'
            };
        }
    },

    // Get sales statistics
    getSalesStatistics: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    queryParams.append(key, params[key]);
                }
            });

            const response = await fetch(`${API_BASE_URL}/sales/statistics?${queryParams.toString()}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching sales statistics:', error);
            return {
                success: false,
                message: 'Failed to fetch sales statistics'
            };
        }
    }
};

export default saleService;