// src/pages/ServiceRecordList.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as recordsApi from '../api/ServiceRecords';
import StatusBadge from '../components/StatusBadge';

const STATUS_OPTIONS = ['DUE', 'BOOKED', 'IN_SERVICE', 'COMPLETED'];
const PAGE_SIZE = 20;

export default function ServiceRecordList() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await recordsApi.searchServiceRecords({
        text: text || undefined,
        status: status || undefined,
        page,
        size: PAGE_SIZE,
      });
      setData(result);
    } catch {
      setError('Could not load service records. Try again.');
    } finally {
      setLoading(false);
    }
  }, [text, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 0 whenever filters change
  function handleTextChange(value) {
    setText(value);
    setPage(0);
  }

  function handleStatusChange(value) {
    setStatus(value);
    setPage(0);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Service records</h1>
      </div>

      <form
        className="filter-bar"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="field filter-field">
          <label htmlFor="record-search">Search description</label>
          <input
            id="record-search"
            type="search"
            placeholder="e.g. brake pads"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>

        <div className="field filter-field">
          <label htmlFor="record-status">Status</label>
          <select
            id="record-status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </form>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading service records…</p>
      ) : data.content.length === 0 ? (
        <div className="empty-state">
          <p>No service records match these filters.</p>
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <caption className="visually-hidden">Service records</caption>
              <thead>
                <tr>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Description</th>
                  <th scope="col">Status</th>
                  <th scope="col">Scheduled</th>
                  <th scope="col"><span className="visually-hidden">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.vehicleId}</td>
                    <td>{r.description}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.scheduledDate || '—'}</td>
                    <td>
                      <Link to={`/service-records/${r.id}`} className="btn-secondary btn btn-sm">
                        View<span className="visually-hidden"> record for {r.description}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="pagination" aria-label="Service records pages">
            <button
              type="button"
              className="btn-secondary btn btn-sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span aria-live="polite">
              Page {page + 1} of {Math.max(data.totalPages, 1)} ({data.totalElements} total)
            </span>
            <button
              type="button"
              className="btn-secondary btn btn-sm"
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={page >= data.totalPages - 1}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </div>
  );
}