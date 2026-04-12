import type { MLCEngine } from "@mlc-ai/web-llm";

export const defaultWebLLMModel = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

export type WebLLMState =
  | {
      state: "inactive";
      message: string;
      modelId: string;
      engine: null;
    }
  | {
      state: "loading";
      progress: number;
      message: string;
      modelId: string;
      engine: null;
    }
  | {
      state: "success";
      progress: 1;
      message: string;
      modelId: string;
      engine: MLCEngine;
    }
  | {
      state: "error";
      message: string;
      modelId: string;
      engine: null;
    };

export type WebLLMContextValue = {
  webLLM: WebLLMState;
  initializeWebLLM: () => Promise<void>;
};
