import axios from "axios";

/**
 * Central Axios instance pre-configured with the backend base URL.
 * All API calls should use this instance instead of raw axios
 * so that the base URL is managed in one place.
 */
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
