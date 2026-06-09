import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/route/ProtectedRoute';

// Simple placeholders to represent the pages
const Home = () => (
  <div className="p-8 max-w-4xl mx-auto text-center">
    <h1 className="text-4xl font-extrabold text-primary-500 mb-4">Welcome to RentEase</h1>
    <p className="text-lg text-gray-400 mb-8">Your modern residential rental property management platform.</p>
    <div className="flex justify-center gap-4">
      <Link to="/properties" className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition">Browse Properties</Link>
      <Link to="/login" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">Sign In</Link>
    </div>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  return (
    <div className="p-8 max-w-md mx-auto bg-gray-800 rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-center text-white mb-6">Sign In to RentEase</h2>
      <form onSubmit={(e) => { e.preventDefault(); login(e.target.email.value, e.target.password.value); }} className="space-y-4">
        <input name="email" type="email" placeholder="Email Address" className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-primary-500" required />
        <input name="password" type="password" placeholder="Password" className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-primary-500" required />
        <button type="submit" className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition">Login</button>
      </form>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  return (
    <div className="p-8 max-w-md mx-auto bg-gray-800 rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-center text-white mb-6">Create an Account</h2>
      <form onSubmit={(e) => { e.preventDefault(); register(e.target.name.value, e.target.email.value, e.target.password.value, e.target.phone.value, e.target.role.value); }} className="space-y-4">
        <input name="name" type="text" placeholder="Full Name" className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none" required />
        <input name="email" type="email" placeholder="Email Address" className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none" required />
        <input name="password" type="password" placeholder="Password (min 6 chars)" className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none" required />
        <input name="phone" type="text" placeholder="Phone Number" className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none" required />
        <select name="role" className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none">
          <option value="tenant">Tenant</option>
          <option value="landlord">Landlord / Owner</option>
        </select>
        <button type="submit" className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition">Register</button>
      </form>
    </div>
  );
};

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gray-900 border-b border-gray-800 text-white">
      <Link to="/" className="text-2xl font-extrabold tracking-wider text-primary-500">RentEase</Link>
      <div className="flex items-center gap-6">
        <Link to="/properties" className="hover:text-primary-400">Properties</Link>
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-primary-400">Dashboard</Link>
            <Link to="/bookings" className="hover:text-primary-400">Bookings</Link>
            <Link to="/chat" className="hover:text-primary-400">Messages</Link>
            {user.role === 'admin' && <Link to="/admin/dashboard" className="hover:text-primary-400 font-semibold text-yellow-500">Admin</Link>}
            <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-primary-400">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm transition">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
          <Header />
          <main className="flex-grow flex items-center justify-center p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties" element={<div className="p-8 text-center text-2xl font-bold">Properties Discovery Engine</div>} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<div className="p-8 text-center text-2xl font-bold">User Dashboard</div>} />
                <Route path="/properties/add" element={<div className="p-8 text-center text-2xl font-bold">Add Property Listing</div>} />
                <Route path="/bookings" element={<div className="p-8 text-center text-2xl font-bold">Bookings Dashboard</div>} />
                <Route path="/chat" element={<div className="p-8 text-center text-2xl font-bold">Chat Conversations</div>} />
                <Route path="/payments/checkout/:bookingId" element={<div className="p-8 text-center text-2xl font-bold">Simulated Secure Checkout</div>} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<div className="p-8 text-center text-2xl font-bold text-yellow-500">Admin Control Console</div>} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
