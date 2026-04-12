const LOCAL_AI_MODEL = "SmolLM2-360M-Instruct-q4f16_1-MLC";
const LOCAL_AI_DATA_SIZE_MB = 376;

export const LOCAL_AI_PREPARATION_MESSAGE =
  `I'm doing mental preparation to make decisions. It may take a while, and may consume about ${LOCAL_AI_DATA_SIZE_MB} MB of data.`;

export type LocalAiStatus =
  | "unsupported"
  | "idle"
  | "preparing"
  | "ready"
  | "error";

type LocalAiStatusListener = (status: LocalAiStatus) => void;
type LocalAiDiagnosticsListener = (diagnostics: LocalAiDiagnostics) => void;

export type LocalAiDiagnostics = {
  status: LocalAiStatus;
  model: string;
  message?: string;
  error?: string;
  serviceWorkerReady: boolean;
  serviceWorkerControlled: boolean;
};

export const getLocalAiSupportIssue = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.isSecureContext) {
    return "Local AI needs a secure context (HTTPS or localhost).";
  }

  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return "Local AI needs WebGPU support in this browser/device.";
  }

  if (!("serviceWorker" in navigator)) {
    return "Local AI needs service worker support in this browser.";
  }
};

type InitProgress = {
  progress?: number;
  text?: string;
};

type WebLlmModule = typeof import("@mlc-ai/web-llm");
type Engine = Awaited<ReturnType<WebLlmModule["CreateServiceWorkerMLCEngine"]>>;

const LOCAL_AI_KEEP_ALIVE_MS = 10_000;

let enginePromise: Promise<Engine> | undefined;
let storagePersistencePromise: Promise<void> | undefined;
let localAiStatus: LocalAiStatus = "idle";
let localAiDisabledForSession = false;
const localAiStatusListeners = new Set<LocalAiStatusListener>();
const localAiDiagnosticsListeners = new Set<LocalAiDiagnosticsListener>();
let localAiProgressMessage: string | undefined;
let localAiErrorMessage: string | undefined;
let isServiceWorkerReady = false;
let isServiceWorkerControlled = false;
let serviceWorkerWaitPromise: Promise<void> | undefined;

const buildPrompt = (questionContext: QuestionContext, selectedAnswer: string) => {
  const options = questionContext.options.map((option) => `- ${option}`).join("\n");

  return [
    `Question: ${questionContext.question}`,
    "Possible answers:",
    options,
    `Selected answer: ${selectedAnswer}`,
    `Force mode: ${questionContext.force ? "yes" : "no"}`,
  ].join("\n");
};

const preparePersistentStorage = async () => {
  if (storagePersistencePromise) {
    return storagePersistencePromise;
  }

  storagePersistencePromise = (async () => {
    if (!("storage" in navigator) || !navigator.storage.persist) {
      return;
    }

    await navigator.storage.persist();
  })().catch(() => {
    storagePersistencePromise = undefined;
  });

  return storagePersistencePromise;
};

const setServiceWorkerState = ({
  ready,
  controlled,
}: {
  ready?: boolean;
  controlled?: boolean;
}) => {
  if (ready !== undefined) {
    isServiceWorkerReady = ready;
  }

  if (controlled !== undefined) {
    isServiceWorkerControlled = controlled;
  }

  notifyLocalAiDiagnosticsListeners();
};

const waitForServiceWorkerControl = async (timeoutMs = 5000) => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Local AI needs service worker support in this browser.");
  }

  if (serviceWorkerWaitPromise) {
    return serviceWorkerWaitPromise;
  }

  serviceWorkerWaitPromise = (async () => {
    const registration = await navigator.serviceWorker.ready;
    setServiceWorkerState({ ready: true, controlled: Boolean(navigator.serviceWorker.controller) });

    if (registration.active) {
      setServiceWorkerState({ ready: true });
    }

    if (navigator.serviceWorker.controller) {
      setServiceWorkerState({ controlled: true });
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleControllerChange,
        );
        reject(
          new Error(
            "Service worker is installed but not controlling this page yet. Reload once.",
          ),
        );
      }, timeoutMs);

      const handleControllerChange = () => {
        if (!navigator.serviceWorker.controller) {
          return;
        }

        window.clearTimeout(timeoutId);
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleControllerChange,
        );
        setServiceWorkerState({ controlled: true });
        resolve();
      };

      navigator.serviceWorker.addEventListener(
        "controllerchange",
        handleControllerChange,
      );
    });
  })().catch((error) => {
    serviceWorkerWaitPromise = undefined;
    throw error;
  });

  return serviceWorkerWaitPromise;
};

const waitForServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Local AI needs service worker support in this browser.");
  }

  await waitForServiceWorkerControl();
};

const notifyLocalAiStatusListeners = () => {
  localAiStatusListeners.forEach((listener) => {
    listener(localAiStatus);
  });
};

const getLocalAiDiagnosticsSnapshot = (): LocalAiDiagnostics => {
  const supportIssue = getLocalAiSupportIssue();

  if (supportIssue) {
    return {
      status: "unsupported",
      model: LOCAL_AI_MODEL,
      error: supportIssue,
      serviceWorkerReady: isServiceWorkerReady,
      serviceWorkerControlled: isServiceWorkerControlled,
    };
  }

  if (localAiDisabledForSession) {
    return {
      status: "error",
      model: LOCAL_AI_MODEL,
      message: localAiProgressMessage,
      error: localAiErrorMessage,
      serviceWorkerReady: isServiceWorkerReady,
      serviceWorkerControlled: isServiceWorkerControlled,
    };
  }

  return {
    status: localAiStatus,
    model: LOCAL_AI_MODEL,
    message: localAiProgressMessage,
    error: localAiErrorMessage,
    serviceWorkerReady: isServiceWorkerReady,
    serviceWorkerControlled: isServiceWorkerControlled,
  };
};

const notifyLocalAiDiagnosticsListeners = () => {
  const diagnostics = getLocalAiDiagnosticsSnapshot();

  localAiDiagnosticsListeners.forEach((listener) => {
    listener(diagnostics);
  });
};

const setLocalAiStatus = (status: LocalAiStatus) => {
  localAiStatus = status;
  notifyLocalAiStatusListeners();
  notifyLocalAiDiagnosticsListeners();
};

const setLocalAiProgress = (message?: string) => {
  localAiProgressMessage = message;
  notifyLocalAiDiagnosticsListeners();
};

const setLocalAiError = (message?: string) => {
  localAiErrorMessage = message;
  notifyLocalAiDiagnosticsListeners();
};

const normalizeLocalAiError = (error: unknown) => {
  const message = extractErrorMessage(error);

  if (!message) {
    return new Error("Local AI could not respond.");
  }

  const lowerCaseMessage = message.toLowerCase();

  if (
    lowerCaseMessage.includes("out of memory") ||
    lowerCaseMessage.includes("not enough memory") ||
    lowerCaseMessage.includes("device was lost") ||
    lowerCaseMessage.includes("gpu validation") ||
    lowerCaseMessage.includes("buffer") ||
    lowerCaseMessage.includes("bindingerror")
  ) {
    return new Error(
      "Local AI ran out of GPU memory on this device. Falling back to the regular answer.",
    );
  }

  return new Error(message);
};

const extractErrorMessage = (error: unknown) => {
  if (error instanceof Error || error instanceof DOMException) {
    return error.message;
  }

  if (!error || typeof error !== "object") {
    return typeof error === "string" ? error : String(error ?? "").trim();
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  try {
    const serialized = JSON.stringify(error);

    if (serialized && serialized !== "{}") {
      return serialized;
    }
  } catch {
    // Ignore JSON serialization failures and try string conversion next.
  }

  const stringified = String(error).trim();
  return stringified === "[object Object]" ? undefined : stringified;
};

const disableLocalAiForSession = async () => {
  localAiDisabledForSession = true;
  setLocalAiStatus("error");

  const currentEnginePromise = enginePromise;
  enginePromise = undefined;

  if (!currentEnginePromise) {
    return;
  }

  const engine = await currentEnginePromise.catch(() => undefined);
  await engine?.unload().catch(() => undefined);
};

const getEngine = async (onProgress?: (statusText: string) => void) => {
  if (localAiDisabledForSession) {
    throw new Error("Local AI is disabled for this session.");
  }

  if (!enginePromise) {
    enginePromise = (async () => {
      const { CreateServiceWorkerMLCEngine, prebuiltAppConfig } = await import(
        "@mlc-ai/web-llm"
      );

      await preparePersistentStorage();
      setServiceWorkerState({
        ready: false,
        controlled: Boolean(navigator.serviceWorker?.controller),
      });
      setLocalAiStatus("preparing");
      setLocalAiProgress(LOCAL_AI_PREPARATION_MESSAGE);
      await waitForServiceWorker();

      setLocalAiError(undefined);

      const engine = await CreateServiceWorkerMLCEngine(LOCAL_AI_MODEL, {
        appConfig: {
          ...prebuiltAppConfig,
          useIndexedDBCache: true,
        },
        initProgressCallback: (progress: InitProgress) => {
          if (progress.text) {
            setLocalAiProgress(progress.text);
            onProgress?.(`${LOCAL_AI_PREPARATION_MESSAGE} ${progress.text}`);
            return;
          }

          setLocalAiProgress(LOCAL_AI_PREPARATION_MESSAGE);
          onProgress?.(LOCAL_AI_PREPARATION_MESSAGE);
        },
        logLevel: "ERROR",
      }, undefined, LOCAL_AI_KEEP_ALIVE_MS);

      setLocalAiProgress(undefined);
      setLocalAiStatus("ready");
      return engine;
    })().catch((error) => {
      enginePromise = undefined;

      const normalizedError = normalizeLocalAiError(error);
      console.error("Local AI initialization failed", error);
      setLocalAiError(normalizedError.message);

      void disableLocalAiForSession();
      throw normalizedError;
    });
  }

  onProgress?.(LOCAL_AI_PREPARATION_MESSAGE);

  return enginePromise;
};

const readMessageContent = (content: unknown) => {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .flatMap((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (
          part &&
          typeof part === "object" &&
          "type" in part &&
          "text" in part &&
          part.type === "text" &&
          typeof part.text === "string"
        ) {
          return part.text;
        }

        return [];
      })
      .join(" ")
      .trim();
  }

  return "";
};

