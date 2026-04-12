import { render, screen } from "@testing-library/react";
import AskDavid from "../AskDavid";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../../lib/local-ai", () => ({
  canUseLocalAi: vi.fn(() => true),
  getLocalAiDiagnostics: vi.fn(() => ({
    status: "preparing",
    model: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    message:
      "I'm doing mental preparation to make decisions. It may take a while, and may consume about 376 MB of data.",
    serviceWorkerReady: true,
    serviceWorkerControlled: true,
  })),
  getLocalAiStatus: vi.fn(() => "preparing"),
  LOCAL_AI_PREPARATION_MESSAGE:
    "I'm doing mental preparation to make decisions. It may take a while, and may consume about 376 MB of data.",
  preloadLocalAi: vi.fn(() => new Promise(() => {})),
  subscribeToLocalAiDiagnostics: vi.fn(() => () => {}),
  subscribeToLocalAiStatus: vi.fn(() => () => {}),
}));

import {
  canUseLocalAi,
  getLocalAiDiagnostics,
  getLocalAiStatus,
  preloadLocalAi,
} from "../../lib/local-ai";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(canUseLocalAi).mockReturnValue(true);
  vi.mocked(getLocalAiDiagnostics).mockReturnValue({
    status: "preparing",
    model: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    message:
      "I'm doing mental preparation to make decisions. It may take a while, and may consume about 376 MB of data.",
    serviceWorkerReady: true,
    serviceWorkerControlled: true,
  });
  vi.mocked(getLocalAiStatus).mockReturnValue("preparing");
  vi.mocked(preloadLocalAi).mockImplementation(() => new Promise(() => {}));
});

test('should show question dialog when clicking "ask something"', async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AskDavid />} />
      </Routes>
    </MemoryRouter>,
  );
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: "Ask something" }));
  expect(screen.getByTestId("question-dialog")).toBeVisible();
});

test("should show subtle ai indicator while local ai prepares", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AskDavid />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(preloadLocalAi).toHaveBeenCalled();
  expect(screen.getByTestId("local-ai-indicator")).toBeVisible();
  expect(screen.getByText(/mental preparation/i)).toBeVisible();
});

test("should show crossed brain icon when local ai is unsupported", () => {
  vi.mocked(canUseLocalAi).mockReturnValue(false);
  vi.mocked(getLocalAiDiagnostics).mockReturnValue({
    status: "unsupported",
    model: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    error: "Local AI needs WebGPU support in this browser/device.",
    serviceWorkerReady: false,
    serviceWorkerControlled: false,
  });
  vi.mocked(getLocalAiStatus).mockReturnValue("unsupported");

  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AskDavid />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(preloadLocalAi).not.toHaveBeenCalled();
  expect(screen.getByTestId("local-ai-indicator")).toBeVisible();
  expect(screen.getByLabelText("Local AI unavailable")).toBeVisible();
});

test("should show crossed brain icon when local ai init fails", () => {
  vi.mocked(getLocalAiDiagnostics).mockReturnValue({
    status: "error",
    model: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    error: "No available adapters.",
    serviceWorkerReady: true,
    serviceWorkerControlled: false,
  });
  vi.mocked(getLocalAiStatus).mockReturnValue("error");

  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AskDavid />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByTestId("local-ai-indicator")).toBeVisible();
  expect(screen.getByLabelText("Local AI unavailable")).toBeVisible();
});

test("should open local ai diagnostics popover when clicking brain icon", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AskDavid />} />
      </Routes>
    </MemoryRouter>,
  );

  const user = userEvent.setup();

  await user.click(screen.getByTestId("local-ai-indicator"));

  expect(screen.getByTestId("local-ai-popover")).toBeVisible();
  expect(screen.getByText(/smollm2-360m-instruct-q4f16_1-mlc/i)).toBeVisible();
  expect(screen.getByText(/status: preparing/i)).toBeVisible();
  expect(screen.getByText(/service worker ready: yes/i)).toBeVisible();
});

test("should toggle david description panel", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AskDavid />} />
      </Routes>
    </MemoryRouter>,
  );

  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: /who is this guy\?/i }));
  expect(screen.getByTestId("who-is-david-panel")).toBeVisible();
  expect(screen.getByText(/^David is an awesome guy/)).toBeVisible();

  await user.click(screen.getByRole("button", { name: /who is this guy\?/i }));
  expect(screen.queryByTestId("who-is-david-panel")).not.toBeInTheDocument();
});
