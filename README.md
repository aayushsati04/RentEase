# RentEase

RentEase is a production-ready MERN (MongoDB, Express, React, Node.js) stack residential rental property management platform. It offers JWT authentication, role-based dashboards, property listing verification, secure simulated payments, and real-time chat between tenants and landlords.

## Project Structure

* **`backend/`** - Node.js & Express REST API with Socket.io integration.
* **`frontend/`** - React SPA initialized with Vite and styled with Tailwind CSS.

---

## Getting Started

### 1. Prerequisite
Ensure you have **Node.js** (v18+) and **MongoDB** installed on your system.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment configuration:
   Create a `.env` file in the `backend/` folder based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rentease
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

---

## Core Features & Modules
* **User Authentication**: Secure Login & Sign Up with role assignments ('tenant', 'landlord', 'admin') using JWT.
* **Property CRUD**: Property creation, update, and search filtering by location, rent limit, and room specifications.
* **Booking System**: Request rentals and manage statuses (Pending, Approved, Rejected).
* **Simulated Payments**: Initiation of checkouts and payment verification for bookings.
* **Real-time Messages**: Instant messaging using WebSockets (Socket.io).
* **Admin Dashboard**: Verification checkmarks for listings, user deletion, and platform-wide statistics.
