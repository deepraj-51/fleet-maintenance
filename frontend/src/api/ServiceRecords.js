import axiosClient from './axiosClient';

export function searchServiceRecords({ text, status, vehicleId, from, to, page = 0, size = 20 }) {
  const params = { page, size, sort: 'scheduledDate,desc' };
  if (text) params.text = text;
  if (status) params.status = status;
  if (vehicleId) params.vehicleId = vehicleId;
  if (from) params.from = from;
  if (to) params.to = to;
  return axiosClient.get('/service-records', { params }).then((res) => res.data);
}

export function getServiceRecord(id) {
  return axiosClient.get(`/service-records/${id}`).then((res) => res.data);
}

export function transitionServiceRecord(id, targetStatus, scheduledDate, completedOdometer) {
  return axiosClient
    .post(`/service-records/${id}/transition`, { targetStatus, scheduledDate, completedOdometer })
    .then((res) => res.data);
}

export function dismissAlert(id) {
  return axiosClient.post(`/service-records/${id}/dismiss-alert`);
}

export function assignTechnician(recordId, technicianId) {
  return axiosClient.post(`/service-records/${recordId}/assign`, { technicianId });
}

export function unassignTechnician(recordId, technicianId) {
  return axiosClient.post(`/service-records/${recordId}/unassign`, null, {
    params: { technicianId },
  });
}

export function getTimeline(recordId) {
  return axiosClient.get(`/service-records/${recordId}/timeline`).then((res) => res.data);
}