import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BookingCard from '../components/BookingCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Ticket, AlertCircle } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/bookings');
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this bus booking? Seats will be released and a simulated refund issued.')) {
      return;
    }

    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      if (res.success) {
        setActionMessage('Booking cancelled successfully! Simulated refund processed.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Ticket className="text-primary" /> My Bus Bookings
          </h3>
          <p className="text-muted small m-0">View ticket details, download tickets or cancel eligible trips</p>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 p-3 small mb-4" role="alert">
          {actionMessage}
          <button type="button" className="btn-close" onClick={() => setActionMessage('')}></button>
        </div>
      )}

      {loading ? (
        <Loading message="Fetching your booking history..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <div className="text-center bg-white p-5 rounded-4 border shadow-sm">
          <Ticket size={48} className="text-muted mb-3" />
          <h4 className="fw-bold text-dark">No Bookings Found</h4>
          <p className="text-muted">You haven't booked any bus tickets yet.</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onCancel={handleCancelBooking}
          />
        ))
      )}
    </div>
  );
};

export default MyBookings;
