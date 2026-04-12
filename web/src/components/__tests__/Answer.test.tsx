import { act, render, screen } from "@testing-library/react";
import { WebLLMContext } from "../../lib/webllm/context";
import Answer from "../Answer";

const loadingDelay = 3000;

const renderAnswer = () => {
  return render(
    <WebLLMContext.Provider
      value={{
        webLLM: {
          state: "inactive",
          message: "Local AI is offline",
          modelId: "test-model",
          engine: null,
        },
        initializeWebLLM: vi.fn().mockResolvedValue(undefined),
      }}
    >
      <Answer
        questionContext={{
          question: "What to do?",
          options: ["Eat", "Drink"],
          force: false,
        }}
        onBack={() => {}}
      />
    </WebLLMContext.Provider>,
  );
};

test("should start of by displaying a spinner", () => {
  renderAnswer();

  expect(screen.getByTestId("spinner")).toBeVisible();
});

test('should keep showing spinner while "loading"', () => {
  vi.useFakeTimers();
  renderAnswer();

  act(() => {
    vi.advanceTimersByTime(1500);
  });

  expect(screen.getByTestId("spinner")).toBeVisible();
});

test('should show answer after "loading"', async () => {
  vi.useFakeTimers();
  renderAnswer();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(loadingDelay);
  });

  expect(screen.getByTestId("answer")).toHaveTextContent(/^Eat|Drink|...$/);
});
