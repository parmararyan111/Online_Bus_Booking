import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Star, MessageSquare } from 'lucide-react';

const ManageReviews = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusesList = async () => {
      try {
        const res = await api.get('/buses');
        if (res.success && res.buses.length > 0) {
          setBuses(res.buses);
          setSelectedBusId(res.buses[0].id);
        }
      } catch (err) {
        setError('Failed to load bus list.');
      }
    };

    fetchBusesList();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedBusId) return;
      setLoading(true);
      try {
        const res = await api.get(`/reviews/bus/${selectedBusId}`);
        if (res.success) {
          setReviews(res.reviews);
        }
      } catch (err) {
        setError('Failed to fetch bus reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedBusId]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <MessageSquare className="text-primary" /> Passenger Reviews & Feedback
          </h3>
          <p className="text-muted small m-0">Monitor bus ratings and passenger comments submitted for journeys</p>
        </div>

        {buses.length > 0 && (
          <select
            className="form-select w-auto mt-2 mt-md-0"
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
          >
            {buses.map((b) => (
              <option key={b.id} value={b.id}>{b.bus_name} ({b.bus_number})</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <Loading message="Loading reviews..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : reviews.length === 0 ? (
        <div className="card card-custom border-0 p-5 text-center text-muted">
          No passenger reviews registered for this bus yet.
        </div>
      ) : (
        <div className="row g-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="col-md-6">
              <div className="card card-custom border-0 p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark">{rev.user_name}</strong>
                  <span className="badge bg-success d-flex align-items-center gap-1">
                    <Star size={12} className="fill-white" /> {rev.rating} / 5
                  </span>
                </div>
                <p className="text-dark small mb-3">"{rev.comment}"</p>
                <small className="text-muted opacity-75 mt-auto">
                  Submitted: {new Date(rev.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
