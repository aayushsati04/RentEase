import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/route/ProtectedRoute';

// Global Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Views
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import UserDashboardPage from './pages/UserDashboardPage';
import BookingsDashboardPage from './pages/BookingsDashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ChatPage from './pages/ChatPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col noise">
          
          {/* Global Toast Container */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'glass text-white border border-white/8',
              style: {
                background: 'rgba(15, 22, 41, 0.85)',
                backdropFilter: 'blur(16px)',
              },
            }} 
          />

          {/* Sticky Navigation Header */}
          <Navbar />
          
          {/* Main Workspace Frame */}
          <main className="flex-grow w-full flex flex-col">
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              
              {/* Renter/Owner Protected Workspaces */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/properties/add" element={<AddPropertyPage />} />
                <Route path="/bookings" element={<BookingsDashboardPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/payments/checkout/:id" element={<CheckoutPage />} />
              </Route>

              {/* Administrative Protected Console */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              </Route>
            </Routes>
          </main>

          {/* Premium Site Footer */}
          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
