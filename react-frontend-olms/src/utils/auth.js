// Authentication utilities
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const getUserRole = () => {
  const userRole = localStorage.getItem('userRole');
  return userRole || 'user';
};

export const setUserRole = (role) => {
  localStorage.setItem('userRole', role);
};

export const removeUserRole = () => {
  localStorage.removeItem('userRole');
};