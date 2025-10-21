import { API_BASE_URL } from './api';

const productService = {
    // Get all products with filtering and pagination
    getAllProducts: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            // Add all filter parameters
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    queryParams.append(key, params[key]);
                }
            });

            const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            return {
                success: false,
                message: 'Failed to fetch products'
            };
        }
    },

    // Get product by ID
    getProductById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Error fetching product:', error);
            return {
                success: false,
                message: 'Failed to fetch product'
            };
        }
    },

    // Create new product
    createProduct: async (productData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating product:', error);
            return {
                success: false,
                message: 'Failed to create product'
            };
        }
    },

    // Update product
    updateProduct: async (id, productData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating product:', error);
            return {
                success: false,
                message: 'Failed to update product'
            };
        }
    },

    // Delete product
    deleteProduct: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting product:', error);
            return {
                success: false,
                message: 'Failed to delete product'
            };
        }
    },

    // Search products
    searchProducts: async (query, category = '') => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('query', query);
            if (category) queryParams.append('category', category);

            const response = await fetch(`${API_BASE_URL}/products/search/query?${queryParams.toString()}`);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Error searching products:', error);
            return {
                success: false,
                message: 'Failed to search products'
            };
        }
    },

    // Get product categories
    getCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/categories`);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return {
                success: false,
                message: 'Failed to fetch categories'
            };
        }
    },

    // Get out of stock products
    getOutOfStockProducts: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/out-of-stock`);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Error fetching out of stock products:', error);
            return {
                success: false,
                message: 'Failed to fetch out of stock products'
            };
        }
    },

    // Update product stock
    updateProductStock: async (id, quantity, operation = 'set') => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity, operation }),
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating product stock:', error);
            return {
                success: false,
                message: 'Failed to update product stock'
            };
        }
    },

    // Get product statistics
    getProductStatistics: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/statistics`);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Error fetching product statistics:', error);
            return {
                success: false,
                message: 'Failed to fetch product statistics'
            };
        }
    }
};

export default productService;