import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Ticket, Star, Printer, MapPin, Calendar, Clock, QrCode, ArrowLeft, Send } from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/${id}`);
      if (res.success) {
        setBooking(res.booking);
        setPassengers(res.passengers);
        setUserReview(res.userReview);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        bus_id: booking.bus_id,
        booking_id: booking.id,
        rating,
        comment
      });
      if (res.success) {
        alert('Thank you for rating your trip!');
        fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loading message="Retrieving digital ticket details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!booking) return <ErrorMessage message="Ticket details not found." />;

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <Link to="/my-bookings" className="btn btn-light rounded-circle p-2 border">
            <ArrowLeft size={20} />
          </Link>
          <h3 className="fw-bold text-dark m-0">Bus Ticket Details</h3>
        </div>

        <button className="btn btn-outline-dark rounded-pill px-4 fw-bold" onClick={() => window.print()}>
          <Printer size={18} className="me-2" /> Print Ticket
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* TICKET CONTAINER */}
          <div className="ticket-card p-4 p-md-5 mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div>
                <span className="badge bg-primary px-3 py-2 me-2">ONLINE BUS TICKET</span>
                <span className="badge bg-success px-3 py-2">{booking.booking_status}</span>
                <h4 className="fw-bold text-dark mt-2 mb-0">{booking.bus_name}</h4>
                <div className="small text-muted">{booking.bus_type} ({booking.operator_name})</div>
              </div>

              <div className="text-end mt-2 mt-sm-0">
                <div className="small text-muted">Booking Reference</div>
                <div className="fs-4 fw-bold font-monospace text-primary">{booking.booking_reference}</div>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-sm-6">
                <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                  <MapPin size={14} className="text-primary" /> ROUTE
                </div>
                <div className="fw-bold fs-5 text-dark">{booking.source} → {booking.destination}</div>
              </div>

              <div className="col-sm-6">
                <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                  <Calendar size={14} className="text-primary" /> TRAVEL DATE & DEPARTURE
                </div>
                <div className="fw-bold fs-5 text-dark">
                  {new Date(booking.travel_date).toLocaleDateString()} ({booking.departure_time})
                </div>
              </div>
            </div>

            {/* PASSENGERS */}
            <h6 className="fw-bold text-dark mb-2">Passengers</h6>
            <div className="table-responsive mb-4">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Seat No</th>
                    <th>Passenger Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-primary">{p.seat_number}</td>
                      <td>{p.passenger_name}</td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QR CODE & TRANSACTION FOOTER */}
            <div className="bg-light p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between">
              <div>
                <div className="small text-muted">Transaction ID: <strong className="font-monospace text-dark">{booking.transaction_id || 'N/A'}</strong></div>
                <div className="small text-muted">Payment Status: <strong className="text-success">{booking.payment_status || 'SUCCESS'}</strong></div>
                <div className="small text-muted">Total Amount: <strong className="text-dark fs-5">₹{booking.total_amount}</strong></div>
              </div>

              <div className="text-center mt-3 mt-sm-0 p-2 bg-white rounded border">
                <QrCode size={64} className="text-dark" />
                <div className="small text-muted font-monospace mt-1" style={{ fontSize: '10px' }}>
                  {booking.booking_reference}
                </div>
              </div>
            </div>
          </div>

          {/* RATING & REVIEWS SECTION */}
          {(booking.booking_status === 'CONFIRMED' || booking.booking_status === 'COMPLETED') && (
            <div className="card card-custom border-0 p-4">
              <h5 className="fw-bold text-dark mb-3">Rate & Review Your Journey</h5>

              {userReview ? (
                <div className="alert alert-success p-3 rounded-3">
                  <div className="d-flex align-items-center gap-1 mb-2 text-warning">
                    {[...Array(userReview.rating)].map((_, i) => (
                      <Star key={i} size={18} className="fill-warning" />
                    ))}
                    <span className="fw-bold text-dark ms-2">{userReview.rating} / 5 Stars</span>
                  </div>
                  <p className="m-0 text-dark small">"{userReview.comment}"</p>
                  <small className="text-muted opacity-75">Submitted on {new Date(userReview.created_at).toLocaleDateString()}</small>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Rating (1 to 5 Stars)</label>
                    <select
                      className="form-select w-auto"
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                    >
                      <option value="5">5 Stars - Outstanding</option>
                      <option value="4">4 Stars - Good</option>
                      <option value="3">3 Stars - Average</option>
                      <option value="2">2 Stars - Poor</option>
                      <option value="1">1 Star - Very Poor</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Write Your Review</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Share your experience regarding bus cleanliness, comfort, punctuality, and staff behavior..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                    disabled={submittingReview}
                  >
                    <Send size={16} /> Submit Review
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
