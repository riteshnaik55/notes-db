import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = `${API_BASE.replace(/\/$/, "")}/api/notes`;

const API = axios.create({
  baseURL,
  withCredentials: true,
});

export default API;