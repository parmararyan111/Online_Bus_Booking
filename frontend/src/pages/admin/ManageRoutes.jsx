import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

const CITIES = [
  'Ahmedabad', 'Mumbai', 'Pune', 'Surat', 'Vadodara',
  'Rajkot', 'Delhi', 'Jaipur', 'Udaipur', 'Bangalore'
];

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    source: 'Ahmedabad',
    destination: 'Mumbai',
    distance_km: 530
  });

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/routes');
      if (res.success) {
        setRoutes(res.routes);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({ source: 'Ahmedabad', destination: 'Mumbai', distance_km: 530 });
    setShowModal(true);
  };

  const handleOpenEdit = (r) => {
    setEditId(r.id);
    setFormData({ source: r.source, destination: r.destination, distance_km: r.distance_km });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.source.toLowerCase() === formData.destination.toLowerCase()) {
      alert('Source and destination cannot be identical.');
      return;
    }

    try {
      if (editId) {
        await api.put(`/routes/${editId}`, formData);
        alert('Route updated successfully!');
      } else {
        await api.post('/routes', formData);
        alert('Route added successfully!');
      }
      setShowModal(false);
      fetchRoutes();
    } catch (err) {
      alert(err.message || 'Failed to save route.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await api.delete(`/routes/${id}`);
      fetchRoutes();
    } catch (err) {
      alert(err.message || 'Failed to delete route.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <MapPin className="text-primary" /> Manage Travel Routes
          </h3>
          <p className="text-muted small m-0">Define source, destination, and distance in kilometers</p>
        </div>

        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleOpenAdd}>
          <Plus size={18} className="me-1" /> Add New Route
        </button>
      </div>

      {loading ? (
        <Loading message="Loading travel routes..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchRoutes} />
      ) : (
        <div className="card card-custom border-0 p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Route ID</th>
                  <th>Source City</th>
                  <th>Destination City</th>
                  <th>Distance (KM)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td className="fw-bold text-primary">{r.source}</td>
                    <td className="fw-bold text-danger">{r.destination}</td>
                    <td className="fw-bold">{r.distance_km} km</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2 rounded-circle" onClick={() => handleOpenEdit(r)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(r.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Route' : 'Add New Route'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Source City *</label>
                    <select
                      className="form-select"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    >
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Destination City *</label>
                    <select
                      className="form-select"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    >
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Distance in KM *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="10"
                      value={formData.distance_km}
                      onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill fw-bold">Save Route</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoutes;
