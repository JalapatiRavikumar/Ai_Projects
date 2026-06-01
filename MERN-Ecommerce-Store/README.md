# E-Commerce Store 🛒

A premium, state-of-the-art full-stack eCommerce platform built using the **MERN Stack** (MongoDB, Express, React, Node.js) and supercharged with **Upstash Redis Caching**, **Stripe Payments**, **Cloudinary Media Storage**, and a beautifully designed **Sales Analytics Admin Dashboard** using **Tailwind CSS**.

---

### 🌐 Live Demo & Resources
* **Live Web App:** [https://ecommerce-frontend-gamma-neon.vercel.app/](https://ecommerce-frontend-gamma-neon.vercel.app/)
* **Video Tutorial on YouTube:** [Watch the Tutorial](https://youtu.be/sX57TLIPNx8)

> [!NOTE]
> A single optimized service handles both the React frontend (`/`) and the Express REST API (`/api`). This allows unified CORS mapping and seamless single-origin requests.

---

## ✨ Key Features

*   🚀 **Modern Project Architecture:** Clean separation of concerns with a backend Express API and a Vite-powered React frontend.
*   🔐 **Robust JWT Authentication:** Secure login & registration using JWT with rotation (Access and Refresh tokens) stored securely in HTTP-only cookies.
*   🗄️ **Multi-Tier Database & Cache:** Persistent MongoDB storage integrated with Upstash Redis for high-performance session caching and analytics tracking.
*   💳 **Stripe Checkout Integration:** End-to-end payment processing with customizable checkout sessions, dynamic discount applications, and webhook callbacks.
*   👑 **Advanced Admin Dashboard:** Real-time analytics, product CRUD operations, and Category management.
*   📊 **Sales Analytics Engine:** Beautiful graphs representing weekly sales, total revenue, and order counts.
*   🏷️ **Dynamic Coupon Code System:** Admin-generated promotional coupon codes applied dynamically on Stripe checkout.
*   🛍️ **High-Performance Shopping Cart:** Smooth state management for active carts, item addition/subtraction, and automated price calculations.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS | Declarative component UI with rapid page building and hot reloads. |
| **Backend** | Node.js, Express.js | High-performance, lightweight asynchronous REST API. |
| **Database** | MongoDB, Mongoose | Flexible Document-store database representing products, users, and orders. |
| **Cache** | Upstash Redis | Microsecond-latency cache representing active counts and metrics. |
| **Media** | Cloudinary | Auto-optimized CDN storage representing product graphics and banners. |
| **Payments** | Stripe API | Highly secure PCI-compliant global checkout infrastructure. |

---

## ⚙️ Local Development Setup

To run this application locally, you will need to set up your environment variables and launch the dev environment.

### 1. Configure the `.env` file
Create a `.env` file in the root directory of the project and populate it with the following configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

UPSTASH_REDIS_URL=your_upstash_redis_connection_url

ACCESS_TOKEN_SECRET=your_jwt_access_token_random_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_random_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Install dependencies & build
Install Node modules for both backend and frontend, then compile the UI:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix frontend

# Build frontend production assets
npm run build --prefix frontend
```

### 3. Seed initial products (Optional)
To populate sample products in your local or remote database:
```bash
npm run seed
```

### 4. Start the application
Launch the development server:
```bash
npm run start
```
The application will serve:
* **Frontend UI:** `http://localhost:5000` (or `http://localhost:5173` in development mode)
* **Backend API:** `http://localhost:5000/api`

---

## 📦 Deployment Guide

For a unified production setup where one URL serves the entire application, refer to the [DEPLOY.md](file:///c:/Users/rravi/Downloads/AI-Projects-main%20%282%29/AI-Projects-main/MERN-Ecommerce-Store/DEPLOY.md) file. It includes instructions for:
* **Blueprint Deployments** on **Render** (via `render.yaml`)
* **Unified Services** on **Railway**

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/rravi/Downloads/AI-Projects-main%20%282%29/AI-Projects-main/MERN-Ecommerce-Store/LICENSE) file for details.
