import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@busbooking.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.user?.role !== 'ADMIN') {
        setError('Access denied. Provided account does not have administrator privileges.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid administrator login credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 my-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card card-custom p-4 p-md-5 border-0 shadow-lg">
            <div className="text-center mb-4">
              <div className="bg-danger text-white p-3 rounded-circle d-inline-flex mb-3 shadow">
                <ShieldCheck size={36} />
              </div>
              <h3 className="fw-bold text-dark mb-1">Admin Dashboard Portal</h3>
              <p className="text-muted small">Sign in with administrator credentials</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 p-3 small">
                <AlertCircle size={18} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Admin Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Mail size={18} /></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@busbooking.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Master Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Lock size={18} /></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-danger btn-lg w-100 fw-bold rounded-pill shadow d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Enter Admin Panel</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 bg-light rounded-3 text-center small text-muted">
              <div><strong>Default Demo Credentials:</strong></div>
              <div>Email: <code>admin@busbooking.com</code></div>
              <div>Password: <code>admin123</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
