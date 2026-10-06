import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, Smartphone, Building, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const Payment = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { selectedSchedule, selectedSeats, passengers, setBookingConfirmation } = useContext(BookingContext);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('user@upi');
  const [cardNumber, setCardNumber] = useState('4532 7112 8900 1234');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!selectedSchedule || selectedSeats.length === 0 || passengers.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4>No active booking in progress</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/search')}>Search Buses</button>
      </div>
    );
  }

  const baseFare = selectedSeats.length * parseFloat(selectedSchedule.price);
  const totalAmount = baseFare;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      alert('Please sign in to complete your bus ticket booking.');
      navigate('/login', { state: { from: { pathname: '/payment' } } });
      return;
    }

    setProcessing(true);

    try {
      // Send booking creation payload to backend REST API
      const response = await api.post('/bookings', {
        schedule_id: selectedSchedule.id,
        passengers,
        payment_method: paymentMethod
      });

      if (response.success && response.booking) {
        // Save confirmation in context
        setBookingConfirmation({
          ...response.booking,
          schedule: selectedSchedule,
          passengers
        });

        // Small simulated loading delay for visual satisfaction
        setTimeout(() => {
          setProcessing(false);
          navigate(`/booking-confirmation/${response.booking.id}`);
        }, 1200);
      }
    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Payment processing failed. Selected seat may have been taken.');
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center max-w-xl mx-auto mb-4">
        <span className="badge bg-warning text-dark px-3 py-2 fw-bold mb-2">
          SIMULATED PAYMENT SYSTEM (Academic Demo)
        </span>
        <h3 className="fw-bold text-dark">Checkout & Secure Payment</h3>
        <p className="text-muted small">No real funds will be charged. Choose a test payment method to proceed.</p>
      </div>

      <div className="row justify-content-center g-4">
        <div className="col-lg-7">
          <div className="card card-custom border-0 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Select Payment Method</h5>

            {error && (
              <div className="alert alert-danger p-3 mb-3 small d-flex align-items-center gap-2">
                <AlertCircle size={18} />
                <div>{error}</div>
              </div>
            )}

            {/* PAYMENT METHOD TABS */}
            <div className="row g-2 mb-4">
              {[
                { id: 'UPI', label: 'UPI / QR Code', icon: <Smartphone size={18} /> },
                { id: 'Credit Card', label: 'Credit Card', icon: <CreditCard size={18} /> },
                { id: 'Debit Card', label: 'Debit Card', icon: <CreditCard size={18} /> },
                { id: 'Net Banking', label: 'Net Banking', icon: <Building size={18} /> }
              ].map((m) => (
                <div key={m.id} className="col-6 col-sm-3">
                  <button
                    type="button"
                    className={`btn w-100 p-3 rounded-3 text-center border ${
                      paymentMethod === m.id ? 'btn-primary shadow-sm fw-bold' : 'btn-light text-dark'
                    }`}
                    onClick={() => setPaymentMethod(m.id)}
                  >
                    <div className="mb-1">{m.icon}</div>
                    <div className="small">{m.label}</div>
                  </button>
                </div>
              ))}
            </div>

            {/* DYNAMIC METHOD FIELDS */}
            <form onSubmit={handlePayNow}>
              {paymentMethod === 'UPI' && (
                <div className="bg-light p-3 rounded-3 border mb-4">
                  <label className="form-label small fw-semibold">Virtual Payment Address (VPA / UPI ID)</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="example@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                  <small className="text-muted">Enter any test UPI ID (e.g. yourname@okicici, paytm@upi)</small>
                </div>
              )}

              {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                <div className="bg-light p-3 rounded-3 border mb-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="4532 7112 8900 1234"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">CVV</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="123"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Net Banking' && (
                <div className="bg-light p-3 rounded-3 border mb-4">
                  <label className="form-label small fw-semibold">Select Your Bank</label>
                  <select className="form-select mb-2" defaultValue="SBI">
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                  </select>
                  <small className="text-muted">Simulated test netbanking transaction</small>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-success btn-lg w-100 fw-bold rounded-pill shadow d-flex align-items-center justify-content-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    <span>Pay ₹{totalAmount} Now</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FARE BREAKDOWN SIDEBAR */}
        <div className="col-lg-5">
          <div className="card card-custom border-0 p-4">
            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Payment Summary</h5>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Bus:</span>
              <strong className="text-dark">{selectedSchedule.bus_name}</strong>
            </div>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Route:</span>
              <strong className="text-dark">{selectedSchedule.source} → {selectedSchedule.destination}</strong>
            </div>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Selected Seats:</span>
              <strong className="text-primary">{selectedSeats.join(', ')}</strong>
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-2">
              <span>Total Amount Payable:</span>
              <span className="fs-3 fw-bold text-success">₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
