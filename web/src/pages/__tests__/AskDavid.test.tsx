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

test("should redirect to david description", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AskDavid />} />
        <Route path="/who" element={<div>Who is David</div>} />
      </Routes>
    </MemoryRouter>,
  );

  const user = userEvent.setup();

  await user.click(screen.getByText("Who is this guy?"));
  expect(screen.getByText("Who is David")).toBeVisible();
});
