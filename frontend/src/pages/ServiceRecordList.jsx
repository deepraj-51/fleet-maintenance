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

  function handleTextChange(value) {
    setText(value);
    setPage(0);
  }

  function handleStatusChange(value) {
    setStatus(value);
    setPage(0);
  }

  const inputClass =
    'block w-full min-h-10 rounded border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-focus';

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold text-ink">Service records</h1>

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mb-6 flex flex-wrap items-end gap-4 rounded border border-border bg-surface p-4"
      >
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <label htmlFor="record-search" className="text-xs font-semibold text-ink">
            Search description
          </label>
          <input
            id="record-search"
            type="search"
            placeholder="e.g. brake pads"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex min-w-[180px] flex-col gap-1.5">
          <label htmlFor="record-status" className="text-xs font-semibold text-ink">
            Status
          </label>
          <select
            id="record-status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={inputClass}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </form>

      {error && (
        <p role="alert" className="mb-4 rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading service records…</p>
      ) : data.content.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-surface p-12 text-center text-muted">
          <p>No service records match these filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-border bg-surface">
            <table className="w-full min-w-[640px] border-collapse">
              <caption className="sr-only">Service records</caption>
              <thead>
                <tr className="bg-bg">
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Vehicle</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Description</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Status</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Scheduled</th>
                  <th scope="col" className="border-b border-border p-3"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((r) => (
                  <tr key={r.id} className="hover:bg-bg">
                    <td className="border-b border-border p-3 text-sm">#{r.vehicleId}</td>
                    <td className="border-b border-border p-3 text-sm">{r.description}</td>
                    <td className="border-b border-border p-3"><StatusBadge status={r.status} /></td>
                    <td className="border-b border-border p-3 text-sm">{r.scheduledDate || '—'}</td>
                    <td className="border-b border-border p-3">
                      <Link
                        to={`/service-records/${r.id}`}
                        className="inline-block min-h-8 rounded border border-action px-3 py-1 text-xs font-medium text-action hover:bg-bg"
                      >
                        View<span className="sr-only"> record for {r.description}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav aria-label="Service records pages" className="mt-4 flex items-center gap-4 text-xs text-muted">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="min-h-8 rounded border border-action px-3 py-1 font-medium text-action hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span aria-live="polite">
              Page {page + 1} of {Math.max(data.totalPages, 1)} ({data.totalElements} total)
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={page >= data.totalPages - 1}
              className="min-h-8 rounded border border-action px-3 py-1 font-medium text-action hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </>
      )}
    </div>
  );
}