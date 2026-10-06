import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import BusDetails from './pages/BusDetails';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBuses from './pages/admin/ManageBuses';
import ManageRoutes from './pages/admin/ManageRoutes';
import ManageSchedules from './pages/admin/ManageSchedules';
import ManageBookings from './pages/admin/ManageBookings';
import ManageReviews from './pages/admin/ManageReviews';
import ManagePayments from './pages/admin/ManagePayments';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/bus/:id" element={<BusDetails />} />
                <Route path="/seats/:id" element={<SeatSelection />} />
                <Route path="/passenger-details" element={<PassengerDetails />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />

                {/* User Protected Routes */}
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/booking/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><ManageUsers /></ProtectedRoute>} />
                <Route path="/admin/buses" element={<ProtectedRoute adminOnly={true}><ManageBuses /></ProtectedRoute>} />
                <Route path="/admin/routes" element={<ProtectedRoute adminOnly={true}><ManageRoutes /></ProtectedRoute>} />
                <Route path="/admin/schedules" element={<ProtectedRoute adminOnly={true}><ManageSchedules /></ProtectedRoute>} />
                <Route path="/admin/bookings" element={<ProtectedRoute adminOnly={true}><ManageBookings /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute adminOnly={true}><ManageReviews /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute adminOnly={true}><ManagePayments /></ProtectedRoute>} />

                {/* 404 Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
