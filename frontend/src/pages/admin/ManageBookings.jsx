import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Ticket, Search, XCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAdminCancel = async (id) => {
    if (!window.confirm('As an Administrator, are you sure you want to cancel this booking and issue a refund?')) {
      return;
    }
    try {
      const res = await api.put(`/bookings/${id}/cancel`);
      if (res.success) {
        alert('Booking cancelled successfully!');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.booking_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <Ticket className="text-primary" /> Manage Customer Bookings
          </h3>
          <p className="text-muted small m-0">Inspect all reservations, passenger manifests, payment transactions and cancellations</p>
        </div>

        <div className="d-flex gap-2 mt-2 mt-md-0">
          <select
            className="form-select w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <div className="input-group w-auto">
            <span className="input-group-text bg-white"><Search size={18} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search reference, user, route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading system reservations..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBookings} />
      ) : (
        <div className="card card-custom border-0 p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-bold text-primary font-monospace">{b.booking_reference}</td>
                    <td>
                      <div className="fw-bold text-dark">{b.user_name}</div>
                      <small className="text-muted">{b.user_email}</small>
                    </td>
                    <td>{b.source} → {b.destination}</td>
                    <td>{new Date(b.travel_date).toLocaleDateString()}</td>
                    <td><span className="badge bg-light text-dark border">{b.seat_numbers || `${b.total_seats} Seats`}</span></td>
                    <td className="fw-bold text-success">₹{b.total_amount}</td>
                    <td>
                      <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'bg-success' : b.booking_status === 'CANCELLED' ? 'bg-danger' : 'bg-secondary'}`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/booking/${b.id}`} className="btn btn-sm btn-outline-primary me-1 rounded-pill">
                        <FileText size={14} /> View
                      </Link>
                      {b.booking_status === 'CONFIRMED' && (
                        <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleAdminCancel(b.id)}>
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
