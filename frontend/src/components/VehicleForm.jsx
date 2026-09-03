// src/components/VehicleForm.jsx
import { useState } from 'react';

const emptyForm = {
  registrationNumber: '',
  make: '',
  model: '',
  currentOdometer: '',
  dateIntervalDays: '',
  mileageInterval: '',
};

const fieldClass =
  'min-h-10 rounded border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-focus';
const labelClass = 'text-xs font-semibold text-ink';

// Moved OUTSIDE VehicleForm — defining this inside the component body
// recreated it on every render, which made React remount the <input>
// on every keystroke and drop focus. Defined once here, it stays stable.
function Field({ id, label, error, children }) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {error && (
        <span id={`${id}-error`} className="text-xs text-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default function VehicleForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initial);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!isEdit && !form.registrationNumber.trim()) {
      next.registrationNumber = 'Registration number is required.';
    }
    if (!form.make.trim()) next.make = 'Make is required.';
    if (!form.model.trim()) next.model = 'Model is required.';
    if (form.currentOdometer === '' || Number(form.currentOdometer) < 0) {
      next.currentOdometer = 'Enter a valid odometer reading.';
    }
    if (form.dateIntervalDays === '' || Number(form.dateIntervalDays) <= 0) {
      next.dateIntervalDays = 'Enter a service interval in days, greater than 0.';
    }
    if (form.mileageInterval === '' || Number(form.mileageInterval) <= 0) {
      next.mileageInterval = 'Enter a mileage interval greater than 0.';
    }
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        currentOdometer: Number(form.currentOdometer),
        dateIntervalDays: Number(form.dateIntervalDays),
        mileageInterval: Number(form.mileageInterval),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {!isEdit && (
        <Field id="registrationNumber" label="Registration number" error={errors.registrationNumber}>
          <input
            id="registrationNumber"
            required
            className={fieldClass}
            aria-invalid={Boolean(errors.registrationNumber)}
            aria-describedby={errors.registrationNumber ? 'registrationNumber-error' : undefined}
            value={form.registrationNumber}
            onChange={(e) => update('registrationNumber', e.target.value)}
          />
        </Field>
      )}

      <Field id="make" label="Make" error={errors.make}>
        <input
          id="make"
          required
          className={fieldClass}
          aria-invalid={Boolean(errors.make)}
          value={form.make}
          onChange={(e) => update('make', e.target.value)}
        />
      </Field>

      <Field id="model" label="Model" error={errors.model}>
        <input
          id="model"
          required
          className={fieldClass}
          aria-invalid={Boolean(errors.model)}
          value={form.model}
          onChange={(e) => update('model', e.target.value)}
        />
      </Field>

      <Field id="currentOdometer" label="Current odometer (km)" error={errors.currentOdometer}>
        <input
          id="currentOdometer"
          type="number"
          min="0"
          required
          className={fieldClass}
          aria-invalid={Boolean(errors.currentOdometer)}
          value={form.currentOdometer}
          onChange={(e) => update('currentOdometer', e.target.value)}
        />
      </Field>

      <Field id="dateIntervalDays" label="Service interval (days)" error={errors.dateIntervalDays}>
        <input
          id="dateIntervalDays"
          type="number"
          min="1"
          required
          className={fieldClass}
          aria-invalid={Boolean(errors.dateIntervalDays)}
          value={form.dateIntervalDays}
          onChange={(e) => update('dateIntervalDays', e.target.value)}
        />
      </Field>

      <Field id="mileageInterval" label="Service interval (km)" error={errors.mileageInterval}>
        <input
          id="mileageInterval"
          type="number"
          min="1"
          required
          className={fieldClass}
          aria-invalid={Boolean(errors.mileageInterval)}
          value={form.mileageInterval}
          onChange={(e) => update('mileageInterval', e.target.value)}
        />
      </Field>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded border border-action px-4 py-2 text-sm font-medium text-action hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded border border-action bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}