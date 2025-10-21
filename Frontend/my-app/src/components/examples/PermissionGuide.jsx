// PERMISSION USAGE GUIDE FOR YOUR POS SYSTEM

import React from 'react';
import { useAuth } from '../context/AuthContext';

const PermissionGuide = () => {
    const { hasPermission, user, isAdmin, isUser } = useAuth();

    return (
        <div className="permission-guide">
            <h1>How to Use Permissions in Your POS System</h1>
            
            {/* Method 1: Conditional Rendering with hasPermission */}
            <section>
                <h2>Method 1: Conditional Button Rendering</h2>
                <div className="button-group">
                    {/* Only show if user has 'add_customer' permission */}
                    {hasPermission('add_customer') && (
                        <button>Add Customer</button>
                    )}
                    
                    {/* Only show if user has 'manage_inventory' permission */}
                    {hasPermission('manage_inventory') && (
                        <button>Manage Inventory</button>
                    )}
                    
                    {/* Only show if user has 'view_reports' permission */}
                    {hasPermission('view_reports') && (
                        <button>View Reports</button>
                    )}
                </div>
            </section>

            {/* Method 2: Different Content Based on Role */}
            <section>
                <h2>Method 2: Role-Based Content</h2>
                {isAdmin() ? (
                    <div className="admin-content">
                        <h3>Admin Features:</h3>
                        <ul>
                            <li>Full access to all features</li>
                            <li>Can manage users and suppliers</li>
                            <li>Can view all reports and analytics</li>
                        </ul>
                    </div>
                ) : (
                    <div className="cashier-content">
                        <h3>Cashier Features:</h3>
                        <ul>
                            <li>Process sales transactions</li>
                            <li>Add customers</li>
                            <li>View product inventory</li>
                        </ul>
                    </div>
                )}
            </section>

            {/* Method 3: Navigation Menu Based on Permissions */}
            <section>
                <h2>Method 3: Dynamic Navigation</h2>
                <nav className="permission-nav">
                    {hasPermission('make_sales') && (
                        <a href="/sales">💰 Sales</a>
                    )}
                    {hasPermission('add_customer') && (
                        <a href="/customers">👥 Customers</a>
                    )}
                    {hasPermission('view_inventory') && (
                        <a href="/inventory">📦 Inventory</a>
                    )}
                    {hasPermission('add_supplier') && (
                        <a href="/suppliers">🏭 Suppliers</a>
                    )}
                    {hasPermission('view_reports') && (
                        <a href="/reports">📊 Reports</a>
                    )}
                    {hasPermission('manage_users') && (
                        <a href="/users">⚙️ Settings</a>
                    )}
                </nav>
            </section>

            {/* Method 4: Form Fields Based on Permissions */}
            <section>
                <h2>Method 4: Form Field Access</h2>
                <form className="permission-form">
                    <input type="text" placeholder="Customer Name" />
                    <input type="text" placeholder="Phone Number" />
                    
                    {/* Only admin can set discount */}
                    {hasPermission('manage_users') && (
                        <input type="number" placeholder="Special Discount %" />
                    )}
                    
                    {/* Only admin can see customer credit limit */}
                    {hasPermission('view_all') && (
                        <input type="number" placeholder="Credit Limit" />
                    )}
                </form>
            </section>

            {/* Method 5: Error Messages for Unauthorized Access */}
            <section>
                <h2>Method 5: Access Control Messages</h2>
                <div className="access-control">
                    {!hasPermission('view_reports') && (
                        <div className="no-permission">
                            ❌ You don't have permission to view reports. Contact admin.
                        </div>
                    )}
                    
                    {!hasPermission('manage_inventory') && (
                        <div className="no-permission">
                            ❌ Only managers can modify inventory.
                        </div>
                    )}
                </div>
            </section>

            {/* Current User Info */}
            <section>
                <h2>Your Current Permissions:</h2>
                <div className="user-permissions">
                    <p><strong>Name:</strong> {user?.name}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                    <p><strong>Permissions:</strong></p>
                    <ul>
                        {user?.permissions?.map(permission => (
                            <li key={permission}>
                                ✅ {permission.replace('_', ' ').toUpperCase()}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default PermissionGuide;

/*
REAL-WORLD USAGE EXAMPLES:

1. SALES PAGE:
   - Cashiers: Can make sales, view products
   - Admin: Can make sales, modify prices, apply special discounts

2. CUSTOMER PAGE:
   - Cashiers: Can add customers, search customers
   - Admin: Can add, edit, delete customers, view purchase history

3. INVENTORY PAGE:
   - Cashiers: Can only view products and stock levels
   - Admin: Can add, edit, delete products, manage suppliers

4. REPORTS PAGE:
   - Cashiers: Cannot access (no 'view_reports' permission)
   - Admin: Can view all sales reports, analytics, user activity

5. SETTINGS PAGE:  
   - Cashiers: Cannot access (no 'manage_users' permission)
   - Admin: Can manage users, system settings, backup data

PERMISSION LIST MEANINGS:
- 'view_all': See everything in the system
- 'add_customer': Add new customers  
- 'add_supplier': Add new suppliers
- 'manage_inventory': Full inventory control
- 'view_reports': Access to reports and analytics
- 'manage_users': User management and settings
- 'make_sales': Process sales transactions
- 'view_inventory': Read-only inventory access
*/