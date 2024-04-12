import { render, screen, act } from "@testing-library/react";
import Answer from "../Answer";

const tick = 300;

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
