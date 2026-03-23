// Utility for debugging localStorage values

export const getLocalStorageData = () => {
  return {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || '{}')
  };
};

export const clearLocalStorageData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setLocalStorageData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};