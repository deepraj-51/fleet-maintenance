// src/api/dashboard.js
import axiosClient from './axiosClient';

export function getDashboard() {
  return axiosClient.get('/dashboard').then((res) => res.data);
}