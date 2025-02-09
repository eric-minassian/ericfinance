import { invoke } from "@tauri-apps/api/core";

export async function list_portfolios(): Promise<string[]> {
  return await invoke("list_portfolios");
}
