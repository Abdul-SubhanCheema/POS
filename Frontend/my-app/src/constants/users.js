// Hardcoded user credentials for the POS system
export const USERS = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Shop Admin',
        permissions: ['view_all', 'add_customer', 'add_supplier', 'manage_inventory', 'view_reports', 'manage_users']
    },
    {
        username: 'cashier1',
        password: 'cash123',
        role: 'cashier',
        name: 'Cashier One',
        permissions: ['process_sales', 'manage_recovery']
    },
    {
        username: 'cashier2',
        password: 'cash456',
        role: 'cashier',
        name: 'Cashier Two',
        permissions: ['process_sales', 'manage_recovery']
    }
];

// Role-based permissions
export const PERMISSIONS = {
    admin: ['view_all', 'add_customer', 'add_supplier', 'manage_inventory', 'view_reports', 'manage_users'],
    cashier: ['process_sales', 'manage_recovery'],
    user: ['add_customer', 'view_inventory', 'make_sales'] // Legacy role, kept for compatibility
};