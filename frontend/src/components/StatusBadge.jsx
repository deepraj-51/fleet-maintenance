const STATUS_STYLES = {
  DUE: 'bg-due-bg text-due',
  BOOKED: 'bg-booked-bg text-booked',
  IN_SERVICE: 'bg-in-service-bg text-in-service',
  COMPLETED: 'bg-complete-bg text-complete',
};

const STATUS_LABELS = {
  DUE: 'Due',
  BOOKED: 'Booked',
  IN_SERVICE: 'In service',
  COMPLETED: 'Completed',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-border text-muted';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}