import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';
import { AuthContext } from '../context/AuthContext';
import PassengerForm from '../components/PassengerForm';
import { ArrowRight, UserCheck, Mail, Phone, ArrowLeft } from 'lucide-react';

const PassengerDetails = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { selectedSchedule, selectedSeats, passengers, setPassengers } = useContext(BookingContext);

  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');

  if (!selectedSchedule || selectedSeats.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4>No seats selected yet</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/search')}>Search Buses</button>
      </div>
    );
  }

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate passenger names and ages
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.passenger_name.trim()) {
        setError(`Please enter Full Name for Passenger ${i + 1} (Seat ${p.seat_number}).`);
        return;
      }
      if (!p.age || parseInt(p.age) <= 0) {
        setError(`Please enter a valid age for Passenger ${i + 1}.`);
        return;
      }
    }

    if (!contactEmail || !contactPhone) {
      setError('Please provide contact email and phone number.');
      return;
    }

    // Proceed to Payment
    navigate('/payment');
  };

  const pricePerSeat = parseFloat(selectedSchedule.price);
  const totalAmount = selectedSeats.length * pricePerSeat;

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center gap-2 mb-4">
        <button className="btn btn-light rounded-circle p-2 border" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h3 className="fw-bold text-dark m-0">Passenger Information</h3>
      </div>

      <div className="row g-4">
        {/* PASSENGER FORMS */}
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger p-3 mb-3 small">{error}</div>}

            <div className="card card-custom border-0 p-4 mb-4">
              <h5 className="fw-bold text-dark mb-3">Passenger Details</h5>
              {passengers.map((passenger, idx) => (
                <PassengerForm
                  key={passenger.seat_number}
                  passenger={passenger}
                  index={idx}
                  onChange={handlePassengerChange}
                />
              ))}
            </div>

            {/* CONTACT DETAILS */}
            <div className="card card-custom border-0 p-4 mb-4">
              <h5 className="fw-bold text-dark mb-3">Ticket Contact Details</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Contact Email *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Mail size={18} /></span>
                    <input
                      type="email"
                      className="form-control"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Contact Phone *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Phone size={18} /></span>
                    <input
                      type="tel"
                      className="form-control"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
            >
              <span>Proceed to Payment</span>
              <ArrowRight size={20} />
            </button>
          </form>
        </div>

        {/* SUMMARY SIDEBAR */}
        <div className="col-lg-4">
          <div className="card card-custom border-0 p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Trip Summary</h5>

            <div className="mb-2">
              <div className="fw-bold text-dark">{selectedSchedule.source} → {selectedSchedule.destination}</div>
              <div className="small text-muted">{selectedSchedule.bus_name} ({selectedSchedule.bus_type})</div>
            </div>

            <div className="small text-muted mb-2">
              Date: <strong>{new Date(selectedSchedule.travel_date).toLocaleDateString()}</strong>
            </div>

            <div className="small text-muted mb-3">
              Seats: <strong className="text-primary">{selectedSeats.join(', ')}</strong>
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-2 small">
              <span>Base Fare ({selectedSeats.length} Seats):</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small text-success">
              <span>Convenience Fee:</span>
              <span>FREE</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between">
              <span className="fw-bold text-dark">Total Amount:</span>
              <span className="fs-3 fw-bold text-primary">₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
