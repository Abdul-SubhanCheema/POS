import jsPDF from 'jspdf';
import 'jspdf-autotable';

class ReportService {
    constructor() {
        this.doc = null;
    }

    // Initialize PDF document
    initializeDocument() {
        this.doc = new jsPDF();
        return this.doc;
    }

    // Utility method to safely use autoTable
    safeAutoTable(options) {
        try {
            this.doc.autoTable(options);
            return this.doc.lastAutoTable ? this.doc.lastAutoTable.finalY : options.startY + 50;
        } catch (error) {
            console.error('autoTable error:', error);
            console.warn('Skipping table generation due to error');
            return options.startY + 50;
        }
    }

    // Add header to the document
    addHeader(title = 'ShopMaster Comprehensive Report') {
        if (!this.doc) this.initializeDocument();
        
        // Company header
        this.doc.setFontSize(20);
        this.doc.setTextColor(40, 116, 166); // Blue color
        this.doc.text(title, 105, 20, { align: 'center' });
        
        // Date and time
        this.doc.setFontSize(10);
        this.doc.setTextColor(100, 100, 100);
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        this.doc.text(`Generated on: ${dateStr}`, 105, 30, { align: 'center' });
        
        // Add a line
        this.doc.setDrawColor(200, 200, 200);
        this.doc.line(20, 35, 190, 35);
        
        return 45; // Return next Y position
    }

    // Add customers section with complete details
    addCustomersSection(customers, startY) {
        if (!customers || customers.length === 0) {
            this.doc.setFontSize(16);
            this.doc.setTextColor(40, 40, 40);
            this.doc.text('Customer Management - No Data Available', 20, startY);
            return startY + 30;
        }

        this.doc.setFontSize(18);
        this.doc.setTextColor(70, 130, 180);
        this.doc.text('CUSTOMER MANAGEMENT', 20, startY);
        
        // Summary stats
        const activeCustomers = customers.filter(c => (c.status || 'active') === 'active').length;
        const inactiveCustomers = customers.filter(c => (c.status || 'active') === 'inactive').length;
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(40, 40, 40);
        this.doc.text(`Total Customers: ${customers.length} | Active: ${activeCustomers} | Inactive: ${inactiveCustomers}`, 20, startY + 15);

        // Detailed customers table matching frontend
        const customerData = customers.map((customer, index) => [
            (index + 1).toString(),
            customer.name || 'N/A',
            customer.email || 'No Email',
            customer.phone || 'N/A',
            customer.address || 'No Address',
            (customer.status || 'active').toUpperCase(),
            new Date(customer.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            new Date(customer.createdAt).toLocaleDateString('en-US', {
                weekday: 'long'
            })
        ]);

        const finalY = this.safeAutoTable({
            startY: startY + 30,
            head: [['#', 'Customer Name', 'Email', 'Phone', 'Address', 'Status', 'Date Added', 'Day']],
            body: customerData,
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { 
                fillColor: [70, 130, 180], 
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 }, // #
                1: { cellWidth: 35 }, // Name
                2: { cellWidth: 40 }, // Email
                3: { cellWidth: 25 }, // Phone
                4: { cellWidth: 40 }, // Address
                5: { halign: 'center', cellWidth: 20 }, // Status
                6: { halign: 'center', cellWidth: 25 }, // Date
                7: { halign: 'center', cellWidth: 20 }  // Day
            }
        });

        return finalY + 25;
    }

