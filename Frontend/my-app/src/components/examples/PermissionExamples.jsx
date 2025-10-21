import React from 'react';
import { useAuth } from '../context/AuthContext';

// Protected Button Component - only shows if user has permission
const ProtectedButton = ({ permission, children, onClick, className = "menu-btn" }) => {
    const { hasPermission } = useAuth();
    
    // If user doesn't have permission, don't render the button
    if (!hasPermission(permission)) {
        return null;
    }
    
    return (
        <button className={className} onClick={onClick}>
            {children}
        </button>
    );
};

// Example: Customer Management Component
const CustomerManagement = () => {
    const { hasPermission, isAdmin } = useAuth();
    
    const handleAddCustomer = () => {
        console.log('Adding customer...');
    };
    
    const handleViewReports = () => {
        console.log('Viewing customer reports...');
    };
    
    return (
        <div className="customer-section">
            <h2>Customer Management</h2>
            
            {/* This button only shows for users with 'add_customer' permission */}
            <ProtectedButton 
                permission="add_customer" 
                onClick={handleAddCustomer}
            >
                Add New Customer
            </ProtectedButton>
            
            {/* This button only shows for users with 'view_reports' permission (admin only) */}
            <ProtectedButton 
                permission="view_reports" 
                onClick={handleViewReports}
            >
                View Customer Reports
            </ProtectedButton>
            
            {/* Alternative way - using conditional rendering */}
            {hasPermission('manage_users') && (
                <button className="menu-btn danger">
                    Delete Customer Data
                </button>
            )}
            
            {/* Show different content based on permissions */}
            {isAdmin() ? (
                <div className="admin-only">
                    <p>Admin can see all customers and their purchase history</p>
                </div>
            ) : (
                <div className="cashier-view">
                    <p>Cashier can add customers and search existing ones</p>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;