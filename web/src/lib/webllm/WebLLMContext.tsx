import { useEffect, useState, type ReactNode } from "react";
import { WebLLMContext } from "./context";
import { getWebLLMState, initializeWebLLM, subscribeToWebLLM } from "./webllmManager";
import type { WebLLMState } from "./types";

type WebLLMProviderProps = {
  children: ReactNode;
};

export const WebLLMProvider = ({ children }: WebLLMProviderProps) => {
  const [state, setState] = useState<WebLLMState>(() => getWebLLMState());

  useEffect(() => {
    const unsubscribe = subscribeToWebLLM(setState);

    void initializeWebLLM();

    return unsubscribe;
  }, []);

  return <WebLLMContext.Provider value={state}>{children}</WebLLMContext.Provider>;
};
