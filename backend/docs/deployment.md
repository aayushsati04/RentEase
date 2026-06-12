# RentEase Backend — Production Deployment Guide

This document outlines the steps and best practices to provision, configure, secure, and deploy the RentEase MERN backend API into a production environment.

---

## 1. Environment Variable Configuration

Create a `.env` file in your hosting provider's environment properties with the following keys:

| Environment Variable | Description | Production Value Example |
| :--- | :--- | :--- |
| `PORT` | Listening server port. | `80` or `5000` |
| `MONGODB_URI` | MongoDB Connection URL. | `mongodb+srv://admin:pass@cluster.mongodb.net/rentease` |
| `JWT_SECRET` | Secret key for signing web tokens. | *[Generate a 256-bit secure random string]* |
| `JWT_EXPIRE` | Token duration. | `7d` |
| `NODE_ENV` | Running node environment. | `production` |

---

## 2. Database Provisioning (MongoDB Atlas)

1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a shared tier cluster (M0 is free) and select your preferred cloud provider (AWS/GCP/Azure).
3. Create a Database User with read and write permissions. Note down the password.
4. Whitelist IP addresses:
   - For initial testing, allow access from anywhere: `0.0.0.0/0`.
   - In production, restrict access to the IP address of your hosting provider (e.g. Render/Heroku static IPs).
5. Copy the connection string (choose "Connect your application" option) and update the `MONGODB_URI` variable.

---

## 3. Host Provisioning & Deployment

The codebase is prepared for immediate deployment to PaaS hosting services.

### Option A: Deploying to Render (Recommended)
1. Sign in to [Render](https://render.com).
2. Click **New** ➔ **Web Service**.
3. Connect your GitHub repository containing the monorepo.
4. Set the following configurations:
   - **Environment**: `Node`
   - **Build Command**: `npm install --prefix backend`
   - **Start Command**: `npm start --prefix backend`
5. Go to **Advanced** ➔ **Add Environment Variable** and copy keys from Section 1.
6. Click **Deploy Web Service**. Render will automatically run build logs, start the server, and assign a public HTTPS domain.

### Option B: Deploying to Heroku
1. Install Heroku CLI locally.
2. Log in and create an app:
   ```bash
   heroku login
   heroku create rentease-api
   ```
3. Set environment configuration:
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://... JWT_SECRET=... NODE_ENV=production
   ```
4. Push to deploy:
   ```bash
   git push heroku main
   ```

---

## 4. Production Hardening & Optimization

The codebase incorporates several production-grade optimization and security configurations out-of-the-box:

### Security Configurations
- **Centralized Validation**: `express-validator` prevents malformed payload insertions and checks inputs at the HTTP router entrypoint.
- **Helmet Headers**: `helmet` manages standard security headers (XSS Filter, HSTS, Frame Options) protecting the app from clickjacking and injection attacks.
- **Brute-Force Limiters**: Strict rate-limit restrictions prevent DOS attacks:
  - sensitive routes (`/api/auth/login`, `/api/auth/register`) are capped at 15 attempts per 15 minutes.
  - general endpoints are restricted to 100 requests per 15 minutes.
- **CORS Configuration**: Restricts requests to whitelisted origins. In production, configure whitelisted domains explicitly in [server.js](file:///c:/Users/User%20Lenovo/Desktop/RentEase/backend/server.js).

### Performance Configurations
- **Payload Compression**: The server utilizes Gzip compression via `compression` middleware to automatically compress JSON and static files.
- **Collection Index Scan (ixscan)**: Compounded indexes are configured on Mongoose models ([Property](file:///c:/Users/User%20Lenovo/Desktop/RentEase/backend/models/Property.js), [Booking](file:///c:/Users/User%20Lenovo/Desktop/RentEase/backend/models/Booking.js), [Payment](file:///c:/Users/User%20Lenovo/Desktop/RentEase/backend/models/Payment.js), [Chat](file:///c:/Users/User%20Lenovo/Desktop/RentEase/backend/models/Chat.js)) to avoid expensive collection scans (`collscan`), enabling sub-millisecond retrieval speeds under heavy traffic.
