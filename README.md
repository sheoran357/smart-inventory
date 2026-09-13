# Smart Inventory Management System

A backend inventory management system built using Node.js,
Express.js and MySQL.

## Features

- User registration and login
- JWT authentication
- Role-based authorization
- Product CRUD operations
- Inventory stock management
- Purchase management
- Inventory transaction history
- Stock adjustments
- Product search and filtering
- Pagination

## Tech Stack

- Node.js
- Express.js
- MySQL
- JWT
- bcryptjs
- REST APIs
- Postman

## API Endpoints

### Authentication

POST /api/auth/register
POST /api/auth/login

### Products

GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

### Inventory

PATCH /api/products/:id/adjust
GET /api/products/:id/transactions