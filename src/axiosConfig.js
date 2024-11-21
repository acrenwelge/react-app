import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: 1000, // Optional: Set a timeout for requests
  headers: { 'Content-Type': 'application/json' } // Optional: Set default headers
});

export default axiosInstance;