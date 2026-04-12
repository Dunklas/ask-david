import { useEffect, useState, type ReactNode } from "react";
import { WebLLMContext } from "./context";
import {
  getWebLLMState,
  initializeWebLLM,
  subscribeToWebLLM,
} from "./webllmManager";
import type { WebLLMContextValue, WebLLMState } from "./types";

type WebLLMProviderProps = {
  children: ReactNode;
};

export const WebLLMProvider = ({ children }: WebLLMProviderProps) => {
  const [state, setState] = useState<WebLLMState>(() => getWebLLMState());

  useEffect(() => {
    const unsubscribe = subscribeToWebLLM(setState);

    return unsubscribe;
  }, []);

  const value: WebLLMContextValue = {
    webLLM: state,
    initializeWebLLM,
  };

  return (
    <WebLLMContext.Provider value={value}>{children}</WebLLMContext.Provider>
  );
};
