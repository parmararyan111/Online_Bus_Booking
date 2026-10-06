import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';

const ManageSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    bus_id: '',
    route_id: '',
    travel_date: '2026-10-15',
    departure_time: '22:00',
    arrival_time: '06:30',
    price: 899,
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schRes, busRes, rtRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/buses'),
        api.get('/routes')
      ]);

      if (schRes.success) setSchedules(schRes.schedules);
      if (busRes.success) setBuses(busRes.buses);
      if (rtRes.success) setRoutes(rtRes.routes);

      if (busRes.buses.length > 0 && rtRes.routes.length > 0) {
        setFormData((prev) => ({
          ...prev,
          bus_id: busRes.buses[0].id,
          route_id: rtRes.routes[0].id
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch schedule data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      bus_id: buses[0]?.id || '',
      route_id: routes[0]?.id || '',
      travel_date: '2026-10-15',
      departure_time: '22:00',
      arrival_time: '06:30',
      price: 899,
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sch) => {
    setEditId(sch.id);
    const dateFormatted = sch.travel_date ? new Date(sch.travel_date).toISOString().split('T')[0] : '';
    setFormData({
      bus_id: sch.bus_id,
      route_id: sch.route_id,
      travel_date: dateFormatted,
      departure_time: sch.departure_time,
      arrival_time: sch.arrival_time,
      price: sch.price,
      status: sch.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/schedules/${editId}`, formData);
        alert('Schedule updated successfully!');
      } else {
        await api.post('/schedules', formData);
        alert('Schedule added successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save schedule.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete schedule.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <Calendar className="text-primary" /> Manage Bus Schedules
          </h3>
          <p className="text-muted small m-0">Assign buses to routes, travel dates, departure/arrival times, and ticket prices</p>
        </div>

        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleOpenAdd}>
          <Plus size={18} className="me-1" /> Create New Schedule
        </button>
      </div>

      {loading ? (
        <Loading message="Loading bus schedules..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : (
        <div className="card card-custom border-0 p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Schedule ID</th>
                  <th>Bus Name</th>
                  <th>Route</th>
                  <th>Travel Date</th>
                  <th>Timings</th>
                  <th>Fare Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td className="fw-bold text-dark">{s.bus_name} ({s.bus_number})</td>
                    <td className="fw-semibold text-primary">{s.source} → {s.destination}</td>
                    <td>{new Date(s.travel_date).toLocaleDateString()}</td>
                    <td>{s.departure_time} - {s.arrival_time}</td>
                    <td className="fw-bold text-success">₹{s.price}</td>
                    <td>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2 rounded-circle" onClick={() => handleOpenEdit(s)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(s.id)}>
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
                <h5 className="modal-title fw-bold">{editId ? 'Edit Schedule' : 'Create Schedule'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Bus *</label>
                    <select
                      className="form-select"
                      value={formData.bus_id}
                      onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                    >
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>{b.bus_name} ({b.bus_number})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Route *</label>
                    <select
                      className="form-select"
                      value={formData.route_id}
                      onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                    >
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>{r.source} → {r.destination} ({r.distance_km} km)</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Travel Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.travel_date}
                      onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Departure Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.departure_time}
                        onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Arrival Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.arrival_time}
                        onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Seat Fare Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="50"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill fw-bold">Save Schedule</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchedules;
