<div align="center">

# 🏪 POS System

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=500&size=22&pause=1000&color=2E8B57&center=true&vCenter=true&width=600&lines=Modern+Point+of+Sale+Solution;Built+with+MERN+Stack;Role-Based+Access+Control" alt="Typing SVG" />

![GitHub last commit](https://img.shields.io/github/last-commit/Abdul-SubhanCheema/POS?style=flat-square&color=2E8B57)
![GitHub language count](https://img.shields.io/github/languages/count/Abdul-SubhanCheema/POS?style=flat-square&color=2E8B57)
![GitHub top language](https://img.shields.io/github/languages/top/Abdul-SubhanCheema/POS?style=flat-square&color=2E8B57)

</div>

---

A modern Point of Sale system built with the MERN stack, featuring role-based access control and comprehensive business management tools.

## Overview

POS System is a full-stack web application designed for retail businesses to manage sales, inventory, customers, and suppliers. The system provides separate dashboards for different user roles (Admin, Cashier) with appropriate permissions and functionality.

## 🛠️ Tech Stack

<div align="center">

### Backend
<p>
<img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
<img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose"/>
</p>

### Frontend
<p>
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/Chakra--UI-319795?style=for-the-badge&logo=chakra-ui&logoColor=white" alt="Chakra UI"/>
<img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" alt="Chart.js"/>
</p>

</div>

## ✨ Features

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="400">
</div>

<table>
<tr>
<td>

🛒 **Sales Management**
- Process sales with automatic inventory updates
- Multiple payment methods
- Real-time transaction tracking

📦 **Inventory Control** 
- Track products, categories, and stock levels
- Low stock alerts
- Automated reordering

</td>
<td>

👥 **Customer Management**
- Maintain customer records and purchase history
- Customer loyalty programs
- Purchase analytics

🏢 **Supplier Management**
- Handle supplier information and transactions
- Purchase order management
- Supplier performance tracking

</td>
</tr>
<tr>
<td>

💰 **Recovery Management**
- Track pending payments and recoveries
- Automated reminders
- Payment history

🔐 **Role-Based Access**
- Different permissions for Admin and Cashier roles
- Secure authentication
- User activity logging

</td>
<td>

📊 **Reporting & Analytics**
- Generate PDF reports and visual analytics
- Sales trends and insights
- Financial summaries

📱 **Responsive Design**
- Works across desktop and mobile devices
- Modern UI/UX
- Cross-platform compatibility

</td>
</tr>
</table>

## 🚀 Quick Start

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif" width="300">
</div>

### 📋 Prerequisites

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

## 📁 Project Structure

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="300">
</div>

```
POS/
├── Backend/                 # 🖥️ Server-side application
│   ├── Controllers/         # 🎮 Business logic
│   ├── Models/             # 📊 Database schemas
│   ├── Routes/             # 🛣️ API endpoints
│   └── server.js           # 🚀 Entry point
└── Frontend/my-app/        # 🌐 Client-side application
    ├── src/
    │   ├── components/     # ⚛️ React components
    │   ├── services/       # 🔗 API services
    │   ├── context/        # 🗂️ React context
    │   └── constants/      # 📋 App constants
    └── public/             # 📂 Static assets
```

## 🔗 API Endpoints

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212257467-871d32b7-e401-42e8-a166-fcfd7baa4c6b.gif" width="250">
</div>

### Customer Management
- `GET /shop-api/customers` - Get all customers
- `POST /shop-api/customers` - Create new customer
- `PUT /shop-api/customers/:id` - Update customer
- `DELETE /shop-api/customers/:id` - Delete customer

### Product Management
- `GET /shop-api/products` - Get all products
- `POST /shop-api/products` - Create new product
- `PUT /shop-api/products/:id` - Update product
- `DELETE /shop-api/products/:id` - Delete product

### Sales Management
- `GET /shop-api/sales` - Get sales history
- `POST /shop-api/sales` - Process new sale
- `GET /shop-api/sales/:id` - Get sale details

### Supplier Management
- `GET /shop-api/suppliers` - Get all suppliers
- `POST /shop-api/suppliers` - Create new supplier
- `PUT /shop-api/suppliers/:id` - Update supplier
- `DELETE /shop-api/suppliers/:id` - Delete supplier

### Recovery Management
- `GET /shop-api/recovery` - Get recovery records
- `POST /shop-api/recovery` - Create recovery record
- `PUT /shop-api/recovery/:id` - Update recovery

## Deployment

The application is configured for deployment on Vercel with included `vercel.json` files for both frontend and backend.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

<div align="center">

**Abdul Subhan Cheema**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Abdul-SubhanCheema)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/abdulsubhan303)

<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="600">

### 💫 *"Building the future of retail technology, one line of code at a time"* ✨

<img src="https://user-images.githubusercontent.com/74038190/213910845-af37a709-8995-40d6-be59-724526e3c3d7.gif" width="100">

**⭐ If this project helped you, consider giving it a star!**

</div>
