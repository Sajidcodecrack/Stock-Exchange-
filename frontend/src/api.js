import axios from "axios";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// READ
export async function getTradeCodes() {
  const { data } = await api.get("/api/trade-codes");
  return data; // string[]
}
export async function getTrades(params = {}) {
  const { data } = await api.get("/api/trades", { params });
  return data; // { total, items: Trade[] }
}

// CREATE
export async function createTrade(row) {
  const { data } = await api.post("/api/trades", row);
  return data; // Trade
}

// UPDATE
export async function patchTrade(id, patch) {
  const { data } = await api.patch(`/api/trades/${id}`, patch);
  return data; // Trade
}

// DELETE
export async function deleteTrade(id) {
  await api.delete(`/api/trades/${id}`);
}
