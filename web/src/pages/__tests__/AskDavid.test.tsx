import { render, screen } from "@testing-library/react";
import AskDavid from "../AskDavid";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

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
