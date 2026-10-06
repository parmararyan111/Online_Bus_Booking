import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Bus, Star, Wifi, Zap, Shield, Coffee, MapPin, User, ChevronRight } from 'lucide-react';

const BusDetails = () => {
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusDetails = async () => {
      setLoading(true);
      try {
        const busRes = await api.get(`/buses/${id}`);
        if (busRes.success) {
          setBus(busRes.bus);
        }

        const revRes = await api.get(`/reviews/bus/${id}`);
        if (revRes.success) {
          setReviews(revRes.reviews);
          setReviewSummary(revRes.summary);
        }
      } catch (err) {
        setError(err.message || 'Failed to load bus details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetails();
  }, [id]);

  if (loading) return <Loading message="Loading bus specifications & reviews..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!bus) return <ErrorMessage message="Bus not found." />;

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* BUS MAIN INFO */}
        <div className="col-lg-8">
          <div className="card card-custom border-0 p-4 mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between border-bottom pb-3 mb-3">
              <div>
                <span className="badge bg-primary px-3 py-2 me-2">{bus.bus_type}</span>
                <span className="badge bg-secondary px-3 py-2">{bus.bus_number}</span>
                <h2 className="fw-bold text-dark mt-2 mb-0">{bus.bus_name}</h2>
                <div className="text-muted small">Operator: {bus.operator_name}</div>
              </div>

              <div className="text-end mt-2 mt-sm-0">
                <div className="fs-3 fw-bold text-success d-flex align-items-center justify-content-end gap-1">
                  <Star size={24} className="fill-success text-success" />
                  <span>{reviewSummary?.average_rating || '4.5'}</span>
                </div>
                <div className="small text-muted">{reviewSummary?.total_reviews || 0} Ratings</div>
              </div>
            </div>

            {/* Amenities Section */}
            <h5 className="fw-bold text-dark mb-3">Bus Amenities</h5>
            <div className="row g-3 mb-4">
              {[
                { name: 'Free High-Speed WiFi', icon: <Wifi className="text-primary" /> },
                { name: 'Personal Charging Socket', icon: <Zap className="text-warning" /> },
                { name: 'Water Bottle & Snacks', icon: <Coffee className="text-danger" /> },
                { name: 'GPS Live Tracking', icon: <Shield className="text-success" /> }
              ].map((item, idx) => (
                <div key={idx} className="col-6 col-md-3">
                  <div className="border rounded-3 p-3 text-center bg-light">
                    <div className="mb-2">{item.icon}</div>
                    <div className="small fw-semibold text-dark">{item.name}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-muted small">
              {bus.amenities || 'Equipped with comfortable reclining seats, emergency safety hammers, fire extinguishers, and sanitized blankets.'}
            </p>
          </div>

          {/* REVIEWS & RATINGS */}
          <div className="card card-custom border-0 p-4">
            <h4 className="fw-bold text-dark mb-3">Passenger Ratings & Reviews</h4>

            {reviews.length === 0 ? (
              <p className="text-muted italic">No passenger reviews submitted for this bus yet.</p>
            ) : (
              <div className="d-grid gap-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-bottom pb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary text-white rounded-circle fw-bold d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          {rev.user_name?.charAt(0) || 'U'}
                        </div>
                        <strong className="text-dark">{rev.user_name}</strong>
                      </div>
                      <span className="badge bg-success d-flex align-items-center gap-1">
                        <Star size={12} className="fill-white" /> {rev.rating} / 5
                      </span>
                    </div>
                    <p className="text-muted small mb-1">{rev.comment}</p>
                    <small className="text-secondary opacity-75">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR ACTION */}
        <div className="col-lg-4">
          <div className="card card-custom border-0 p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold text-dark mb-3">Book Seat on Bus</h5>
            <div className="mb-3 small text-muted">
              Total Seats Capacity: <strong className="text-dark">{bus.total_seats} Seats</strong>
            </div>

            <Link
              to="/search?from=Ahmedabad&to=Mumbai"
              className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
            >
              <span>Search Routes & Book</span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;
