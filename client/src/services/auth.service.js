import { api } from "./api";

export async function loginRequest(data) {
  const response = await api.post(
    "/login",
    data,
    { headers: { Authorization: "" } }
  );
  return response.data;
}

export async function registerRequest(data) {
  const response = await api.post(
    "/cadastro",
    data,
    { headers: { Authorization: "" } }
  );
  return response.data;
}
