import React from 'react';
import SearchForm from '../components/SearchForm';
import { Bus, ShieldCheck, Clock, Award, Star, ArrowRight, MapPin, Zap, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero-banner text-center text-white">
        <div className="container py-4">
          <div className="badge bg-primary bg-opacity-50 text-light px-3 py-2 rounded-pill mb-3 fw-normal">
            ⚡ India's premier bus booking network
          </div>
          <h1 className="display-4 fw-extrabold tracking-tight mb-3">
            Book Your Bus Journey Easily
          </h1>
          <p className="lead text-light text-opacity-75 max-w-2xl mx-auto mb-5">
            Search, compare and book buses at the best prices with instant confirmation, live tracking, and easy refunds.
          </p>
        </div>
      </section>

      {/* FLOATING SEARCH CARD */}
      <div className="container search-card-wrapper mb-5">
        <SearchForm />
      </div>

      {/* POPULAR ROUTES */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small">Top Destinations</span>
              <h2 className="fw-bold text-dark mb-0">Popular Bus Routes</h2>
            </div>
            <Link to="/search?from=Ahmedabad&to=Mumbai" className="btn btn-outline-primary rounded-pill btn-sm font-weight-bold">
              View All Routes <ArrowRight size={16} className="ms-1" />
            </Link>
          </div>

          <div className="row g-4">
            {[
              { from: 'Ahmedabad', to: 'Mumbai', time: '8h 30m', price: '899', buses: '12+ Daily Buses', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80' },
              { from: 'Mumbai', to: 'Pune', time: '3h 30m', price: '350', buses: '25+ Daily Buses', img: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80' },
              { from: 'Ahmedabad', to: 'Surat', time: '4h 15m', price: '450', buses: '18+ Daily Buses', img: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80' },
              { from: 'Delhi', to: 'Jaipur', time: '5h 30m', price: '750', buses: '15+ Daily Buses', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80' }
            ].map((route, idx) => (
              <div key={idx} className="col-lg-3 col-md-6">
                <div className="card card-custom h-100 overflow-hidden border-0">
                  <div className="position-relative" style={{ height: '160px', overflow: 'hidden' }}>
                    <img src={route.img} alt={route.from} className="w-100 h-100 object-fit-cover" />
                    <span className="position-absolute top-0 end-0 bg-primary text-white badge m-2 px-2 py-1">
                      From ₹{route.price}
                    </span>
                  </div>
                  <div className="card-body p-3">
                    <h5 className="fw-bold mb-1 text-dark">
                      {route.from} → {route.to}
                    </h5>
                    <div className="small text-muted mb-3 d-flex justify-content-between">
                      <span>{route.time}</span>
                      <span className="text-success fw-medium">{route.buses}</span>
                    </div>
                    <Link
                      to={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=2026-10-15`}
                      className="btn btn-light btn-sm w-100 fw-bold text-primary border"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-primary fw-bold text-uppercase small">Unmatched Experience</span>
            <h2 className="fw-bold text-dark">Why Choose BusGo?</h2>
            <p className="text-muted">We provide a seamless travel experience backed by top-rated operators, transparent pricing, and 24/7 customer care.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 text-center">
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-flex mx-auto mb-3">
                  <ShieldCheck size={32} />
                </div>
                <h5 className="fw-bold">Verified Bus Operators</h5>
                <p className="text-muted small m-0">Only government-certified and top-rated private bus operators are listed on our platform.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 text-center">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-inline-flex mx-auto mb-3">
                  <Zap size={32} />
                </div>
                <h5 className="fw-bold">Instant Seat Confirmation</h5>
                <p className="text-muted small m-0">Select your preferred seat from interactive layouts and get your ticket instantly on SMS/Email.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 text-center">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mx-auto mb-3">
                  <Clock size={32} />
                </div>
                <h5 className="fw-bold">Instant Refunds</h5>
                <p className="text-muted small m-0">Hassle-free 1-click cancellation with quick simulated refund directly to your original payment method.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Real Feedback</span>
            <h2 className="fw-bold text-dark">What Our Passengers Say</h2>
          </div>

          <div className="row g-4">
            {[
              { name: 'John Doe', city: 'Ahmedabad', rating: 5, comment: 'Extremely comfortable Volvo AC Sleeper journey. Booking on BusGo took less than 2 minutes!' },
              { name: 'Jane Smith', city: 'Mumbai', rating: 5, comment: 'Loved the live seat availability feature. Received my ticket QR code immediately.' },
              { name: 'Rahul Sharma', city: 'Pune', rating: 4, comment: 'Clean buses and punctual timings. Highly recommend BusGo for quick intercity travel.' }
            ].map((rev, idx) => (
              <div key={idx} className="col-md-4">
                <div className="card border rounded-4 p-4 shadow-sm h-100">
                  <div className="d-flex gap-1 mb-3 text-warning">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={18} className="fill-warning" />
                    ))}
                  </div>
                  <p className="text-dark mb-4 italic font-medium">"{rev.comment}"</p>
                  <div className="d-flex align-items-center gap-3 mt-auto">
                    <div className="bg-primary text-white rounded-circle fw-bold d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <h6 className="fw-bold m-0">{rev.name}</h6>
                      <small className="text-muted">{rev.city}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
