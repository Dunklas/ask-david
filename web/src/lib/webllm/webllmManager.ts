import type { InitProgressReport, MLCEngine } from "@mlc-ai/web-llm";
import { defaultWebLLMModel, type WebLLMState } from "./types";

const initializationTimeoutMs = 30_000;
let lastProgressReport: InitProgressReport | undefined;

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

const formatProgressSummary = (report: InitProgressReport) => {
  return ` Last progress: ${Math.round(report.progress * 100)}% (${report.text}).`;
};

const getTimeoutMessage = () => {
  return `Local AI initialization timed out after ${initializationTimeoutMs / 1000} seconds.`;
};

const createLogger = () => {
  const startedAt = performance.now();

  return (message: string, details?: unknown) => {
    const elapsedMs = Math.round(performance.now() - startedAt);

    if (details === undefined) {
      console.info(`[webllm +${elapsedMs}ms] ${message}`);
      return;
    }

    console.info(`[webllm +${elapsedMs}ms] ${message}`, details);
  };
};

const getAdapterDetails = async () => {
  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw new Error("No WebGPU adapter was available.");
  }

  const adapterInfo = adapter.info;

  return {
    adapter,
    adapterLabel:
      adapterInfo.description || adapterInfo.vendor || "Unknown WebGPU adapter",
  };
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  return await Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(getTimeoutMessage()));
      }, timeoutMs);
    }),
  ]);
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
    console.info("[webllm] Reusing in-flight initialization");
    return initializationPromise;
  }

  const log = createLogger();
  lastProgressReport = undefined;
  log("Initialization requested", { modelId: defaultWebLLMModel });

  if (!("gpu" in navigator)) {
    log("WebGPU unavailable in this browser");
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
      log("Requesting WebGPU adapter");
      const { adapterLabel } = await getAdapterDetails();
      log("Adapter ready", { adapterLabel });

      log("Importing @mlc-ai/web-llm");
      const { MLCEngine } = await import("@mlc-ai/web-llm");
      log("Imported @mlc-ai/web-llm");

      log("Constructing MLCEngine");
      const engine = new MLCEngine({
        initProgressCallback: (report) => {
          lastProgressReport = report;
          log("Init progress", {
            progress: report.progress,
            percent: `${Math.round(report.progress * 100)}%`,
            text: report.text,
            timeElapsed: report.timeElapsed,
          });

          emit({
            state: "loading",
            progress: report.progress,
            message: formatProgressMessage(report),
            modelId: defaultWebLLMModel,
            engine: null,
          });
        },
      });
      log("Constructed MLCEngine");

      log("Starting engine.reload()", { modelId: defaultWebLLMModel });
      await withTimeout(engine.reload(defaultWebLLMModel), initializationTimeoutMs);
      log("engine.reload() resolved", { modelId: defaultWebLLMModel });

      emit({
        state: "success",
        progress: 1,
        message: `Local AI is ready on ${adapterLabel}`,
        modelId: defaultWebLLMModel,
        engine,
      });
    } catch (error) {
      const latestProgressReport = lastProgressReport;
      const progressSummary = latestProgressReport
        ? formatProgressSummary(latestProgressReport)
        : "";
      const errorMessage = `${getErrorMessage(error)}${progressSummary}`;

      log("Initialization failed", {
        error,
        lastProgressReport: latestProgressReport,
      });

      emit({
        state: "error",
        message: errorMessage,
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
