import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookingContext } from '../context/BookingContext';
import SeatLayout from '../components/SeatLayout';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Bus, Calendar, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

const SeatSelection = () => {
  const { id } = useParams(); // Schedule ID
  const navigate = useNavigate();
  const {
    setSelectedSchedule,
    selectedSeats,
    setSelectedSeats,
    selectSeatToggle,
    setPassengers
  } = useContext(BookingContext);

  const [scheduleData, setScheduleData] = useState(null);
  const [seatLayout, setSeatLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/schedules/${id}/seats`);
        if (data.success) {
          setScheduleData(data.schedule);
          setSelectedSchedule(data.schedule);
          setSeatLayout(data.seatLayout);
        }
      } catch (err) {
        setError(err.message || 'Failed to load seat layout.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [id]);

  const pricePerSeat = parseFloat(scheduleData?.price || 0);
  const totalPrice = selectedSeats.length * pricePerSeat;

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one available seat to continue.');
      return;
    }

    // Initialize default passenger forms array for selected seats
    const initialPassengers = selectedSeats.map((seatNum) => ({
      seat_number: seatNum,
      passenger_name: '',
      age: '',
      gender: 'Male'
    }));

    setPassengers(initialPassengers);
    navigate('/passenger-details');
  };

  if (loading) return <Loading message="Loading real-time seat layout..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!scheduleData) return <ErrorMessage message="Schedule details not found." />;

  return (
    <div className="container py-5">
      {/* Route & Schedule Summary Banner */}
      <div className="card card-custom border-0 p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-7">
            <h4 className="fw-bold text-dark mb-1">
              {scheduleData.source} → {scheduleData.destination}
            </h4>
            <div className="small text-muted d-flex flex-wrap gap-3">
              <span>Bus: <strong>{scheduleData.bus_name}</strong> ({scheduleData.bus_type})</span>
              <span>Date: <strong>{new Date(scheduleData.travel_date).toLocaleDateString()}</strong></span>
              <span>Departure: <strong>{scheduleData.departure_time}</strong></span>
            </div>
          </div>
          <div className="col-md-5 text-md-end mt-3 mt-md-0">
            <span className="badge bg-light text-dark border px-3 py-2 fs-6">
              ₹{pricePerSeat} / Seat
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* SEAT MAP */}
        <div className="col-lg-7">
          <div className="card card-custom border-0 p-4">
            <h5 className="fw-bold text-dark mb-3 text-center">Select Your Seats</h5>
            <SeatLayout
              seats={seatLayout}
              selectedSeats={selectedSeats}
              onSeatClick={selectSeatToggle}
              busType={scheduleData.bus_type}
            />
          </div>
        </div>

        {/* BOOKING SUMMARY SIDEBAR */}
        <div className="col-lg-5">
          <div className="card card-custom border-0 p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Booking Summary</h5>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Selected Seats ({selectedSeats.length}):</span>
              <strong className="text-dark">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None Selected'}
              </strong>
            </div>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Price per seat:</span>
              <strong className="text-dark">₹{pricePerSeat}</strong>
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-4">
              <span className="fs-5 fw-bold text-dark">Total Amount:</span>
              <span className="fs-3 fw-bold text-primary">₹{totalPrice}</span>
            </div>

            <button
              className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow d-flex align-items-center justify-content-center gap-2"
              disabled={selectedSeats.length === 0}
              onClick={handleContinue}
            >
              <span>Continue to Passenger Details</span>
              <ArrowRight size={20} />
            </button>

            <div className="small text-muted text-center mt-3 d-flex align-items-center justify-content-center gap-1">
              <ShieldAlert size={14} className="text-warning" /> Backend re-verifies seat lock on checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
