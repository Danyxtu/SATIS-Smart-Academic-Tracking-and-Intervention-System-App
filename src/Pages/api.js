import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE = "http://localhost:8000"; // replace

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export async function setAuthToken(token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  await SecureStore.setItemAsync("userToken", token);
}

export async function loadAuthToken() {
  const token = await SecureStore.getItemAsync("userToken");
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return token;
}

export default api;
