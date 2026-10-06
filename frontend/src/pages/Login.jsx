import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('user123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 my-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card card-custom p-4 p-md-5 border-0">
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
              <p className="text-muted small">Sign in to manage your bus bookings & tickets</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 p-3 small" role="alert">
                <AlertCircle size={18} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted" /></span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted" /></span>
                  <input
                    type="password"
                    className="form-control bg-light border-start-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4 small">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe" defaultChecked />
                  <label className="form-check-label text-muted" htmlFor="rememberMe">Remember me</label>
                </div>
                <Link to="#" className="text-primary text-decoration-none fw-semibold">Forgot password?</Link>
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
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center small text-muted mt-3">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary fw-bold text-decoration-none">
                Create Account
              </Link>
            </div>

            <hr className="my-4" />
            <div className="bg-light p-3 rounded-3 small text-muted text-center">
              <div><strong>Demo User Login:</strong> user@example.com / user123</div>
              <div className="mt-1"><strong>Demo Admin Login:</strong> <Link to="/admin/login" className="text-danger fw-bold">Click here for Admin Login</Link></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
