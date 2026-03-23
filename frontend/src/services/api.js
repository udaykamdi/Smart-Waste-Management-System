
import axios from '../config/axios';
import axiosExternal from 'axios';

const API = axios;

// Create axios instance for external SWMS area API
const SWMS_API = axiosExternal.create({
    baseURL: 'https://swms-area-api.onrender.com',
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false
});

// Add response interceptor for better error handling
SWMS_API.interceptors.response.use(
    (response) => {
        console.log('SWMS API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('SWMS API Error:', error.config?.url, error.message);
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - API may be slow to respond');
        }
        return Promise.reject(error);
    }
);

export async function login(email, password) {
  console.log('API login - Attempting login with email:', email);
  const { data } = await API.post('/auth/login', { email, password });
  console.log('API login - Received response:', data);
  if (data.token) {
    // Ensure token doesn't already have Bearer prefix
    const cleanToken = data.token.startsWith('Bearer ') ? data.token.substring(7) : data.token;
    console.log('API login - Setting token in localStorage:', cleanToken);
    localStorage.setItem('token', cleanToken);
    // Store complete user profile in localStorage
    console.log('API login - Setting user in localStorage:', data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  } else {
    console.error('API login - No token in response');
  }
  return data.user;
}

export async function adminLogin(email, password) {
  console.log('API adminLogin - Attempting admin login with email:', email);
  const { data } = await API.post('/auth/admin/login', { email, password });
  console.log('API adminLogin - Received response:', data);
  if (data.token) {
    // Ensure token doesn't already have Bearer prefix
    const cleanToken = data.token.startsWith('Bearer ') ? data.token.substring(7) : data.token;
    console.log('API adminLogin - Setting token in localStorage:', cleanToken);
    localStorage.setItem('token', cleanToken);
    // Store complete user profile in localStorage
    console.log('API adminLogin - Setting user in localStorage:', data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  } else {
    console.error('API adminLogin - No token in response');
  }
  return data.user;
}

export async function register(name, email, password, role = 'user') {
  const { data } = await API.post('/auth/register', { name, email, password, role });
  if (data.token) {
    localStorage.setItem('token', data.token);
    // Store complete user profile in localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data.user;
}

export async function me() {
  const { data } = await API.get('/auth/me');
  return data.user;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// SWMS Area API functions - using real API data with fallback
export async function getAreas() {
  try {
    console.log('Fetching areas from SWMS API...');
    const { data } = await SWMS_API.get('/api/areas');
    console.log('Areas data received from API:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch areas from SWMS API:', error.message);
    
    // Return fallback data when API is not available
    const fallbackData = {
      vadodara_societies_by_area: {
        'Alkapuri': ['Society 1', 'Society 2', 'Society 3'],
        'Manjalpur': ['Society A', 'Society B'],
        'Sayajigunj': ['Residential Complex', 'Apartments'],
        'Wadi': ['Colony 1', 'Colony 2', 'Colony 3', 'Colony 4']
      }
    };
    
    console.log('Using fallback areas data');
    return fallbackData;
  }
}

export async function getAreaByName(areaName) {
  try {
    console.log(`Fetching area data for: ${areaName}`);
    const { data } = await SWMS_API.get(`/api/areas/${areaName}`);
    console.log(`Area data received for ${areaName}:`, data);
    return data;
  } catch (error) {
    console.error(`Failed to fetch area ${areaName}:`, error.message);

    // Return fallback data for specific area
    const fallbackAreaData = {
      area: areaName,
      societies: ['Society A', 'Society B', 'Society C'],
      status: 'Available'
    };

    console.log(`Using fallback data for area: ${areaName}`);
    return fallbackAreaData;
  }
}

export async function getBaseInfo() {
  try {
    console.log('Fetching base info from SWMS API...');
    const { data } = await SWMS_API.get('/');
    console.log('Base info received:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch base info:', error.message);

    // Return fallback base info
    const fallbackInfo = {
      message: 'SWMS Area API Service',
      status: 'Available',
      version: '1.0.0'
    };

    console.log('Using fallback base info');
    return fallbackInfo;
  }
}

// Get users filtered by role and status
export async function getUsersByFilter(role, status) {
  const params = new URLSearchParams();
  if (role) params.append('role', role);
  if (status) params.append('status', status);

  const { data } = await API.get(`/auth/users/filter?${params.toString()}`);
  return data;
}

export async function getMyComplaints() {
  // Use the /my endpoint which uses the authenticated user
  const { data } = await API.get(`/complaints/my`);
  return data;
}

export async function updateComplaintStatus(complaintId, status) {
  const { data } = await API.put(`/complaints/${complaintId}`, { status });
  return data;
}

export async function getPendingComplaints() {
  const { data } = await API.get('/complaints');
  // Filter only pending complaints
  return data.filter(complaint => complaint.status === 'pending');
}

export default API;
