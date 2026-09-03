import axiosClient from './axiosClient';

export function listTechnicians() {
  return axiosClient.get('/users/technicians').then((res) => res.data);
}