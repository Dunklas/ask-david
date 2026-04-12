import { createContext } from "react";
import type { WebLLMContextValue } from "./types";

export const WebLLMContext = createContext<WebLLMContextValue | undefined>(
  undefined,
);
