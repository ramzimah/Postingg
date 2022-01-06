import axios from "axios";

const options = {
  baseURL: "http://localhost:8000/api/",
  headers: { "Content-Type": "application/json" },
};

let HttpApi = axios.create(options);

HttpApi.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  config.headers["x-auth-token"] = token;
  return config;
});

export default HttpApi;
