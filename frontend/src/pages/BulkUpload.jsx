import { useState, useRef } from 'react';
import * as csvApi from '../api/csv';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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
      <h1 className="mb-2 text-xl font-semibold text-ink">Bulk odometer upload</h1>
      <p className="mb-6 max-w-prose text-sm text-muted">
        Upload a CSV with two columns: <code className="rounded bg-bg px-1 py-0.5">registrationNumber</code> and{' '}
        <code className="rounded bg-bg px-1 py-0.5">odometer</code>. Each row is processed independently — one bad
        row won't block the rest.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap items-end gap-4 rounded border border-border bg-surface p-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="csv-file" className="text-xs font-semibold text-ink">
            CSV file
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-10 rounded border border-action px-4 py-2 text-sm font-medium text-action hover:bg-bg"
            >
              Choose file
            </button>
            <span className="text-sm text-muted">
              {file ? file.name : 'No file selected'}
            </span>
            <input
              id="csv-file"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="sr-only"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="min-h-10 rounded bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover disabled:opacity-60"
        >
          {submitting ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-4 rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">
          {error}
        </p>
      )}

      {report && (
        <section aria-labelledby="report-heading">
          <h2 id="report-heading" className="mb-3 text-base font-semibold text-ink">
            Upload report: {report.successCount} of {report.totalRows} succeeded
          </h2>

          <div className="overflow-x-auto rounded border border-border bg-surface">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr className="bg-bg">
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Row</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Registration</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Result</th>
                  <th scope="col" className="border-b border-border p-3 text-left text-xs font-semibold text-muted">Message</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-bg">
                    <td className="border-b border-border p-3 text-sm">{row.rowNumber}</td>
                    <td className="border-b border-border p-3 text-sm">{row.registrationNumber}</td>
                    <td className="border-b border-border p-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          row.success ? 'bg-complete-bg text-complete' : 'bg-due-bg text-due'
                        }`}
                      >
                        {row.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="border-b border-border p-3 text-xs text-muted">{row.message}</td>
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