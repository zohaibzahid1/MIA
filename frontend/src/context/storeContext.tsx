"use client";
import React, { createContext, useContext, useMemo, useEffect } from "react";
import { RootStore } from "../stores/rootStore";
import { performTokenValidation } from "../utils/tokenValidation";
import { useRouter } from "next/navigation";

// 1. Create the context with proper typing
const StoreContext = createContext<RootStore | null>(null);

// 2. Create and provide the RootStore via context
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const rootStore = useMemo(() => new RootStore(), []); // singleton per render
  const router = useRouter();
  
  useEffect(() => {
    const handleTokenValidation = async () => {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      
      const result = await performTokenValidation(rootStore, currentPath);
      
      if (result.shouldRedirect && result.redirectPath) {
        router.push(result.redirectPath);
      }
      
      if (result.error) {
        rootStore.authStore.setError(result.error);
      }
    };

    // Perform token validation after stores are initialized
    handleTokenValidation();
  }, [rootStore, router]);
  
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};

// 3. Custom hook to access the store safely
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};