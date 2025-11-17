# POS System

A modern Point of Sale system built with the MERN stack, featuring role-based access control and comprehensive business management tools.

## Overview

POS System is a full-stack web application designed for retail businesses to manage sales, inventory, customers, and suppliers. The system provides separate dashboards for different user roles (Admin, Cashier) with appropriate permissions and functionality.

## Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- CORS, dotenv

**Frontend:**
- React 19 with Vite
- Chakra UI
- Chart.js & React Charts
- jsPDF for report generation

## Features

- **Sales Management**: Process sales with automatic inventory updates
- **Inventory Control**: Track products, categories, and stock levels
- **Customer Management**: Maintain customer records and purchase history
- **Supplier Management**: Handle supplier information and transactions
- **Recovery Management**: Track pending payments and recoveries
- **Role-Based Access**: Different permissions for Admin and Cashier roles
- **Reporting**: Generate PDF reports and visual analytics
- **Responsive Design**: Works across desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js (≥14.0)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Abdul-SubhanCheema/POS.git
cd POS
```

2. **Setup Backend**
```bash
cd Backend
npm install
```

3. **Setup Frontend**
```bash
cd ../Frontend/my-app
npm install
```

4. **Environment Configuration**

Create `.env` in the Backend directory:
```env
connectionstring=mongodb://localhost:27017/pos_db
PORT=5000
```

### Running the Application

**Start Backend:**
```bash
cd Backend
npm run dev
```

**Start Frontend:**
```bash
cd Frontend/my-app
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
POS/
├── Backend/
│   ├── Controllers/     # Business logic
│   ├── Models/         # Database schemas
│   ├── Routes/         # API endpoints
│   └── server.js       # Entry point
└── Frontend/my-app/
    ├── src/
    │   ├── components/ # React components
    │   ├── services/   # API services
    │   ├── context/    # React context
    │   └── constants/  # App constants
    └── public/
```

## API Endpoints

- `POST /shop-api/customers` - Customer management
- `POST /shop-api/suppliers` - Supplier management
- `POST /shop-api/products` - Product management
- `POST /shop-api/sales` - Sales processing
- `POST /shop-api/recovery` - Recovery management

## Deployment

The application is configured for deployment on Vercel with included `vercel.json` files for both frontend and backend.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Abdul Subhan Cheema**
- GitHub: [@Abdul-SubhanCheema](https://github.com/Abdul-SubhanCheema)

# Run specific test file
npm test -- --grep "authentication"
```

---

## 📁 Project Structure

```
POS/
├── 📁 backend/                 # Backend API
│   ├── 📁 config/             # Configuration files
│   ├── 📁 controllers/        # Route controllers
│   ├── 📁 middleware/         # Express middleware
│   ├── 📁 models/             # Mongoose schemas
│   ├── 📁 routes/             # API routes
│   ├── 📁 utils/              # Utility functions
│   └── 📄 server.js           # Server entry point
├── 📁 frontend/                # React frontend
│   ├── 📁 public/             # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable components
│   │   ├── 📁 pages/          # Page components
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 context/        # React Context
│   │   ├── 📁 services/       # API services
│   │   ├── 📁 utils/          # Utility functions
│   │   └── 📄 main.jsx        # Entry point
├── 📁 docs/                   # Documentation
├── 📁 tests/                  # Test files
├── 📄 package.json            # Dependencies
├── 📄 .env.example            # Environment template
└── 📄 README.md              # Project documentation
```

---

<div align="center">

## 🌟 Key Features

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="300">

### 🛒 Sales Management
- Real-time transaction processing
- Multiple payment method support
- Invoice generation and printing
- Sales history and tracking

### 📦 Inventory Control
- Product catalog management
- Stock level monitoring
- Automatic reorder alerts
- Barcode scanning support

### 👥 Customer Management
- Customer database
- Purchase history tracking
- Loyalty program integration
- Customer analytics

### 📊 Analytics & Reporting
- Sales performance dashboards
- Financial reports (PDF generation)
- Visual charts and graphs
- Data export capabilities

### 🔐 Security Features
- Role-based access control
- JWT authentication
- Data encryption
- Audit trail logging

### ⚙️ System Administration
- User management
- System configuration
- Backup and restore
- Multi-location support

</div>

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

<div align="center">

## 📞 Contact & Support

<p align="center">
<a href="https://facebook.com/abdulsubhancheema">
  <img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white&style=flat-square" alt="Facebook"/>
</a>
<a href="https://instagram.com/abdulsubhancheema">
  <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white&style=flat-square" alt="Instagram"/>
</a>
<a href="https://linkedin.com/in/abdul-subhan-cheema">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white&style=flat-square" alt="LinkedIn"/>
</a>
<a href="mailto:abdulsubhancheema97@gmail.com">
  <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white&style=flat-square" alt="Email"/>
</a>
</p>

---

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="1000">
</div>

### 💫 *"Empowering retail businesses with modern technology solutions"* ✨

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="200">

**Built with ❤️ by Abdul Subhan Cheema | Contributing to the future of retail technology! 🚀**

</div>
