import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { User, Phone, Mail, Lock, Save, ShieldCheck, Ticket, CheckCircle, IndianRupee } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editable Profile Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/profile');
        if (res.success) {
          setProfileData(res.user);
          setStats(res.stats);
          setName(res.user.name);
          setPhone(res.user.phone);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMsg('');
    try {
      await updateProfile(name, phone);
      setUpdateMsg('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    setPwMsg('');
    setPwError('');
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        setPwMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return <Loading message="Fetching user profile & booking stats..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container py-5">
      <h3 className="fw-bold text-dark mb-4">Account Profile</h3>

      {/* STATS CARDS */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-primary text-white">
              <div className="small opacity-75">Total Bookings</div>
              <div className="fs-2 fw-bold">{stats.total_bookings}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-success text-white">
              <div className="small opacity-75">Active Trips</div>
              <div className="fs-2 fw-bold">{stats.active_bookings}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-info text-white">
              <div className="small opacity-75">Completed</div>
              <div className="fs-2 fw-bold">{stats.completed_bookings}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-dark text-white">
              <div className="small opacity-75">Total Spent</div>
              <div className="fs-2 fw-bold">₹{stats.total_spent}</div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* EDIT PROFILE */}
        <div className="col-md-6">
          <div className="card card-custom border-0 p-4">
            <h5 className="fw-bold text-dark mb-3">Personal Details</h5>

            {updateMsg && <div className="alert alert-success p-2 small">{updateMsg}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email Address (Read-only)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Mail size={18} /></span>
                  <input type="email" className="form-control bg-light" value={profileData?.email || ''} readOnly />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><User size={18} /></span>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Phone size={18} /></span>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={updating}>
                <Save size={16} className="me-2" /> Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="col-md-6">
          <div className="card card-custom border-0 p-4">
            <h5 className="fw-bold text-dark mb-3">Security & Password</h5>

            {pwMsg && <div className="alert alert-success p-2 small">{pwMsg}</div>}
            {pwError && <div className="alert alert-danger p-2 small">{pwError}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Current Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Lock size={18} /></span>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">New Password (Min 6 chars)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Lock size={18} /></span>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-outline-dark rounded-pill px-4 fw-bold" disabled={changingPw}>
                <ShieldCheck size={16} className="me-2" /> Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
