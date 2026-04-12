import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import AskDavid from "./pages/AskDavid";
import BrainStatusIcon, {
  type BrainStatus,
} from "./components/BrainStatusIcon";
import { Button } from "./components/ui/button";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { WebLLMProvider } from "./lib/webllm/WebLLMContext";
import { useWebLLM } from "./lib/webllm/useWebLLM";

const themeStorageKey = "ask-david-theme";

const getPreferredTheme = () => {
  const storedTheme = window.localStorage.getItem(themeStorageKey);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AskDavid />,
  },
]);

const AppShell = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    getPreferredTheme(),
  );
  const { disableWebLLM, initializeWebLLM, webLLM } = useWebLLM();

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const brainStatus: BrainStatus =
    webLLM.state === "inactive"
      ? "inactive"
      : webLLM.state === "success"
        ? "success"
        : webLLM.state === "error"
          ? "error"
          : "loading";

  const progressLabel =
    webLLM.state === "loading"
      ? `${Math.round(webLLM.progress * 100)}%`
      : undefined;

  const brainLabel =
    webLLM.state === "inactive"
      ? `${webLLM.message} (${webLLM.modelId}). Click to enable.`
      : webLLM.state === "success"
        ? `${webLLM.message} (${webLLM.modelId}). Click to disable.`
        : `${webLLM.message} (${webLLM.modelId})`;

  return (
    <>
      <BrainStatusIcon
        label={brainLabel}
        onClick={
          webLLM.state === "inactive"
            ? () => {
                void initializeWebLLM();
              }
            : webLLM.state === "success"
              ? () => {
                  void disableWebLLM();
                }
            : undefined
        }
        progressLabel={progressLabel}
        status={brainStatus}
      />
      <Button
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="fixed right-4 top-4 z-50 h-11 w-11 rounded-full border border-border bg-card/90 p-0 text-foreground shadow-lg backdrop-blur hover:bg-accent/20 sm:right-6 sm:top-6"
        variant="outline"
        onClick={() => {
          setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark",
          );
        }}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
      <main className="container flex min-h-dvh flex-col py-4 pt-16 sm:py-8 sm:pt-8">
        <RouterProvider router={router} />
      </main>
    </>
  );
};

function App() {
  return (
    <WebLLMProvider>
      <AppShell />
    </WebLLMProvider>
  );
}

export default App;
