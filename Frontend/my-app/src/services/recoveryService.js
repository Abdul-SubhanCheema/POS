const API_BASE_URL=import.meta.env.VITE_API_BASE_URL;

const recoveryService = {
    // Add a new recovery payment
    addRecovery: async (recoveryData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recovery/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recoveryData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error adding recovery:', error);
            return {
                success: false,
                message: 'Failed to add recovery payment'
            };
        }
    },

    // Get all outstanding sales
    getOutstandingSales: async (customerId = null, page = 1, limit = 50) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                _t: Date.now().toString() // Cache busting parameter
            });
            
            if (customerId) {
                params.append('customerId', customerId);
            }

            const response = await fetch(`${API_BASE_URL}/recovery/outstanding?${params}`, {
                cache: 'no-cache' // Prevent browser caching
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching outstanding sales:', error);
            return {
                success: false,
                message: 'Failed to fetch outstanding sales'
            };
        }
    },

    // Get overdue sales
    getOverdueSales: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/recovery/overdue?_t=${Date.now()}`, {
                cache: 'no-cache'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching overdue sales:', error);
            return {
                success: false,
                message: 'Failed to fetch overdue sales'
            };
        }
    },

    // Get fully paid sales
    getFullyPaidSales: async (customerId = null, page = 1, limit = 50) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                _t: Date.now().toString()
            });
            
            if (customerId) {
                params.append('customerId', customerId);
            }

            const response = await fetch(`${API_BASE_URL}/recovery/fully-paid?${params}`, {
                cache: 'no-cache'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching fully paid sales:', error);
            return {
                success: false,
                message: 'Failed to fetch fully paid sales'
            };
        }
    },

    // Get recovery history for a specific sale
    getSaleRecoveryHistory: async (saleId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recovery/sale/${saleId}/history`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching sale recovery history:', error);
            return {
                success: false,
                message: 'Failed to fetch recovery history'
            };
        }
    },

    // Get customer recovery summary
    getCustomerRecoverySummary: async (customerId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recovery/customer/${customerId}/summary`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching customer recovery summary:', error);
            return {
                success: false,
                message: 'Failed to fetch customer recovery summary'
            };
        }
    },

    // Get all recoveries with pagination
    getAllRecoveries: async (page = 1, limit = 50) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            const response = await fetch(`${API_BASE_URL}/recovery/all?${params}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching all recoveries:', error);
            return {
                success: false,
                message: 'Failed to fetch recoveries'
            };
        }
    },

    // Get recovery dashboard summary
    getRecoveryDashboardSummary: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/recovery/dashboard-summary?_t=${Date.now()}`, {
                cache: 'no-cache'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching recovery dashboard summary:', error);
            return {
                success: false,
                message: 'Failed to fetch dashboard summary'
            };
        }
    },

    // Update recovery status
    updateRecoveryStatus: async (recoveryId, status, notes = '') => {
        try {
            const response = await fetch(`${API_BASE_URL}/recovery/${recoveryId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status, notes })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating recovery status:', error);
            return {
                success: false,
                message: 'Failed to update recovery status'
            };
        }
    }
};

export default recoveryService;