import { api } from "./api";

export async function loginRequest(data) {
  const response = await api.post("/login", data);
  return response.data;
}

export async function registerRequest(data) {
  const response = await api.post("/cadastro", data);
  return response.data;
}