export const canUseLocalAi = () =>
  getLocalAiSupportIssue() === undefined &&
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  !localAiDisabledForSession;

export const getLocalAiStatus = () => {
  const supportIssue = getLocalAiSupportIssue();

  if (supportIssue) {
    return "unsupported";
  }

  if (localAiDisabledForSession) {
    return "error";
  }

  return localAiStatus;
};

export const subscribeToLocalAiStatus = (listener: LocalAiStatusListener) => {
  localAiStatusListeners.add(listener);
  listener(getLocalAiStatus());

  return () => {
    localAiStatusListeners.delete(listener);
  };
};

export const getLocalAiDiagnostics = () => getLocalAiDiagnosticsSnapshot();

export const subscribeToLocalAiDiagnostics = (
  listener: LocalAiDiagnosticsListener,
) => {
  localAiDiagnosticsListeners.add(listener);
  listener(getLocalAiDiagnosticsSnapshot());

  return () => {
    localAiDiagnosticsListeners.delete(listener);
  };
};

export const preloadLocalAi = async (
  onProgress?: (statusText: string) => void,
) => {
  const supportIssue = getLocalAiSupportIssue();

  if (supportIssue) {
    setLocalAiError(supportIssue);
    setLocalAiStatus("unsupported");
    setServiceWorkerState({
      ready: false,
      controlled: Boolean(navigator.serviceWorker?.controller),
    });
    throw new Error(supportIssue);
  }

  try {
    await getEngine(onProgress);
  } catch (error) {
    throw normalizeLocalAiError(error);
  }
};

export const generateLocalAiAnswer = async (
  questionContext: QuestionContext,
  selectedAnswer: string,
  onProgress?: (statusText: string) => void,
) => {
  const supportIssue = getLocalAiSupportIssue();

  if (supportIssue) {
    setLocalAiError(supportIssue);
    throw new Error(supportIssue);
  }

  try {
    const engine = await getEngine(onProgress);

    const response = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Write exactly one short, direct sentence in the same language as the user's question. Be terse and decisive. Do not use filler or advisory phrasing such as 'I would', 'I'd', 'I think', 'I recommend', 'you should', or similar openings. Do not explain your reasoning. Do not mention unselected answers. Keep the selected answer unchanged and clearly present in the sentence. If the selected answer is '...', write one short sentence that expresses uncertainty in the same language. Example of bad style: 'I would recommend picking Candlemass as the band to see.' Example of good style: 'Candlemass tonight.'",
        },
        {
          role: "user",
          content: buildPrompt(questionContext, selectedAnswer),
        },
      ],
      max_tokens: 24,
      temperature: 0.25,
    });

    const content = readMessageContent(response.choices[0]?.message.content);

    if (!content) {
      throw new Error("Local AI returned an empty response");
    }

    return content;
  } catch (error) {
    const normalizedError = normalizeLocalAiError(error);

    setLocalAiError(normalizedError.message);
    await disableLocalAiForSession();
    throw normalizedError;
  }
};
