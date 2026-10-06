import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import SearchForm from '../components/SearchForm';
import BusCard from '../components/BusCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Filter, SlidersHorizontal, Bus, ArrowUpDown } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || 'Ahmedabad';
  const to = searchParams.get('to') || 'Mumbai';
  const date = searchParams.get('date') || '2026-10-15';

  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedOperator, setSelectedOperator] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState('departure');

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
      if (data.success) {
        setSchedules(data.schedules);
        setFilteredSchedules(data.schedules);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bus schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [from, to, date]);

  // Apply Client-Side Filters & Sorting
  useEffect(() => {
    let result = [...schedules];

    // Filter by Bus Type
    if (selectedType !== 'ALL') {
      result = result.filter((s) => s.bus_type.includes(selectedType));
    }

    // Filter by Operator
    if (selectedOperator !== 'ALL') {
      result = result.filter((s) => s.operator_name === selectedOperator);
    }

    // Filter by Price
    result = result.filter((s) => parseFloat(s.price) <= maxPrice);

    // Sorting
    if (sortBy === 'price_low') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'departure') {
      result.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    setFilteredSchedules(result);
  }, [schedules, selectedType, selectedOperator, maxPrice, sortBy]);

  // Unique list of operators from current results
  const operators = Array.from(new Set(schedules.map((s) => s.operator_name)));

  return (
    <div className="container py-4">
      {/* Top Compact Search Form */}
      <div className="mb-4">
        <SearchForm initialFrom={from} initialTo={to} initialDate={date} />
      </div>

      {/* Header bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between bg-white p-3 rounded-4 shadow-sm border mb-4">
        <div>
          <h4 className="fw-bold m-0 text-dark">
            {from} → {to}
          </h4>
          <div className="small text-muted">
            Date: <strong>{new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong> | Showing {filteredSchedules.length} available buses
          </div>
        </div>

        {/* SORTING SELECT */}
        <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
          <ArrowUpDown size={18} className="text-primary" />
          <span className="small fw-semibold text-muted">Sort By:</span>
          <select
            className="form-select form-select-sm border-2 rounded-pill px-3"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="departure">Departure Time</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Passenger Rating</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {/* FILTERS SIDEBAR */}
        <div className="col-lg-3">
          <div className="card card-custom border-0 p-3 sticky-top" style={{ top: '90px' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <h6 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
                <SlidersHorizontal size={18} className="text-primary" /> Filters
              </h6>
              <button
                className="btn btn-link btn-sm text-decoration-none p-0 text-primary"
                onClick={() => {
                  setSelectedType('ALL');
                  setSelectedOperator('ALL');
                  setMaxPrice(2000);
                  setSortBy('departure');
                }}
              >
                Reset All
              </button>
            </div>

            {/* Bus Category */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">BUS TYPE</label>
              <div className="d-grid gap-2">
                {['ALL', 'AC', 'Non-AC', 'Sleeper', 'Seater', 'Volvo'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`btn btn-sm text-start rounded-pill px-3 ${
                      selectedType === type ? 'btn-primary fw-bold' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type === 'ALL' ? 'All Bus Types' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-muted m-0">MAX PRICE</label>
                <span className="fw-bold text-primary">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="200"
                max="2500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              />
            </div>

            {/* Bus Operators */}
            {operators.length > 0 && (
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">OPERATOR</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                >
                  <option value="ALL">All Operators</option>
                  {operators.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS LIST */}
        <div className="col-lg-9">
          {loading ? (
            <Loading message="Searching available buses..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchResults} />
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center bg-white p-5 rounded-4 border shadow-sm">
              <Bus size={48} className="text-muted mb-3" />
              <h4 className="fw-bold text-dark">No Buses Found</h4>
              <p className="text-muted max-w-md mx-auto">
                No matching buses found for route <strong>{from} → {to}</strong> on {date}. Try changing travel date or clearing filters.
              </p>
              <button
                className="btn btn-primary rounded-pill px-4"
                onClick={() => {
                  setSelectedType('ALL');
                  setSelectedOperator('ALL');
                  setMaxPrice(2500);
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredSchedules.map((schedule) => (
              <BusCard key={schedule.schedule_id} schedule={schedule} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
