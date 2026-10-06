import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Users, Bus, MapPin, Calendar, Ticket, IndianRupee,
  CheckCircle, XCircle, TrendingUp, BarChart3, Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setStats(res.stats);
        setMonthlyStats(res.monthlyStats);
        setPopularRoutes(res.popularRoutes);
        setRecentBookings(res.recentBookings);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Loading Administrator Analytics & System Health..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="container py-4">
      {/* Admin Title Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 bg-white p-3 rounded-4 shadow-sm border">
        <div>
          <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <BarChart3 className="text-danger" /> Admin Overview & Statistics
          </h3>
          <p className="text-muted small m-0">Real-time system overview, bookings metrics, revenue and user activity</p>
        </div>

        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link to="/admin/buses" className="btn btn-outline-primary btn-sm rounded-pill font-weight-bold">
            <Bus size={14} className="me-1" /> Manage Buses
          </Link>
          <Link to="/admin/schedules" className="btn btn-outline-success btn-sm rounded-pill font-weight-bold">
            <Calendar size={14} className="me-1" /> Manage Schedules
          </Link>
        </div>
      </div>

      {/* METRICS STATS CARDS */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold">TOTAL USERS</div>
                  <div className="fs-2 fw-bold text-dark">{stats.totalUsers}</div>
                </div>
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <Users size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-info">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold">ACTIVE BUSES</div>
                  <div className="fs-2 fw-bold text-dark">{stats.totalBuses}</div>
                </div>
                <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                  <Bus size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-warning">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold">SYSTEM ROUTES</div>
                  <div className="fs-2 fw-bold text-dark">{stats.totalRoutes}</div>
                </div>
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                  <MapPin size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-success">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold">TOTAL REVENUE</div>
                  <div className="fs-2 fw-bold text-success">₹{stats.totalRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <div className="small text-muted mb-1">Total Bookings</div>
              <div className="fs-4 fw-bold text-dark">{stats.totalBookings}</div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <div className="small text-muted mb-1">Confirmed Bookings</div>
              <div className="fs-4 fw-bold text-success">{stats.confirmedBookings}</div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <div className="small text-muted mb-1">Completed Trips</div>
              <div className="fs-4 fw-bold text-primary">{stats.completedBookings}</div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <div className="small text-muted mb-1">Cancelled Bookings</div>
              <div className="fs-4 fw-bold text-danger">{stats.cancelledBookings}</div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MANAGEMENT LINKS BAR */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Manage Users', path: '/admin/users', icon: <Users size={18} /> },
          { label: 'Manage Buses', path: '/admin/buses', icon: <Bus size={18} /> },
          { label: 'Manage Routes', path: '/admin/routes', icon: <MapPin size={18} /> },
          { label: 'Manage Schedules', path: '/admin/schedules', icon: <Calendar size={18} /> },
          { label: 'Manage Bookings', path: '/admin/bookings', icon: <Ticket size={18} /> },
          { label: 'Revenue Reports', path: '/admin/payments', icon: <TrendingUp size={18} /> }
        ].map((item, idx) => (
          <div key={idx} className="col-md-2 col-6">
            <Link to={item.path} className="btn btn-white w-100 p-3 rounded-3 shadow-sm border text-center d-block text-dark font-weight-bold">
              <div className="text-primary mb-1">{item.icon}</div>
              <div className="small fw-semibold">{item.label}</div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* POPULAR ROUTES & REVENUE BREAKDOWN */}
        <div className="col-lg-5">
          <div className="card card-custom border-0 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Popular Routes</h5>
            <div className="d-grid gap-3">
              {popularRoutes.map((r, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between border-bottom pb-2">
                  <div>
                    <div className="fw-bold text-dark">{r.route_name}</div>
                    <small className="text-muted">{r.total_bookings} Total Bookings</small>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2">
                    ₹{parseFloat(r.total_revenue).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT BOOKINGS TABLE */}
        <div className="col-lg-7">
          <div className="card card-custom border-0 p-4">
            <h5 className="fw-bold text-dark mb-3">Recent Bookings</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Ref</th>
                    <th>User</th>
                    <th>Bus / Route</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="font-monospace fw-bold text-primary">{b.booking_reference}</td>
                      <td>{b.user_name}</td>
                      <td>{b.source} → {b.destination}</td>
                      <td>
                        <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'bg-success' : b.booking_status === 'CANCELLED' ? 'bg-danger' : 'bg-secondary'}`}>
                          {b.booking_status}
                        </span>
                      </td>
                      <td className="fw-bold">₹{b.total_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
