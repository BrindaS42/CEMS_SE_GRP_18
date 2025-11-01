import axios from "axios";

const PYTHON_API = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

export const pythonClient = axios.create({
  baseURL: PYTHON_API,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
