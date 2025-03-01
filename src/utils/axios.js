import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
