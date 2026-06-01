# Premium MERN E-Commerce Store 🛒

A state-of-the-art, premium full-stack E-Commerce platform powered by the **MERN Stack** (MongoDB, Express, React, Node.js). Optimized with intelligent **Redis Caching** (with automatic in-memory fallback), secure **Stripe Checkout**, **Cloudinary CDN Storage**, and a visually stunning **Sales Analytics & Admin Dashboard** styled using **Tailwind CSS**.

---

### 🌐 Live Demo & Production Build
* **Production URL:** [mern-ecommerce-store-rho.vercel.app](https://mern-ecommerce-store-rho.vercel.app/)

> [!NOTE]
> **Unified Architecture:** The production release uses Vercel Serverless routing to host both the React frontend and the Express REST API (`/api`) under a single origin. This guarantees zero CORS overhead and smooth single-origin cookies for token authentication.

---

## 🚀 What's New in This Update

We have introduced major feature updates to simplify local setup and facilitate seamless production-ready deployments:

### 1. ⚡ Zero-Config Redis In-Memory Fallback
* **Intelligent Auto-detection:** If `UPSTASH_REDIS_URL` is omitted from your `.env` configuration, the backend automatically intercepts calls and spins up a local **in-memory Map cache** mimicking Redis interface endpoints (`get`, `set`, `del`).
* **Zero Dependencies:** Developers can now clone and run the full store instantly without setting up or creating an Upstash Redis database, while maintaining identical features locally!

### 2. ☁️ Native Vercel Serverless Deployment Setup
* **Seamless Serverless Integration:** Added fully configured root `vercel.json` routing specifications.
* **Dual Builders:** Configured `@vercel/node` to execute our modular Express API routes dynamically and `@vercel/static-build` to compile our Vite-powered SPA React frontend.
* **Production Export:** Rewrote `backend/server.js` as an exported module allowing Vercel to dynamically load the entrypoint in serverless environments.

---

## 🛠️ Technology Stack & Badges

<p align="left">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

| Layer | Technologies | Role & Impact |
| :--- | :--- | :--- |
| **Frontend UI** | `React 18`, `Vite`, `Tailwind CSS`, `Lucide Icons` | Modern SPA with ultra-responsive grids, custom theme gradients, and hot module replacements. |
| **Backend API** | `Node.js`, `Express.js` | Modular REST API handles authentication, order flow, checkout, and category CRUD operations. |
| **Database** | `MongoDB`, `Mongoose ODM` | Schema-based models storing user profiles, robust product listings, coupon collections, and verified orders. |
| **Performance** | `Upstash Redis` (with local in-memory fallback) | High-speed cache for real-time analytics dashboards, order volume aggregation, and temporary sessions. |
| **Media CDN** | `Cloudinary API` | Programmatic image upload for products with auto-optimizations and instant globally cached edge delivery. |
| **Checkout & Pay** | `Stripe Node API` | Secure checkout sessions, dynamic discount applications, automated item details injection, and webhook validations. |

---

## ✨ Key Features & Capability Matrix

* 🔐 **Secure JWT-with-Rotation Authentication:** Implements dual-token mechanics (short-lived `AccessToken` and persistent `RefreshToken`) stored in secure, tamper-proof `httpOnly` cookies.
* 💳 **Dynamic Stripe Checkout Integration:** Interactive user-facing carts hook directly into Stripe checkout sessions. Supports coupon logic and webhook verification to prevent tampering.
* 📊 **Comprehensive Admin Control Panel:** Complete CRUD interface for products and categories. Beautiful interactive sales graphs displaying weekly revenue, order velocity, and overall transaction volume.
* 🏷️ **Dynamic Promotion Codes & Coupons:** Custom admin-created promotional codes applied dynamically at Stripe checkout and updated inside MongoDB on completion.
* 🛍️ **Performant Shopping Cart State:** Fully reactive cart component utilizing smooth client state synchronized securely back to database stores.

---

## ⚙️ Local Development Setup

Follow these clean steps to spin up the MERN E-Commerce Store on your local computer:

### 1. Clone & Set Up Your Environment Variable File
Create a `.env` file in the root directory and specify the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

# OPTIONAL: Omit to automatically run the elegant in-memory Map mock instead!
UPSTASH_REDIS_URL=your_upstash_redis_connection_url

# Secrets (Make these long, random alphanumeric strings)
ACCESS_TOKEN_SECRET=your_jwt_access_token_random_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_random_secret

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Install Project Dependencies & Build Assets
```bash
# Install root/backend dependencies
npm install

# Install frontend UI dependencies
npm install --prefix frontend

# Pre-compile the React client bundle
npm run build --prefix frontend
```

### 3. Seed Mock Products (Optional but Recommended)
Quickly populate your store with premium pre-configured sample products across multiple categories:
```bash
npm run seed
```

### 4. Start the Local Server
Run the unified development hot-reloaded workspace:
```bash
npm run dev
```

* **Client application running at:** `http://localhost:5173` (Vite dev server)
* **Server endpoints served at:** `http://localhost:5000` (Express REST server)

---

## 🧠 Technical Deep-Dive: Fallback Caching

Our database helper [redis.js](file:///c:/Users/rravi/Downloads/AI-Projects-main%20%282%29/AI-Projects-main/MERN-Ecommerce-Store/backend/lib/redis.js) automatically monitors your server environment context. If `UPSTASH_REDIS_URL` is undefined, the app switches modes seamlessly:

```javascript
if (!redisUrl) {
    console.warn("UPSTASH_REDIS_URL is not set. Using an in-memory fallback mock for Redis features.");
    
    const store = new Map();
    redisClient = {
        async set(key, value) { store.set(key, value); return "OK"; },
        async get(key) { return store.get(key) || null; },
        async del(key) { store.delete(key); return 1; },
        ...
    };
}
```

This structure makes onboarding simple and ensures that developers can run unit tests or local environments entirely offline.

---

## 📦 Production Serverless Deployments

### 🌐 Deploying to Vercel
Our pre-configured `vercel.json` maps unified traffic to separate builders dynamically.

To deploy the workspace to Vercel instantly:
1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the root directory.
3. Configure your production environment variables (MongoDB, Stripe, Cloudinary, etc.) inside the Vercel project dashboard.
4. Enjoy automated serverless performance!

For alternative deployment patterns (e.g. **Railway** or **Render**), please check our comprehensive [DEPLOY.md](file:///c:/Users/rravi/Downloads/AI-Projects-main%20%282%29/AI-Projects-main/MERN-Ecommerce-Store/DEPLOY.md) instruction handbook.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/rravi/Downloads/AI-Projects-main%20%282%29/AI-Projects-main/MERN-Ecommerce-Store/LICENSE) file for details.

