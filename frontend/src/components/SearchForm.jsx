import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, ArrowLeftRight } from 'lucide-react';

const CITIES = [
  'Ahmedabad', 'Mumbai', 'Pune', 'Surat', 'Vadodara',
  'Rajkot', 'Delhi', 'Jaipur', 'Udaipur', 'Bangalore'
];

const SearchForm = ({ initialFrom = 'Ahmedabad', initialTo = 'Mumbai', initialDate = '2026-10-15' }) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate);
  const navigate = useNavigate();

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to) {
      alert('Please select both source and destination cities.');
      return;
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      alert('Source and destination cities cannot be identical.');
      return;
    }
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-4 shadow-lg border">
      <div className="row g-3 align-items-center">
        {/* FROM CITY */}
        <div className="col-lg-3 col-md-5">
          <label className="form-label text-muted small fw-semibold mb-1 d-flex align-items-center gap-1">
            <MapPin size={16} className="text-primary" /> FROM
          </label>
          <select
            className="form-select form-select-lg border-2"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
          >
            <option value="">Select Source City</option>
            {CITIES.map((c) => (
              <option key={`from-${c}`} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* SWAP BUTTON */}
        <div className="col-lg-1 col-md-2 text-center d-flex align-items-end justify-content-center pt-md-4">
          <button
            type="button"
            className="btn btn-light rounded-circle shadow-sm border p-2 text-primary"
            onClick={handleSwap}
            title="Swap Cities"
          >
            <ArrowLeftRight size={20} />
          </button>
        </div>

        {/* TO CITY */}
        <div className="col-lg-3 col-md-5">
          <label className="form-label text-muted small fw-semibold mb-1 d-flex align-items-center gap-1">
            <MapPin size={16} className="text-danger" /> TO
          </label>
          <select
            className="form-select form-select-lg border-2"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          >
            <option value="">Select Destination City</option>
            {CITIES.map((c) => (
              <option key={`to-${c}`} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* TRAVEL DATE */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label text-muted small fw-semibold mb-1 d-flex align-items-center gap-1">
            <Calendar size={16} className="text-primary" /> TRAVEL DATE
          </label>
          <input
            type="date"
            className="form-control form-control-lg border-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* SEARCH BUTTON */}
        <div className="col-lg-2 col-md-6 d-flex align-items-end pt-md-4">
          <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold py-3 shadow">
            <Search size={20} className="me-2" /> Search Buses
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
