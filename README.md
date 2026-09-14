# Smart Inventory Management System

A full-stack inventory management application built using **React.js, Node.js, Express.js, and MySQL**.

The system allows users to manage products, inventory stock, purchases, sales, suppliers, categories, users, transactions, and business reports from a centralized dashboard.

---

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (RBAC)
- Admin, Manager, and Staff roles
- Protected API routes

### Product Management
- Create products
- Update products
- Delete products
- Restore inactive products
- Search products
- Filter products
- Pagination
- Reorder-level tracking

### Inventory Management
- Track product stock
- Stock adjustments
- Low-stock monitoring
- Purchase-based stock updates
- Sale-based stock reduction
- Inventory transaction history
- Stock movement tracking

### Purchase Management
- Create purchase records
- Update purchase records
- Track suppliers
- Track purchase quantity
- Track purchase cost
- Automatically increase inventory stock

### Sales Management
- Create sales
- Track selling price
- Track quantity sold
- Calculate total sale amount
- Automatically decrease inventory stock
- Sales history
- Date-based filtering

### Supplier Management
- Add suppliers
- Update suppliers
- Delete suppliers
- Store supplier contact information

### Category Management
- Add categories
- Update categories
- Delete categories
- Assign categories to products

### User Management
- View users
- Search users
- Filter users by role
- Pagination
- Change user roles
- Admin-controlled role management

### Dashboard & Reports
- Total products
- Total inventory units
- Inventory value
- Total sales
- Total revenue
- Total purchases
- Today's sales
- Today's revenue
- Low-stock products
- Top-selling products
- Sales summary
- Sales by product
- Inventory report
- Date-based report filtering

---

## Tech Stack

### Frontend
- React.js
- React Router
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JWT
- bcryptjs

### Database
- MySQL
- mysql2

### Tools
- Git
- GitHub
- VS Code
- Postman
- ESLint

---

## Project Structure

```text
smart-inventory/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controller/
│   ├── Middleware/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md