import axiosClient from './axiosClient';

export function login(email, password) {
  return axiosClient.post('/auth/login', { email, password }).then((res) => res.data);
}

export function register(email, password, fullName, role) {
  return axiosClient
    .post('/auth/register', { email, password, fullName, role })
    .then((res) => res.data);
}
