// src/pages/VehicleDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as vehiclesApi from '../api/vehicles';
import axiosClient from '../api/axiosClient';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    vehiclesApi
      .getVehicle(id)
      .then(setVehicle)
      .catch(() => setError('Could not load this vehicle.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleExport() {
    setExporting(true);
    try {
      // Fetched as a blob via axios (not a plain <a href>) so the JWT
      // Authorization header actually gets attached to the request.
      const response = await axiosClient.get(`/csv/vehicles/${id}/service-history`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `service-history-${id}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Could not export service history.');
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <p>Loading vehicle…</p>;
  if (error) return <p role="alert" className="rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">{error}</p>;
  if (!vehicle) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/vehicles')}
        className="mb-4 min-h-8 rounded border border-action px-3 py-1 text-xs font-medium text-action hover:bg-bg"
      >
        ← Back to vehicles
      </button>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{vehicle.registrationNumber}</h1>
          <p className="text-xs text-muted">{vehicle.make} {vehicle.model}</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover disabled:opacity-60"
        >
          {exporting ? 'Preparing file…' : 'Export service history (CSV)'}
        </button>
      </div>

      <dl className="grid grid-cols-1 gap-4 rounded border border-border bg-surface p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-muted">Current odometer</dt>
          <dd className="mt-1">{vehicle.currentOdometer.toLocaleString()} km</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Service interval</dt>
          <dd className="mt-1">{vehicle.dateIntervalDays} days / {vehicle.mileageInterval.toLocaleString()} km</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Last service date</dt>
          <dd className="mt-1">{vehicle.lastServiceDate || 'Not yet serviced'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Last service odometer</dt>
          <dd className="mt-1">{vehicle.lastServiceOdometer?.toLocaleString() || '—'} km</dd>
        </div>
      </dl>
    </div>
  );
}