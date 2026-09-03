// src/api/vehicles.js
import axiosClient from './axiosClient';

export function listActiveVehicles() {
  return axiosClient.get('/vehicles').then((res) => res.data);
}

export function listArchivedVehicles() {
  return axiosClient.get('/vehicles/archived').then((res) => res.data);
}

export function getVehicle(id) {
  return axiosClient.get(`/vehicles/${id}`).then((res) => res.data);
}

export function createVehicle(payload) {
  return axiosClient.post('/vehicles', payload).then((res) => res.data);
}

export function updateVehicle(id, payload) {
  return axiosClient.put(`/vehicles/${id}`, payload).then((res) => res.data);
}

export function archiveVehicle(id) {
  return axiosClient.post(`/vehicles/${id}/archive`).then((res) => res.data);
}

export function restoreVehicle(id) {
  return axiosClient.post(`/vehicles/${id}/restore`).then((res) => res.data);
}