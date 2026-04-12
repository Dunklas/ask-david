import { render, screen, act } from "@testing-library/react";
import Answer from "../Answer";

vi.mock("../../lib/local-ai", () => ({
  getLocalAiStatus: vi.fn(() => "ready"),
  generateLocalAiAnswer: vi.fn(),
  subscribeToLocalAiStatus: vi.fn(() => () => {}),
}));

import { getLocalAiStatus, generateLocalAiAnswer } from "../../lib/local-ai";

const tick = 300;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getLocalAiStatus).mockReturnValue("ready");
});

test("should start of by displaying a spinner", () => {
  render(
    <Answer
      questionContext={{
        question: "What to do?",
        options: ["Eat", "Drink"],
        force: false,
      }}
      onBack={() => {}}
    />,
  );

  expect(screen.getByTestId("spinner")).toBeVisible();
});

test('should "load" answer', () => {
  vi.useFakeTimers();
  render(
    <Answer
      questionContext={{
        question: "What to do?",
        options: ["Eat", "Drink"],
        force: false,
      }}
      onBack={() => {}}
    />,
  );

  act(() => {
    vi.advanceTimersByTime(tick);
  });
  expect(screen.getByTestId("spinner-percentage")).toHaveTextContent(/^10%$/);

  act(() => {
    vi.advanceTimersByTime(tick);
  });
  expect(screen.getByTestId("spinner-percentage")).toHaveTextContent(/^20%$/);
});

test('should show answer after "loading"', async () => {
  vi.useFakeTimers();
  vi.mocked(getLocalAiStatus).mockReturnValue("unsupported");

  render(
    <Answer
      questionContext={{
        question: "What to do?",
        options: ["Eat", "Drink"],
        force: false,
      }}
      onBack={() => {}}
    />,
  );

  act(() => {
    vi.advanceTimersByTime(tick * 10);
  });

  expect(screen.getByTestId("answer")).toHaveTextContent(/^Eat|Drink|...$/);
});

test("should show ai preparation text while local ai responds", async () => {
  vi.useFakeTimers();
  vi.mocked(generateLocalAiAnswer).mockReturnValue(new Promise(() => {}));

  render(
    <Answer
      questionContext={{
        question: "What to do?",
        options: ["Eat", "Drink"],
        force: false,
      }}
      onBack={() => {}}
    />,
  );

  act(() => {
    vi.advanceTimersByTime(tick * 10);
  });

  expect(screen.getByTestId("ai-status")).toHaveTextContent(
    /david is thinking/i,
  );
});

test("should show ai-written answer when local ai is enabled", async () => {
  vi.useFakeTimers();
  vi.mocked(generateLocalAiAnswer).mockResolvedValue("Go with Eat.");

  render(
    <Answer
      questionContext={{
        question: "What to do?",
        options: ["Eat", "Drink"],
        force: false,
      }}
      onBack={() => {}}
    />,
  );

  await act(async () => {
    vi.advanceTimersByTime(tick * 10);
    await Promise.resolve();
  });

  expect(screen.getByTestId("answer")).toHaveTextContent("Go with Eat.");
});

test("should show why local ai failed before falling back", async () => {
  vi.useFakeTimers();
  vi.mocked(generateLocalAiAnswer).mockRejectedValue(
    new Error("WebGPU is not available"),
  );

  render(
    <Answer
      questionContext={{
        question: "What to do?",
        options: ["Eat", "Drink"],
        force: false,
      }}
      onBack={() => {}}
    />,
  );

  await act(async () => {
    vi.advanceTimersByTime(tick * 10);
    await Promise.resolve();
  });

  expect(screen.getByTestId("ai-error")).toHaveTextContent(
    /webgpu is not available/i,
  );
  expect(screen.getByTestId("answer")).toHaveTextContent(/^Eat|Drink|...$/);
});

test("should skip ai and show selected answer when ai is unsupported", () => {
  vi.useFakeTimers();
  vi.mocked(getLocalAiStatus).mockReturnValue("unsupported");

  render(
    <Answer
      questionContext={{
        question: "What to do?",
        options: ["Eat", "Drink"],
        force: false,
      }}
      onBack={() => {}}
    />,
  );

  act(() => {
    vi.advanceTimersByTime(tick * 10);
  });

  expect(generateLocalAiAnswer).not.toHaveBeenCalled();
  expect(screen.getByTestId("answer")).toHaveTextContent(/^Eat|Drink|...$/);
});
