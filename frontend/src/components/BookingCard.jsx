import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, AlertCircle, FileText, XCircle } from 'lucide-react';

const BookingCard = ({ booking, onCancel }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-confirmed px-3 py-2">CONFIRMED</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed px-3 py-2">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled px-3 py-2">CANCELLED</span>;
      default:
        return <span className="badge badge-pending px-3 py-2">{status}</span>;
    }
  };

  const formattedDate = booking.travel_date
    ? new Date(booking.travel_date).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  return (
    <div className="card card-custom mb-3 border-0">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div>
            <div className="small text-muted">Booking Reference</div>
            <h5 className="fw-bold font-monospace text-primary mb-0">{booking.booking_reference}</h5>
          </div>
          <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
            {getStatusBadge(booking.booking_status)}
            <span className="fs-5 fw-bold text-dark">₹{booking.total_amount}</span>
          </div>
        </div>

        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <h6 className="fw-bold text-dark mb-1">{booking.bus_name}</h6>
            <div className="small text-muted mb-2">{booking.bus_type} ({booking.operator_name})</div>
            <div className="d-flex align-items-center gap-2 small text-dark">
              <MapPin size={16} className="text-primary" />
              <span><strong>{booking.source}</strong> → <strong>{booking.destination}</strong></span>
            </div>
          </div>

          <div className="col-md-4">
            <div className="small text-muted d-flex align-items-center gap-1 mb-1">
              <Calendar size={14} /> Journey Date: <strong className="text-dark">{formattedDate}</strong>
            </div>
            <div className="small text-muted d-flex align-items-center gap-1 mb-1">
              <Clock size={14} /> Time: <strong className="text-dark">{booking.departure_time} - {booking.arrival_time}</strong>
            </div>
            <div className="small text-dark">
              Seats: <span className="badge bg-light text-dark border fw-bold me-1">{booking.seat_numbers || `${booking.total_seats} Seats`}</span>
            </div>
          </div>

          <div className="col-md-3 text-md-end mt-3 mt-md-0">
            <div className="d-flex flex-column gap-2">
              <Link to={`/booking/${booking.id}`} className="btn btn-outline-primary btn-sm rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-1">
                <FileText size={14} /> View Ticket / Details
              </Link>
              {booking.booking_status === 'CONFIRMED' && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="btn btn-outline-danger btn-sm rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-1"
                >
                  <XCircle size={14} /> Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
