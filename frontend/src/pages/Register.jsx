import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, Lock, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 my-3">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card card-custom p-4 p-md-5 border-0">
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark mb-1">Create Passenger Account</h3>
              <p className="text-muted small">Join BusGo to book tickets, save routes and manage refunds</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 p-3 small" role="alert">
                <AlertCircle size={18} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Full Name *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><User size={18} className="text-muted" /></span>
                  <input
                    type="text"
                    name="name"
                    className="form-control bg-light border-start-0"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email Address *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted" /></span>
                  <input
                    type="email"
                    name="email"
                    className="form-control bg-light border-start-0"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Phone Number *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><Phone size={18} className="text-muted" /></span>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control bg-light border-start-0"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Password *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted" /></span>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-light border-start-0"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Confirm Password *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted" /></span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control bg-light border-start-0"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center small text-muted mt-3">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-bold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
