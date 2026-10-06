import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Bus, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const ManageBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    bus_name: '',
    operator_name: '',
    bus_type: 'Volvo AC',
    total_seats: 30,
    amenities: 'WiFi, Charging Port, Water Bottle',
    status: 'ACTIVE'
  });

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/buses');
      if (res.success) {
        setBuses(res.buses);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch buses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      bus_number: '',
      bus_name: '',
      operator_name: '',
      bus_type: 'Volvo AC',
      total_seats: 30,
      amenities: 'WiFi, Charging Port, Water Bottle',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (bus) => {
    setEditId(bus.id);
    setFormData({
      bus_number: bus.bus_number,
      bus_name: bus.bus_name,
      operator_name: bus.operator_name,
      bus_type: bus.bus_type,
      total_seats: bus.total_seats,
      amenities: bus.amenities || '',
      status: bus.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/buses/${editId}`, formData);
        alert('Bus updated successfully!');
      } else {
        await api.post('/buses', formData);
        alert('Bus added successfully!');
      }
      setShowModal(false);
      fetchBuses();
    } catch (err) {
      alert(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    try {
      await api.delete(`/buses/${id}`);
      fetchBuses();
    } catch (err) {
      alert(err.message || 'Failed to delete bus.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <Bus className="text-primary" /> Manage Buses & Fleet
          </h3>
          <p className="text-muted small m-0">Add, edit, or remove buses from the reservation system</p>
        </div>

        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleOpenAdd}>
          <Plus size={18} className="me-1" /> Add New Bus
        </button>
      </div>

      {loading ? (
        <Loading message="Loading fleet list..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBuses} />
      ) : (
        <div className="card card-custom border-0 p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Bus Number</th>
                  <th>Bus Name</th>
                  <th>Operator</th>
                  <th>Type</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-bold text-primary font-monospace">{b.bus_number}</td>
                    <td className="fw-bold text-dark">{b.bus_name}</td>
                    <td>{b.operator_name}</td>
                    <td><span className="badge bg-light text-dark border">{b.bus_type}</span></td>
                    <td className="fw-bold">{b.total_seats} Seats</td>
                    <td>
                      <span className={`badge ${b.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2 rounded-circle" onClick={() => handleOpenEdit(b)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(b.id)}>
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

      {/* ADD / EDIT BUS MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Bus' : 'Add New Bus'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Bus Registration Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="GJ-01-AB-1234"
                      value={formData.bus_number}
                      onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Bus Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Volvo Multi-Axle Express"
                      value={formData.bus_name}
                      onChange={(e) => setFormData({ ...formData, bus_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Operator Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="GSRTC Travels"
                      value={formData.operator_name}
                      onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Bus Type *</label>
                      <select
                        className="form-select"
                        value={formData.bus_type}
                        onChange={(e) => setFormData({ ...formData, bus_type: e.target.value })}
                      >
                        <option value="AC Seater">AC Seater</option>
                        <option value="Non-AC Seater">Non-AC Seater</option>
                        <option value="AC Sleeper">AC Sleeper</option>
                        <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                        <option value="Volvo AC">Volvo AC</option>
                        <option value="Volvo Sleeper">Volvo Sleeper</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Total Capacity Seats *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="10"
                        max="60"
                        value={formData.total_seats}
                        onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Amenities</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="WiFi, Charging Port, Water Bottle"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill fw-bold">
                    Save Bus
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBuses;
