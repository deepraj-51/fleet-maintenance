// src/pages/BulkUpload.jsx
import { useState } from 'react';
import * as csvApi from '../api/csv';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Choose a CSV file first.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const result = await csvApi.bulkUpdateOdometer(file);
      setReport(result);
    } catch {
      setError('Upload failed. Check the file format and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">Bulk odometer upload</h1>
      <p className="mb-5 max-w-prose text-sm text-muted">
        Upload a CSV with two columns: <code>registrationNumber</code> and <code>odometer</code>.
        Each row is processed independently — one bad row won't block the rest.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="csv-file" className="text-xs font-semibold">CSV file</label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover disabled:opacity-60"
        >
          {submitting ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-4 rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">{error}</p>
      )}

      {report && (
        <section aria-labelledby="report-heading">
          <h2 id="report-heading" className="mb-3 text-base font-semibold">
            Upload report: {report.successCount} of {report.totalRows} succeeded
          </h2>

          <div className="overflow-x-auto rounded border border-border bg-surface">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Row</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Registration</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Result</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Message</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td className="border-b border-border p-3">{row.rowNumber}</td>
                    <td className="border-b border-border p-3">{row.registrationNumber}</td>
                    <td className="border-b border-border p-3">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${row.success ? 'bg-complete-bg text-complete' : 'bg-due-bg text-due'}`}>
                        {row.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="border-b border-border p-3 text-xs">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}