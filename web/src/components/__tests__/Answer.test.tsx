import { render, screen, act } from "@testing-library/react";
import Answer from "../Answer";

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
    vi.advanceTimersByTime(300 * 10);
  });

  expect(screen.getByTestId("answer")).toHaveTextContent(/^Eat|Drink|...$/);
});
