import axiosClient from './axiosClient';

export function bulkUpdateOdometer(file) {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient
    .post('/csv/odometer-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}

export function exportServiceHistoryUrl(vehicleId) {
  // used as a plain <a href> download link, not fetched via axios,
  // since the browser needs to handle the file download natively
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  return `${base}/csv/vehicles/${vehicleId}/service-history`;
}