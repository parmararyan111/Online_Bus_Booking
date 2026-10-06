import React from 'react';
import { User, Hash, Calendar } from 'lucide-react';

const PassengerForm = ({ passenger, index, onChange }) => {
  return (
    <div className="card border rounded-3 p-3 mb-3 bg-light">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <h6 className="fw-bold m-0 text-primary d-flex align-items-center gap-2">
          <User size={18} /> Passenger {index + 1}
        </h6>
        <span className="badge bg-primary px-3 py-2 fs-6">Seat: {passenger.seat_number}</span>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label small fw-semibold">Full Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter passenger name"
            value={passenger.passenger_name}
            onChange={(e) => onChange(index, 'passenger_name', e.target.value)}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-semibold">Age *</label>
          <input
            type="number"
            className="form-control"
            placeholder="Age"
            min="1"
            max="120"
            value={passenger.age}
            onChange={(e) => onChange(index, 'age', e.target.value)}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-semibold">Gender *</label>
          <select
            className="form-select"
            value={passenger.gender}
            onChange={(e) => onChange(index, 'gender', e.target.value)}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PassengerForm;
