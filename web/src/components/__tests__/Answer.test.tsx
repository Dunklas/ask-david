import { act, render, screen } from "@testing-library/react";
import Answer from "../Answer";

const loadingDelay = 3000;

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

test('should keep showing spinner while "loading"', () => {
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
    vi.advanceTimersByTime(1500);
  });

  expect(screen.getByTestId("spinner")).toBeVisible();
});

test('should show answer after "loading"', async () => {
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

  await act(async () => {
    await vi.advanceTimersByTimeAsync(loadingDelay);
  });

  expect(screen.getByTestId("answer")).toHaveTextContent(/^Eat|Drink|...$/);
});
