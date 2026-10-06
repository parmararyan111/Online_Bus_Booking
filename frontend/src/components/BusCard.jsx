import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Wifi, Zap, Coffee, Shield, CheckCircle2, ChevronRight } from 'lucide-react';

const BusCard = ({ schedule }) => {
  const navigate = useNavigate();

  const handleSelectSeats = () => {
    navigate(`/seats/${schedule.schedule_id}`);
  };

  const isAvailable = schedule.available_seats > 0;

  return (
    <div className="card card-custom mb-3 overflow-hidden border-0">
      <div className="card-body p-4">
        <div className="row align-items-center g-3">
          {/* BUS INFO */}
          <div className="col-lg-4 col-md-12">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h5 className="fw-bold text-dark mb-0">{schedule.bus_name}</h5>
              <span className="badge bg-light text-dark border">{schedule.bus_type}</span>
            </div>
            <div className="small text-muted mb-2">
              Operator: <strong className="text-dark">{schedule.operator_name}</strong> | No: {schedule.bus_number}
            </div>

            {/* Rating */}
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success d-flex align-items-center gap-1 px-2 py-1">
                <Star size={12} className="fill-white" /> {schedule.average_rating || '4.5'}
              </span>
              <span className="small text-muted">({schedule.review_count || 12} Ratings)</span>
            </div>
          </div>

          {/* TIMINGS & ROUTE */}
          <div className="col-lg-5 col-md-8">
            <div className="d-flex align-items-center justify-content-between text-center px-2">
              <div className="text-start">
                <div className="fs-4 fw-bold text-dark">{schedule.departure_time}</div>
                <div className="fw-semibold text-primary">{schedule.source}</div>
              </div>

              <div className="flex-grow-1 px-3">
                <div className="small text-muted mb-1 d-flex align-items-center justify-content-center gap-1">
                  <Clock size={14} /> {schedule.distance_km ? `${schedule.distance_km} km` : 'Direct'}
                </div>
                <div className="position-relative d-flex align-items-center justify-content-center">
                  <div className="w-100 border-top border-2 border-primary"></div>
                  <ChevronRight size={18} className="text-primary position-absolute bg-white" />
                </div>
              </div>

              <div className="text-end">
                <div className="fs-4 fw-bold text-dark">{schedule.arrival_time}</div>
                <div className="fw-semibold text-danger">{schedule.destination}</div>
              </div>
            </div>

            {/* Amenities icons preview */}
            <div className="d-flex gap-3 text-muted small mt-3 pt-2 border-top">
              <span className="d-flex align-items-center gap-1"><Wifi size={14} className="text-primary" /> Free WiFi</span>
              <span className="d-flex align-items-center gap-1"><Zap size={14} className="text-warning" /> Charging</span>
              <span className="d-flex align-items-center gap-1"><Shield size={14} className="text-success" /> Tracked</span>
            </div>
          </div>

          {/* PRICE & SEATS ACTION */}
          <div className="col-lg-3 col-md-4 text-lg-end text-md-end text-start border-start-lg pt-3 pt-lg-0">
            <div className="small text-muted">Starting from</div>
            <div className="fs-2 fw-bold text-primary mb-1">₹{schedule.price}</div>
            
            <div className={`small fw-bold mb-3 ${isAvailable ? 'text-success' : 'text-danger'}`}>
              {isAvailable ? `${schedule.available_seats} Seats Available` : 'Sold Out'}
            </div>

            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-primary fw-bold py-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={handleSelectSeats}
                disabled={!isAvailable}
              >
                <span>Select Seats</span>
                <ChevronRight size={18} />
              </button>
              <Link to={`/bus/${schedule.bus_id}`} className="btn btn-link text-decoration-none small text-muted p-0">
                View Bus Details & Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
