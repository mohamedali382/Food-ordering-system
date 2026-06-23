# 🍔 GourmetBites — Food Ordering App

A full-stack food ordering application built with **Angular** (frontend) and **NestJS** (backend).

---

## 🚀 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Angular 19, TypeScript, SCSS      |
| Backend   | NestJS, TypeORM, SQLite           |
| Auth      | JWT (JSON Web Tokens)             |
| i18n      | ngx-translate (English & Arabic)  |

---

## 🔐 Test Credentials

### Admin Account
| Field    | Value                 |
|----------|-----------------------|
| Email    | admin@example.com     |
| Password | admin123              |
| Access   | Admin dashboard, manage orders, products, users |

### User Account
| Field    | Value                 |
|----------|-----------------------|
| Email    | user@example.com      |
| Password | user123               |
| Access   | Browse menu, cart, checkout, order tracking |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Backend (NestJS)
```bash
cd backend
npm install
npm run seed       # seeds database with users and products
npm run start:dev  # runs on http://localhost:3000
```

### Frontend (Angular)
```bash
cd frontend
npm install
ng serve           # runs on http://localhost:4200
```

---

## ✨ Features

- 🌍 Bilingual UI (English / Arabic) with RTL support
- 🔐 JWT authentication with role-based access (admin / user)
- 🛒 Shopping cart with localStorage persistence
- 📦 Order placement and real-time status tracking
- 🛠️ Admin dashboard — manage orders, products, and users
- ✅ Egyptian-specific form validation (phone, cities, zip codes)
- 📱 Fully responsive design

---

## 📁 Project Structure
