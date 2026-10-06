import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { CheckCircle2, Ticket, ArrowRight, Printer, MapPin, Calendar, Clock, Download } from 'lucide-react';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [bookingData, setBookingData] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/bookings/${id}`);
        if (res.success) {
          setBookingData(res.booking);
          setPassengers(res.passengers);
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBooking();
  }, [id]);

  if (loading) return <Loading message="Generating your confirmed bus ticket..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!bookingData) return <ErrorMessage message="Booking not found." />;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container py-5">
      <div className="text-center max-w-xl mx-auto mb-4">
        <div className="bg-success text-white p-3 rounded-circle d-inline-flex mb-3 shadow">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="fw-bold text-dark mb-1">Booking Confirmed!</h2>
        <p className="text-muted">Your bus ticket has been generated successfully.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* TICKET CARD DISPLAY */}
          <div className="ticket-card p-4 p-md-5 mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div>
                <span className="badge bg-primary px-3 py-2 me-2">ONLINE BUS TICKET</span>
                <span className="badge bg-success px-3 py-2">{bookingData.booking_status}</span>
                <h4 className="fw-bold text-dark mt-2 mb-0">{bookingData.bus_name}</h4>
                <div className="small text-muted">{bookingData.bus_type} ({bookingData.operator_name})</div>
              </div>

              <div className="text-end mt-2 mt-sm-0">
                <div className="small text-muted">Booking Reference</div>
                <div className="fs-4 fw-bold font-monospace text-primary">{bookingData.booking_reference}</div>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-sm-6">
                <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                  <MapPin size={14} className="text-primary" /> ROUTE
                </div>
                <div className="fw-bold fs-5 text-dark">{bookingData.source} → {bookingData.destination}</div>
              </div>

              <div className="col-sm-6">
                <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                  <Calendar size={14} className="text-primary" /> TRAVEL DATE & TIME
                </div>
                <div className="fw-bold fs-5 text-dark">
                  {new Date(bookingData.travel_date).toLocaleDateString()} ({bookingData.departure_time})
                </div>
              </div>
            </div>

            {/* PASSENGERS TABLE */}
            <h6 className="fw-bold text-dark mb-2">Passengers List</h6>
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

            {/* PAYMENT DETAILS */}
            <div className="bg-light p-3 rounded-3 d-flex flex-wrap justify-content-between align-items-center small">
              <div>
                <div>Transaction ID: <strong className="font-monospace">{bookingData.transaction_id || 'N/A'}</strong></div>
                <div>Payment Method: <strong>{bookingData.payment_method || 'UPI'}</strong></div>
              </div>
              <div className="text-end mt-2 mt-sm-0">
                <div className="text-muted">Total Paid</div>
                <div className="fs-3 fw-bold text-success">₹{bookingData.total_amount}</div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <button className="btn btn-outline-dark rounded-pill px-4 fw-bold" onClick={handlePrint}>
              <Printer size={18} className="me-2" /> Print / Save Ticket PDF
            </button>
            <Link to="/my-bookings" className="btn btn-primary rounded-pill px-4 fw-bold">
              <Ticket size={18} className="me-2" /> Go to My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