    // Add suppliers section with complete details
    addSuppliersSection(suppliers, startY) {
        if (!suppliers || suppliers.length === 0) {
            this.doc.setFontSize(16);
            this.doc.setTextColor(40, 40, 40);
            this.doc.text('Supplier Management - No Data Available', 20, startY);
            return startY + 30;
        }

        this.doc.setFontSize(18);
        this.doc.setTextColor(255, 140, 0);
        this.doc.text('SUPPLIER MANAGEMENT', 20, startY);
        
        // Summary stats
        const activeSuppliers = suppliers.filter(s => (s.status || 'active') === 'active').length;
        const inactiveSuppliers = suppliers.filter(s => (s.status || 'active') === 'inactive').length;
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(40, 40, 40);
        this.doc.text(`Total Suppliers: ${suppliers.length} | Active: ${activeSuppliers} | Inactive: ${inactiveSuppliers}`, 20, startY + 15);

        // Detailed suppliers table matching frontend
        const supplierData = suppliers.map((supplier, index) => [
            (index + 1).toString(),
            supplier.name || 'N/A',
            supplier.email || 'No Email',
            supplier.phone || 'N/A',
            supplier.address || 'No Address',
            (supplier.status || 'active').toUpperCase(),
            new Date(supplier.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            new Date(supplier.createdAt).toLocaleDateString('en-US', {
                weekday: 'long'
            })
        ]);

        const finalY = this.safeAutoTable({
            startY: startY + 30,
            head: [['#', 'Supplier Name', 'Email', 'Phone', 'Address', 'Status', 'Date Added', 'Day']],
            body: supplierData,
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { 
                fillColor: [255, 140, 0], 
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 }, // #
                1: { cellWidth: 35 }, // Name  
                2: { cellWidth: 40 }, // Email
                3: { cellWidth: 25 }, // Phone
                4: { cellWidth: 40 }, // Address
                5: { halign: 'center', cellWidth: 20 }, // Status
                6: { halign: 'center', cellWidth: 25 }, // Date
                7: { halign: 'center', cellWidth: 20 }  // Day
            }
        });

        return finalY + 25;
    }

