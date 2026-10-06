import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { TrendingUp, Bus, IndianRupee, ShieldCheck } from 'lucide-react';

const ManagePayments = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/revenue');
      if (res.success) {
        setRevenueData(res.revenueByBus);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch revenue analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const totalSystemRevenue = revenueData.reduce((acc, curr) => acc + parseFloat(curr.total_revenue || 0), 0);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <TrendingUp className="text-success" /> Revenue & Financial Analytics
          </h3>
          <p className="text-muted small m-0">Detailed breakdown of income and ticket sales per bus operator</p>
        </div>

        <div className="bg-success text-white px-4 py-2 rounded-pill shadow-sm">
          <span className="small opacity-75 me-2">Cumulative Gross Sales:</span>
          <span className="fs-5 fw-bold">₹{totalSystemRevenue.toLocaleString()}</span>
        </div>
      </div>

      {loading ? (
        <Loading message="Computing revenue totals..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchRevenue} />
      ) : (
        <div className="card card-custom border-0 p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Bus ID</th>
                  <th>Bus Name</th>
                  <th>Bus Number</th>
                  <th>Operator</th>
                  <th>Total Confirmed Bookings</th>
                  <th>Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((b) => (
                  <tr key={b.bus_id}>
                    <td>#{b.bus_id}</td>
                    <td className="fw-bold text-dark">{b.bus_name}</td>
                    <td className="font-monospace fw-bold text-primary">{b.bus_number}</td>
                    <td>{b.operator_name}</td>
                    <td className="fw-bold">{b.total_bookings} Bookings</td>
                    <td className="fw-bold text-success fs-6">₹{parseFloat(b.total_revenue).toLocaleString()}</td>
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

export default ManagePayments;
