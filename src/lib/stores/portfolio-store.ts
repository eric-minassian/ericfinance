import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

interface PortfolioState {
  portfolios: string[];
  selectedPortfolio: string | null;
  setPortfolios: (portfolios: string[]) => void;
  setSelectedPortfolio: (portfolio: string | null) => void;
  fetchPortfolios: () => Promise<void>;
  createPortfolio: (name: string, password: string) => Promise<void>;
  selectPortfolio: (name: string, password: string) => Promise<void>;
  deletePortfolio: (name: string) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  selectedPortfolio: null,
  setPortfolios: (portfolios) => set({ portfolios }),
  setSelectedPortfolio: (portfolio) => set({ selectedPortfolio: portfolio }),
  fetchPortfolios: async () => {
    try {
      const portfolios = await invoke<string[]>("list_portfolios");
      set({ portfolios });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  createPortfolio: async (name, password) => {
    try {
      await invoke("create_portfolio", { name, password });
      const portfolios = await invoke<string[]>("list_portfolios");
      set({ portfolios, selectedPortfolio: name });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  selectPortfolio: async (name, password) => {
    try {
      await invoke("select_portfolio", { name, password });
      set({ selectedPortfolio: name });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  deletePortfolio: async (name) => {
    try {
      await invoke("delete_portfolio", { name });
      set((state) => ({
        portfolios: state.portfolios.filter((p) => p !== name),
        selectedPortfolio:
          state.selectedPortfolio === name ? null : state.selectedPortfolio,
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
}));
