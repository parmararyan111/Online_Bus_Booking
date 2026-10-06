import React from 'react';
import { Bus, ShieldCheck, Clock, Headphones, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary text-white p-2 rounded-3">
                <Bus size={24} />
              </div>
              <h4 className="fw-bold m-0">BusGo</h4>
            </div>
            <p className="text-secondary small">
              BusGo is India's leading online bus ticket booking platform. Book AC, Non-AC, Sleeper, and Volvo buses at guaranteed best prices with instant confirmation.
            </p>
            <div className="d-flex gap-3 text-secondary mt-3">
              <span className="badge bg-secondary bg-opacity-25 text-light px-3 py-2">
                <ShieldCheck size={14} className="me-1" /> Safe & Secure Payments
              </span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase text-primary">Quick Links</h6>
            <ul className="list-unstyled text-secondary small d-grid gap-2">
              <li><Link to="/" className="text-secondary text-decoration-none hover-white">Home</Link></li>
              <li><Link to="/search?from=Ahmedabad&to=Mumbai" className="text-secondary text-decoration-none">Search Buses</Link></li>
              <li><Link to="/my-bookings" className="text-secondary text-decoration-none">My Bookings</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none">User Login</Link></li>
              <li><Link to="/admin/login" className="text-secondary text-decoration-none">Admin Login</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase text-primary">Popular Routes</h6>
            <ul className="list-unstyled text-secondary small d-grid gap-2">
              <li><Link to="/search?from=Ahmedabad&to=Mumbai" className="text-secondary text-decoration-none">Ahmedabad → Mumbai</Link></li>
              <li><Link to="/search?from=Mumbai&to=Pune" className="text-secondary text-decoration-none">Mumbai → Pune</Link></li>
              <li><Link to="/search?from=Ahmedabad&to=Surat" className="text-secondary text-decoration-none">Ahmedabad → Surat</Link></li>
              <li><Link to="/search?from=Delhi&to=Jaipur" className="text-secondary text-decoration-none">Delhi → Jaipur</Link></li>
              <li><Link to="/search?from=Pune&to=Bangalore" className="text-secondary text-decoration-none">Pune → Bangalore</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase text-primary">Customer Support</h6>
            <div className="d-flex align-items-center gap-3 text-secondary mb-2 small">
              <Headphones size={20} className="text-primary" />
              <div>
                <div className="fw-bold text-white">24/7 Toll Free Support</div>
                <div>1800-123-4567</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 text-secondary small">
              <Clock size={20} className="text-primary" />
              <div>
                <div className="fw-bold text-white">Instant Refunds</div>
                <div>Easy Cancellation Policy</div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <div>© 2026 BusGo Inc. All rights reserved. Full-Stack Academic Project.</div>
          <div className="mt-2 mt-md-0">
            Crafted with <Heart size={14} className="text-danger fill-danger inline me-1" /> using React & Node.js
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
