// src/pages/ServiceRecordDetail.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import * as recordsApi from '../api/ServiceRecords';
import * as usersApi from '../api/users';
import StatusBadge from '../components/StatusBadge';

const NEXT_STATUS = { DUE: 'BOOKED', BOOKED: 'IN_SERVICE', IN_SERVICE: 'COMPLETED' };
const NEXT_LABEL = { BOOKED: 'Mark as booked', IN_SERVICE: 'Mark as in service', COMPLETED: 'Mark as completed' };

export default function ServiceRecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === 'FLEET_MANAGER';

  const [record, setRecord] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [scheduledDate, setScheduledDate] = useState('');
  const [completedOdometer, setCompletedOdometer] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [recordData, timelineData, techData] = await Promise.all([
        recordsApi.getServiceRecord(id),
        recordsApi.getTimeline(id),
        usersApi.listTechnicians(),
      ]);
      setRecord(recordData);
      setTimeline(timelineData);
      setTechnicians(techData);
    } catch {
      setError('Could not load this service record.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleTransition() {
    if (!record) return;
    const targetStatus = NEXT_STATUS[record.status];
    if (!targetStatus) return;

    setActionError('');
    if (targetStatus === 'BOOKED' && !scheduledDate) {
      setActionError('Choose a scheduled date to book this service.');
      return;
    }
    if (targetStatus === 'COMPLETED' && !completedOdometer) {
      setActionError('Enter the odometer reading to complete this service.');
      return;
    }

    setSubmitting(true);
    try {
      await recordsApi.transitionServiceRecord(
        id, targetStatus,
        targetStatus === 'BOOKED' ? scheduledDate : undefined,
        targetStatus === 'COMPLETED' ? Number(completedOdometer) : undefined
      );
      setStatusMessage(`Status updated to ${targetStatus.replace('_', ' ').toLowerCase()}.`);
      loadAll();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not update status. It may already have changed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssign() {
    if (!selectedTechnician) {
      setActionError('Choose a technician to assign.');
      return;
    }
    setActionError('');
    setSubmitting(true);
    try {
      await recordsApi.assignTechnician(id, Number(selectedTechnician));
      setStatusMessage('Technician assigned.');
      setSelectedTechnician('');
      loadAll();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not assign technician.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnassign(technicianId) {
    setActionError('');
    setSubmitting(true);
    try {
      await recordsApi.unassignTechnician(id, technicianId);
      setStatusMessage('Technician unassigned.');
      loadAll();
    } catch {
      setActionError('Could not unassign technician.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading service record…</p>;
  if (error) return <p role="alert" className="rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">{error}</p>;
  if (!record) return null;

  const nextStatus = NEXT_STATUS[record.status];
  const inputClass = 'min-h-10 rounded border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-focus';

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 min-h-8 rounded border border-action px-3 py-1 text-xs font-medium text-action hover:bg-bg"
      >
        ← Back to service records
      </button>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{record.description}</h1>
          <p className="text-xs text-muted">Vehicle #{record.vehicleId}</p>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <p className="sr-only" role="status" aria-live="polite">{statusMessage}</p>

      {actionError && (
        <p role="alert" className="mb-4 rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">{actionError}</p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section aria-labelledby="lifecycle-heading" className="rounded border border-border bg-surface p-5">
          <h2 id="lifecycle-heading" className="mb-3 text-base font-semibold">Lifecycle</h2>

          {nextStatus ? (
            <>
              {nextStatus === 'BOOKED' && (
                <div className="mb-4 flex flex-col gap-1">
                  <label htmlFor="scheduledDate" className="text-xs font-semibold">Scheduled date</label>
                  <input id="scheduledDate" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className={inputClass} />
                </div>
              )}
              {nextStatus === 'COMPLETED' && (
                <div className="mb-4 flex flex-col gap-1">
                  <label htmlFor="completedOdometer" className="text-xs font-semibold">Odometer at completion (km)</label>
                  <input id="completedOdometer" type="number" min="0" value={completedOdometer} onChange={(e) => setCompletedOdometer(e.target.value)} className={inputClass} />
                </div>
              )}
              <button
                type="button"
                onClick={handleTransition}
                disabled={submitting}
                className="rounded bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover disabled:opacity-60"
              >
                {NEXT_LABEL[nextStatus]}
              </button>
            </>
          ) : (
            <p className="text-xs text-muted">This service record is complete.</p>
          )}
        </section>

        {isManager && (
          <section aria-labelledby="assignment-heading" className="rounded border border-border bg-surface p-5">
            <h2 id="assignment-heading" className="mb-3 text-base font-semibold">Assigned technicians</h2>

            {record.assignedTechnicians?.length > 0 ? (
              <ul className="mb-4 flex flex-col gap-2">
                {record.assignedTechnicians.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded bg-bg px-3 py-2">
                    {t.fullName}
                    <button
                      type="button"
                      onClick={() => handleUnassign(t.id)}
                      disabled={submitting}
                      className="min-h-8 rounded border border-action px-3 py-1 text-xs font-medium text-action hover:bg-surface"
                    >
                      Remove<span className="sr-only"> {t.fullName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-xs text-muted">No technicians assigned yet.</p>
            )}

            <div className="mb-4 flex flex-col gap-1">
              <label htmlFor="assign-technician" className="text-xs font-semibold">Assign a technician</label>
              <select id="assign-technician" value={selectedTechnician} onChange={(e) => setSelectedTechnician(e.target.value)} className={inputClass}>
                <option value="">Choose technician…</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAssign}
              disabled={submitting}
              className="rounded border border-action px-4 py-2 text-sm font-medium text-action hover:bg-bg disabled:opacity-60"
            >
              Assign
            </button>
          </section>
        )}

        <section aria-labelledby="timeline-heading" className="rounded border border-border bg-surface p-5 md:col-span-2">
          <h2 id="timeline-heading" className="mb-3 text-base font-semibold">Activity timeline</h2>
          {timeline.length === 0 ? (
            <p className="text-xs text-muted">No activity yet.</p>
          ) : (
            <ol className="border-l-2 border-border">
              {timeline.map((event) => (
                <li key={event.id} className="relative pb-4 pl-4">
                  <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-action" aria-hidden="true" />
                  <p className="font-medium">{describeEvent(event)}</p>
                  <p className="text-xs text-muted">
                    {event.performedByName} · {new Date(event.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function describeEvent(event) {
  switch (event.eventType) {
    case 'CREATED': return 'Service record created';
    case 'STATUS_CHANGE': return `Status changed from ${event.oldValue} to ${event.newValue}`;
    case 'ASSIGNED': return `${event.newValue} assigned`;
    case 'UNASSIGNED': return `${event.oldValue} unassigned`;
    case 'NOTE': return event.note || 'Note added';
    default: return event.eventType;
  }
}