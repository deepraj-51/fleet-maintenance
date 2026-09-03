import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';
import * as vehiclesApi from '../api/vehicles';
import Modal from '../components/Modal';
import VehicleForm from '../components/VehicleForm';

export default function VehicleList() {
  const { user } = useAuth();
  const isManager = user?.role === 'FLEET_MANAGER';

  const [view, setView] = useState('active');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data =
        view === 'active'
          ? await vehiclesApi.listActiveVehicles()
          : await vehiclesApi.listArchivedVehicles();
      setVehicles(data);
    } catch {
      setError('Could not load vehicles. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  async function handleCreate(payload) {
    await vehiclesApi.createVehicle(payload);
    setModalMode(null);
    setStatusMessage(`${payload.registrationNumber} added.`);
    loadVehicles();
  }

  async function handleEdit(id, payload) {
    await vehiclesApi.updateVehicle(id, payload);
    setModalMode(null);
    setStatusMessage(`${payload.make} ${payload.model} updated.`);
    loadVehicles();
  }

  async function handleArchive(vehicle) {
    await vehiclesApi.archiveVehicle(vehicle.id);
    setStatusMessage(`${vehicle.registrationNumber} archived.`);
    loadVehicles();
  }

  async function handleRestore(vehicle) {
    await vehiclesApi.restoreVehicle(vehicle.id);
    setStatusMessage(`${vehicle.registrationNumber} restored.`);
    loadVehicles();
  }

  const tabClass = (active) =>
    `min-h-10 border-r border-border px-4 py-2 font-medium last:border-r-0 ${
      active ? 'bg-booked-bg text-action' : 'bg-surface text-muted'
    }`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Vehicles</h1>
        {isManager && (
          <button
            type="button"
            onClick={() => setModalMode('create')}
            className="rounded bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover"
          >
            + Add vehicle
          </button>
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite">{statusMessage}</p>

      <div role="tablist" aria-label="Vehicle list filter" className="mb-4 inline-flex rounded border border-border overflow-hidden">
        <button role="tab" aria-selected={view === 'active'} className={tabClass(view === 'active')} onClick={() => setView('active')}>
          Active
        </button>
        <button role="tab" aria-selected={view === 'archived'} className={tabClass(view === 'archived')} onClick={() => setView('archived')}>
          Archived
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading vehicles…</p>
      ) : vehicles.length === 0 ? (
        <div className="rounded border border-dashed border-border p-12 text-center text-muted">
          <p>
            {view === 'active'
              ? 'No active vehicles yet. Add your first vehicle to start tracking maintenance.'
              : 'No archived vehicles.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-border bg-surface">
          <table className="w-full min-w-[640px] border-collapse">
            <caption className="sr-only">{view === 'active' ? 'Active vehicles' : 'Archived vehicles'}</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Registration</th>
                <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Make / Model</th>
                <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Odometer</th>
                <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Service interval</th>
                {isManager && <th scope="col" className="border-b border-border p-3"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="border-b border-border p-3">
                      <Link to={`/vehicles/${v.id}`} className="text-action underline">
                        {v.registrationNumber}
                      </Link>
                  </td>
                  <td className="border-b border-border p-3">{v.make} {v.model}</td>
                  <td className="border-b border-border p-3">{v.currentOdometer.toLocaleString()} km</td>
                  <td className="border-b border-border p-3">{v.dateIntervalDays} days / {v.mileageInterval.toLocaleString()} km</td>
                  {isManager && (
                    <td className="border-b border-border p-3">
                      <div className="flex flex-wrap gap-2">
                        {view === 'active' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setModalMode({ edit: v })}
                              className="min-h-8 rounded border border-action px-3 py-1 text-xs font-medium text-action hover:bg-bg"
                            >
                              Edit<span className="sr-only"> {v.registrationNumber}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchive(v)}
                              className="min-h-8 rounded border border-action px-3 py-1 text-xs font-medium text-action hover:bg-bg"
                            >
                              Archive<span className="sr-only"> {v.registrationNumber}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestore(v)}
                            className="min-h-8 rounded border border-action px-3 py-1 text-xs font-medium text-action hover:bg-bg"
                          >
                            Restore<span className="sr-only"> {v.registrationNumber}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalMode === 'create' && (
        <Modal title="Add vehicle" onClose={() => setModalMode(null)}>
          <VehicleForm onSubmit={handleCreate} onCancel={() => setModalMode(null)} submitLabel="Add vehicle" />
        </Modal>
      )}

      {modalMode?.edit && (
        <Modal title={`Edit ${modalMode.edit.registrationNumber}`} onClose={() => setModalMode(null)}>
          <VehicleForm
            initial={{
              make: modalMode.edit.make,
              model: modalMode.edit.model,
              currentOdometer: String(modalMode.edit.currentOdometer),
              dateIntervalDays: String(modalMode.edit.dateIntervalDays),
              mileageInterval: String(modalMode.edit.mileageInterval),
            }}
            onSubmit={(payload) => handleEdit(modalMode.edit.id, payload)}
            onCancel={() => setModalMode(null)}
            submitLabel="Save changes"
          />
        </Modal>
      )}
    </div>
  );
}
