import type { InitProgressReport, MLCEngine } from "@mlc-ai/web-llm";
import { defaultWebLLMModel, type WebLLMState } from "./types";

const initialState: WebLLMState = {
  state: "inactive",
  message: "Local AI is offline",
  modelId: defaultWebLLMModel,
  engine: null,
};

let currentState: WebLLMState = initialState;
let initializationPromise: Promise<void> | undefined;
const listeners = new Set<(state: WebLLMState) => void>();

const emit = (state: WebLLMState) => {
  currentState = state;
  listeners.forEach((listener) => {
    listener(currentState);
  });
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to initialize local AI";
};

const formatProgressMessage = (report: InitProgressReport) => {
  return report.text || "Loading local AI model";
};

export const getWebLLMState = () => {
  return currentState;
};

export const subscribeToWebLLM = (listener: (state: WebLLMState) => void) => {
  listeners.add(listener);
  listener(currentState);

  return () => {
    listeners.delete(listener);
  };
};

export const initializeWebLLM = () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  if (!("gpu" in navigator)) {
    emit({
      state: "error",
      message: "WebGPU is not available in this browser.",
      modelId: defaultWebLLMModel,
      engine: null,
    });

    initializationPromise = Promise.resolve();
    return initializationPromise;
  }

  emit({
    state: "loading",
    progress: 0,
    message: "Preparing local AI",
    modelId: defaultWebLLMModel,
    engine: null,
  });

  initializationPromise = (async () => {
    try {
      const { MLCEngine } = await import("@mlc-ai/web-llm");

      const engine = new MLCEngine({
        initProgressCallback: (report) => {
          emit({
            state: "loading",
            progress: report.progress,
            message: formatProgressMessage(report),
            modelId: defaultWebLLMModel,
            engine: null,
          });
        },
      });

      await engine.reload(defaultWebLLMModel);

      emit({
        state: "success",
        progress: 1,
        message: "Local AI is ready",
        modelId: defaultWebLLMModel,
        engine,
      });
    } catch (error) {
      emit({
        state: "error",
        message: getErrorMessage(error),
        modelId: defaultWebLLMModel,
        engine: null,
      });
    } finally {
      initializationPromise = undefined;
    }
  })();

  return initializationPromise;
};

export const getWebLLMEngine = (): MLCEngine | null => {
  return currentState.engine;
};
