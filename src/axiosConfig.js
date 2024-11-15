import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "http://localhost:3002/", // Load API base URL from environment variable
  timeout: 1000, // Optional: Set a timeout for requests
  headers: { 'Content-Type': 'application/json' } // Optional: Set default headers
});

export default axiosInstance;