import { createContext } from "react";
import type { WebLLMState } from "./types";

export const WebLLMContext = createContext<WebLLMState | undefined>(undefined);
