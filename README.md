# E-Commerce Ordering & Payment System

A scalable backend REST API for managing users, products, categories, orders, and payments with support for multiple payment providers using the Strategy Pattern.

## Features

- User Authentication (JWT)
- Role-based Authorization (Admin/User)
- Product Management
- Category Management
- Order Management
- Order Item Management
- Stripe Payment Integration
- bKash Payment Integration
- Payment Strategy Pattern
- Stripe Webhook
- bKash Callback
- Stock Management
- Prisma ORM
- PostgreSQL
- Redis Category Cache
- DFS Product Recommendation
- Docker Support
- Swagger API Documentation

---

# Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- Stripe
- bKash Tokenized Checkout
- JWT
- Docker

---

# Project Structure

```
src
│
├── app
│   ├── modules
│   │   ├── auth
│   │   ├── user
│   │   ├── product
│   │   ├── category
│   │   ├── order
│   │   ├── payment
│   │
│   ├── middleware
│   ├── routes
│   └── utils
│
├── config
├── prisma
└── server.ts
```

---

# Installation

Clone repository

```bash
git clone https://github.com/pmppiyas/raco_ai_commerce_backend
```

Go to project

```bash
cd raco_ai_commerce_backend
```

Install dependencies

```bash
pnpm install
```

---

# Environment Variables

Create a `.env` file.

```env
PORT=5000

NODE_ENV=development

DATABASE_URL=

CLOUD_NAME=
API_KEY=
API_SECRET=

SALT_NUMBER=8

ACCESS_TOKEN=
ACCESS_EXPIRED=1d

REFRESH_SECRET=
REFRESH_EXPIRED=7d

REDIS_URL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

BKASH_BASE_URL=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_CALLBACK_URL=
```

---

# Database

Run migration

```bash
pnpx prisma migrate dev
```

Generate Prisma Client

```bash
pnpx prisma generate
```

Seed database

```bash
pnpx prisma db seed
```

---

# Run Project

Development

```bash
pnpm run dev
```

Production

```bash
pnpm run build
pnpm start
```

---

# Docker

Build

```bash
docker-compose up --build
```

Stop

```bash
docker-compose down
```

---

# Authentication

Register

```
POST /api/v1/auth/register
```

Login

```
POST /api/v1/auth/login
```

---

# Products

Create Product (Admin)

```
POST /api/v1/products
```

Get Products

```
GET /api/v1/products
```

Product Details

```
GET /api/v1/products/:id
```

Update Product

```
PATCH /api/v1/products/:id
```

Delete Product

```
DELETE /api/v1/products/:id
```

---

# Categories

Create Category

```
POST /api/v1/categories
```

Get Categories

```
GET /api/v1/categories
```

DFS Recommendation

```
GET /api/v1/categories/:id/recommendations
```

---

# Orders

Create Order

```
POST /api/v1/orders
```

My Orders

```
GET /api/v1/orders/my-orders
```

Order Details

```
GET /api/v1/orders/:id
```

---

# Payments

Create Payment

```
POST /api/v1/payments
```

Stripe Webhook

```
POST /api/v1/payments/webhook/stripe
```

bKash Callback

```
POST /api/v1/payments/callback/bkash
```

---

# Payment Providers

## Stripe

- Payment Intent
- Webhook Verification
- Payment Confirmation
- Order Status Update

## bKash

- Create Checkout
- Execute Payment
- Query Payment
- Callback Handling
- Order Status Update

---

# Payment Flow

```
User

↓

Create Order

↓

Pending Order

↓

Choose Payment Provider

↓

Stripe / bKash

↓

Payment Success

↓

Payment Updated

↓

Order Paid

↓

Reduce Stock
```

---

# Design Pattern

Strategy Pattern is used to support multiple payment providers.

```
IPaymentStrategy
        │
 ┌──────┴────────┐
 │               │
StripePayment  BkashPayment
```

This makes it easy to add future payment providers without changing the order management logic.

---

# DFS Recommendation

Category hierarchy is traversed using Depth First Search (DFS).

Example

```
Electronics

├── Mobile
│   ├── Android
│   └── iPhone
│
└── Laptop
```

DFS collects all child categories and recommends products from those categories.

---

# Redis Cache

Category tree is cached in Redis.

Flow

```
Request

↓

Redis

↓

Cache Miss

↓

Database

↓

Store Cache

↓

DFS

↓

Products
```

---

# Testing

Run tests

```bash
npm test
```

---

# API Documentation

Swagger

```
http://localhost:5000/api/docs
```

Postman Collection

```
/docs/postman_collection.json
```

---

# Deployment

Frontend

```
Vercel
```

Backend

```
Node.js + Express
```

Webhook Testing

```
ngrok http 5000
```

---

# Author

Name: Prince Mahmud Piyas
Email: princemahmudpiyas@gmail.com
Linkedin: https://www.linkedin.com/in/pmppiyas