    // Add comprehensive sales section with every detail
    addSalesSection(sales, startY) {
        if (!sales || sales.length === 0) {
            this.doc.setFontSize(16);
            this.doc.setTextColor(40, 40, 40);
            this.doc.text('Sales Management - No Data Available', 20, startY);
            return startY + 30;
        }

        this.doc.setFontSize(18);
        this.doc.setTextColor(34, 139, 34);
        this.doc.text('SALES MANAGEMENT - COMPLETE DETAILS', 20, startY);
        
        // Summary stats
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
        const totalPaid = sales.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
        const totalOutstanding = totalRevenue - totalPaid;
        const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(40, 40, 40);
        this.doc.text(`Total Sales: ${totalSales} | Revenue: $${totalRevenue.toFixed(2)} | Paid: $${totalPaid.toFixed(2)} | Outstanding: $${totalOutstanding.toFixed(2)}`, 20, startY + 15);

        let currentY = startY + 35;

        // Process each sale individually with complete details
        sales.forEach((sale, index) => {
            // Check for page break
            if (currentY > 220) {
                this.doc.addPage();
                currentY = 20;
            }

            // Sale header with complete info
            this.doc.setFontSize(14);
            this.doc.setTextColor(34, 139, 34);
            this.doc.text(`SALE #${sale.saleNumber || (index + 1)}`, 20, currentY);
            currentY += 8;

            // Sale details in multiple lines
            this.doc.setFontSize(10);
            this.doc.setTextColor(40, 40, 40);
            this.doc.text(`Customer: ${sale.customer?.name || 'N/A'} | Supplier: ${sale.supplier?.name || 'N/A'}`, 20, currentY);
            currentY += 6;
            this.doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}`, 20, currentY);
            currentY += 6;
            this.doc.text(`Payment: ${sale.paymentMethod || 'N/A'} | Subtotal: $${(sale.subtotal || 0).toFixed(2)} | Discount: ${sale.discountType === 'percentage' ? sale.discountValue + '%' : '$' + (sale.discountValue || 0)} | Tax: ${sale.taxRate || 0}%`, 20, currentY);
            currentY += 6;
            this.doc.text(`Grand Total: $${(sale.grandTotal || 0).toFixed(2)} | Paid: $${(sale.amountPaid || 0).toFixed(2)} | Outstanding: $${((sale.grandTotal || 0) - (sale.amountPaid || 0)).toFixed(2)}`, 20, currentY);
            currentY += 10;

            // Items table for this sale
            if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
                const itemsData = sale.items.map((item, itemIndex) => [
                    (itemIndex + 1).toString(),
                    item.productName || item.product?.name || 'N/A',
                    item.quantity || 0,
                    `$${(item.unitPrice || 0).toFixed(2)}`,
                    `$${(item.total || (item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}`
                ]);

                const itemTableY = this.safeAutoTable({
                    startY: currentY,
                    head: [['#', 'Product Name', 'Qty', 'Unit Price', 'Total']],
                    body: itemsData,
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { 
                        fillColor: [144, 238, 144], 
                        textColor: 40,
                        fontSize: 8,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: { fillColor: [250, 250, 250] },
                    columnStyles: {
                        0: { halign: 'center', cellWidth: 10 }, // #
                        1: { cellWidth: 80 }, // Product
                        2: { halign: 'center', cellWidth: 20 }, // Qty
                        3: { halign: 'right', cellWidth: 30 }, // Unit Price
                        4: { halign: 'right', cellWidth: 30 }  // Total
                    }
                });

                currentY = itemTableY + 8;
            } else {
                this.doc.setFontSize(9);
                this.doc.setTextColor(150, 150, 150);
                this.doc.text('No items data available for this sale', 25, currentY);
                currentY += 8;
            }

            // Sale summary box
            this.doc.setDrawColor(34, 139, 34);
            this.doc.setFillColor(240, 255, 240);
            this.doc.rect(20, currentY, 170, 12, 'FD');
            this.doc.setFontSize(9);
            this.doc.setTextColor(34, 139, 34);
            this.doc.text(`SALE TOTAL: $${(sale.grandTotal || 0).toFixed(2)} | STATUS: ${((sale.grandTotal || 0) - (sale.amountPaid || 0)) <= 0 ? 'PAID' : 'PENDING'}`, 25, currentY + 7);
            
            currentY += 20;
        });

        return currentY;
    }

    // Add comprehensive outstanding sales section like frontend
    addOutstandingSalesSection(outstandingSales, startY) {
        if (!outstandingSales || outstandingSales.length === 0) {
            this.doc.setFontSize(16);
            this.doc.setTextColor(40, 40, 40);
            this.doc.text('Outstanding Sales - No Data Available', 20, startY);
            return startY + 30;
        }

        this.doc.setFontSize(18);
        this.doc.setTextColor(220, 20, 60);
        this.doc.text('OUTSTANDING SALES - PAYMENT TRACKING', 20, startY);
        
        // Calculate outstanding amounts like frontend
        const calculateOutstandingAmount = (sale) => {
            if (typeof sale.outstandingAmount === 'number') {
                return sale.outstandingAmount;
            }
            const totalPaid = (sale.amountPaid || 0) + (sale.totalRecovered || 0);
            return Math.max(0, (sale.grandTotal || 0) - totalPaid);
        };

        // Summary stats
        const totalOutstanding = outstandingSales.reduce((sum, sale) => sum + calculateOutstandingAmount(sale), 0);
        const partiallyPaid = outstandingSales.filter(sale => (sale.amountPaid || 0) > 0 && calculateOutstandingAmount(sale) > 0).length;
        const fullyUnpaid = outstandingSales.filter(sale => (sale.amountPaid || 0) === 0).length;
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(40, 40, 40);
        this.doc.text(`Total Outstanding: $${totalOutstanding.toFixed(2)} | Sales Count: ${outstandingSales.length} | Partially Paid: ${partiallyPaid} | Unpaid: ${fullyUnpaid}`, 20, startY + 15);

        let currentY = startY + 35;

        // Process each outstanding sale with complete details
        outstandingSales.forEach((sale, index) => {
            // Check for page break
            if (currentY > 220) {
                this.doc.addPage();
                currentY = 20;
            }

            const outstandingAmount = calculateOutstandingAmount(sale);
            const totalPaid = (sale.amountPaid || 0) + (sale.totalRecovered || 0);

            // Sale header with outstanding info
            this.doc.setFontSize(14);
            this.doc.setTextColor(220, 20, 60);
            this.doc.text(`OUTSTANDING SALE #${sale.saleNumber || (index + 1)}`, 20, currentY);
            currentY += 8;

            // Sale details matching frontend layout
            this.doc.setFontSize(10);
            this.doc.setTextColor(40, 40, 40);
            this.doc.text(`Customer: ${sale.customer?.name || 'N/A'}`, 20, currentY);
            this.doc.text(`Phone: ${sale.customer?.phone || 'N/A'}`, 120, currentY);
            currentY += 6;
            
            this.doc.text(`Sale Date: ${new Date(sale.saleDate || sale.createdAt).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}`, 20, currentY);
            this.doc.text(`Status: ${sale.recoveryStatus?.toUpperCase() || 'UNPAID'}`, 120, currentY);
            currentY += 6;
            
            this.doc.text(`Total Amount: $${(sale.grandTotal || 0).toFixed(2)}`, 20, currentY);
            this.doc.text(`Paid Amount: $${totalPaid.toFixed(2)}`, 120, currentY);
            currentY += 6;
            
            this.doc.text(`Outstanding: $${outstandingAmount.toFixed(2)}`, 20, currentY);
            const paymentPercent = sale.grandTotal > 0 ? ((totalPaid / sale.grandTotal) * 100).toFixed(1) : 0;
            this.doc.text(`Payment Progress: ${paymentPercent}%`, 120, currentY);
            currentY += 8;

            // Customer contact details if available
            if (sale.customer && sale.customer.email) {
                this.doc.setFontSize(9);
                this.doc.setTextColor(80, 80, 80);
                this.doc.text(`Email: ${sale.customer.email}`, 20, currentY);
                currentY += 5;
            }

            // Outstanding status box with color coding
            let statusColor, statusBg;
            if (outstandingAmount === 0) {
                statusColor = [34, 139, 34];
                statusBg = [240, 255, 240];
            } else if (totalPaid > 0) {
                statusColor = [255, 140, 0];
                statusBg = [255, 248, 220];
            } else {
                statusColor = [220, 20, 60];
                statusBg = [255, 240, 245];
            }
            
            this.doc.setDrawColor(...statusColor);
            this.doc.setFillColor(...statusBg);
            this.doc.rect(20, currentY, 170, 12, 'FD');
            this.doc.setFontSize(9);
            this.doc.setTextColor(...statusColor);
            
            const statusText = outstandingAmount === 0 ? 'FULLY PAID' : 
                             totalPaid > 0 ? 'PARTIALLY PAID' : 'UNPAID';
            
            this.doc.text(`PAYMENT STATUS: ${statusText} | OUTSTANDING: $${outstandingAmount.toFixed(2)} | PROGRESS: ${paymentPercent}%`, 25, currentY + 7);
            
            currentY += 20;
        });

        return currentY;
    }

    // Add comprehensive recovery section with every detail
    addRecoveriesSection(recoveries, startY) {
        if (!recoveries || recoveries.length === 0) {
            this.doc.setFontSize(16);
            this.doc.setTextColor(40, 40, 40);
            this.doc.text('Recovery Management - No Data Available', 20, startY);
            return startY + 30;
        }

        this.doc.setFontSize(18);
        this.doc.setTextColor(220, 20, 60);
        this.doc.text('RECOVERY MANAGEMENT - COMPLETE DETAILS', 20, startY);
        
        // Summary stats
        const totalRecoveries = recoveries.length;
        const totalRecovered = recoveries.reduce((sum, recovery) => sum + (recovery.recoveryAmount || 0), 0);
        const confirmedRecoveries = recoveries.filter(r => r.status === 'confirmed').length;
        const pendingRecoveries = recoveries.filter(r => r.status === 'pending').length;
        const cancelledRecoveries = recoveries.filter(r => r.status === 'cancelled').length;
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(40, 40, 40);
        this.doc.text(`Total Records: ${totalRecoveries} | Total Recovered: $${totalRecovered.toFixed(2)} | Confirmed: ${confirmedRecoveries} | Pending: ${pendingRecoveries} | Cancelled: ${cancelledRecoveries}`, 20, startY + 15);

        let currentY = startY + 35;

        // Process each recovery individually with complete details
        recoveries.forEach((recovery, index) => {
            // Check for page break
            if (currentY > 230) {
                this.doc.addPage();
                currentY = 20;
            }

            // Recovery header with complete info
            this.doc.setFontSize(14);
            this.doc.setTextColor(220, 20, 60);
            this.doc.text(`RECOVERY #${index + 1}`, 20, currentY);
            currentY += 8;

            // Recovery details in organized format
            this.doc.setFontSize(10);
            this.doc.setTextColor(40, 40, 40);
            this.doc.text(`Customer: ${recovery.customer?.name || 'N/A'}`, 20, currentY);
            this.doc.text(`Phone: ${recovery.customer?.phone || 'N/A'}`, 120, currentY);
            currentY += 6;
            
            this.doc.text(`Recovery Date: ${new Date(recovery.recoveryDate || recovery.createdAt).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}`, 20, currentY);
            this.doc.text(`Status: ${recovery.status?.toUpperCase() || 'PENDING'}`, 120, currentY);
            currentY += 6;
            
            this.doc.text(`Recovery Amount: $${(recovery.recoveryAmount || 0).toFixed(2)}`, 20, currentY);
            this.doc.text(`Payment Method: ${recovery.paymentMethod || 'N/A'}`, 120, currentY);
            currentY += 6;
            
            this.doc.text(`Sale Number: ${recovery.saleNumber || 'N/A'}`, 20, currentY);
            this.doc.text(`Received By: ${recovery.receivedBy || 'N/A'}`, 120, currentY);
            currentY += 6;
            
            // Payment reference if available
            if (recovery.paymentReference && recovery.paymentReference.trim()) {
                this.doc.text(`Payment Reference: ${recovery.paymentReference}`, 20, currentY);
                currentY += 6;
            }
            currentY += 2;

            // Notes section if available
            if (recovery.notes && recovery.notes.trim()) {
                this.doc.setFontSize(9);
                this.doc.setTextColor(80, 80, 80);
                this.doc.text(`Notes: ${recovery.notes}`, 20, currentY);
                currentY += 6;
            }

            // Customer contact details if available
            if (recovery.customer && (recovery.customer.email || recovery.customer.address)) {
                this.doc.setFontSize(9);
                this.doc.setTextColor(60, 60, 60);
                if (recovery.customer.email) {
                    this.doc.text(`Email: ${recovery.customer.email}`, 20, currentY);
                    currentY += 5;
                }
                if (recovery.customer.address) {
                    this.doc.text(`Address: ${recovery.customer.address}`, 20, currentY);
                    currentY += 5;
                }
                currentY += 3;
            }

            // Recovery status box with color coding
            let statusColor, statusBg;
            if (recovery.status === 'confirmed') {
                statusColor = [34, 139, 34];
                statusBg = [240, 255, 240];
            } else if (recovery.status === 'pending') {
                statusColor = [255, 140, 0];
                statusBg = [255, 248, 220];
            } else if (recovery.status === 'cancelled') {
                statusColor = [220, 20, 60];
                statusBg = [255, 240, 245];
            } else {
                statusColor = [128, 128, 128];
                statusBg = [248, 248, 248];
            }
            
            this.doc.setDrawColor(...statusColor);
            this.doc.setFillColor(...statusBg);
            this.doc.rect(20, currentY, 170, 12, 'FD');
            this.doc.setFontSize(9);
            this.doc.setTextColor(...statusColor);
            
            this.doc.text(`RECOVERY AMOUNT: $${(recovery.recoveryAmount || 0).toFixed(2)} | STATUS: ${recovery.status?.toUpperCase() || 'PENDING'} | REF: ${recovery.paymentReference || 'N/A'}`, 25, currentY + 7);
            
            currentY += 20;
        });

        return currentY;
    }

    // Add products/inventory section
    addInventorySection(products, startY) {
        if (!products || products.length === 0) return startY;

        this.doc.setFontSize(16);
        this.doc.setTextColor(40, 40, 40);
        this.doc.text('Inventory Summary', 20, startY);
        
        // Summary stats
        const totalProducts = products.length;
        const outOfStockProducts = products.filter(p => p.quantity <= 0).length;
        const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
        const totalInventoryValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        
        this.doc.setFontSize(12);
        this.doc.text(`Total Products: ${totalProducts}`, 20, startY + 10);
        this.doc.text(`Out of Stock: ${outOfStockProducts}`, 20, startY + 20);
        this.doc.text(`Low Stock (10 or less): ${lowStockProducts}`, 20, startY + 30);
        this.doc.text(`Total Inventory Value: $${totalInventoryValue.toFixed(2)}`, 20, startY + 40);

        // Products table (limit to 20 for space)
        const limitedProducts = products.slice(0, 20);
        const productData = limitedProducts.map(product => [
            product.name || 'N/A',
            product.category || 'N/A',
            product.quantity || 0,
            `$${(product.price || 0).toFixed(2)}`,
            `$${((product.price || 0) * (product.quantity || 0)).toFixed(2)}`,
            product.quantity <= 0 ? 'Out of Stock' : product.quantity <= 10 ? 'Low Stock' : 'In Stock'
        ]);

        const finalY = this.safeAutoTable({
            startY: startY + 50,
            head: [['Name', 'Category', 'Quantity', 'Price', 'Value', 'Status']],
            body: productData,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [128, 0, 128] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        return finalY + 20;
    }

    // Generate comprehensive report
    async generateComprehensiveReport(data) {
        this.initializeDocument();
        
        let currentY = this.addHeader('ShopMaster - Comprehensive Business Report');
        
        // Add each section
        if (data.customers) {
            currentY = this.addCustomersSection(data.customers, currentY);
        }
        
        // Check if we need a new page
        if (currentY > 250) {
            this.doc.addPage();
            currentY = 20;
        }
        
        if (data.suppliers) {
            currentY = this.addSuppliersSection(data.suppliers, currentY);
        }
        
        // Check if we need a new page
        if (currentY > 250) {
            this.doc.addPage();
            currentY = 20;
        }
        
        if (data.products) {
            currentY = this.addInventorySection(data.products, currentY);
        }
        
        // Check if we need a new page
        if (currentY > 250) {
            this.doc.addPage();
            currentY = 20;
        }
        
        if (data.sales) {
            currentY = this.addSalesSection(data.sales, currentY);
        }
        
        // Check if we need a new page
        if (currentY > 250) {
            this.doc.addPage();
            currentY = 20;
        }
        
        if (data.outstandingSales) {
            currentY = this.addOutstandingSalesSection(data.outstandingSales, currentY);
        }
        
        // Check if we need a new page
        if (currentY > 250) {
            this.doc.addPage();
            currentY = 20;
        }
        
        if (data.recoveries) {
            currentY = this.addRecoveriesSection(data.recoveries, currentY);
        }
        
        // Add footer to all pages
        const pageCount = this.doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.setFontSize(8);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            this.doc.text('Generated by ShopMaster POS System', 105, 285, { align: 'center' });
        }
        
        return this.doc;
    }

    // Save the PDF
    savePDF(filename = 'shopmaster-comprehensive-report.pdf') {
        if (!this.doc) {
            throw new Error('No document generated. Call generateComprehensiveReport first.');
        }
        this.doc.save(filename);
    }

    // Get PDF as blob for preview or email
    getPDFBlob() {
        if (!this.doc) {
            throw new Error('No document generated. Call generateComprehensiveReport first.');
        }
        return this.doc.output('blob');
    }
}

export default new ReportService();