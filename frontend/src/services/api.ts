import axios from 'axios';
import { msalInstance, loginRequest } from '../authConfig';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
});

// Add a request interceptor to attach the MSAL access token
api.interceptors.request.use(
  async (config) => {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0]
        });
        
        if (response.idToken) {
          config.headers.Authorization = `Bearer ${response.idToken}`;
        }
      }
    } catch (error) {
      console.error('Failed to acquire token for API request', error);
      // Fallback to loginPopup if silent acquisition fails
      try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          if (response.idToken) {
              config.headers.Authorization = `Bearer ${response.idToken}`;
          }
      } catch (e) {
          console.error('Popup token acquisition failed', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
