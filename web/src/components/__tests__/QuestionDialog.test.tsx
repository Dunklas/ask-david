import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import QuestionDialog from "../QuestionDialog";

it("should call onClose", async () => {
  const onClose = vi.fn();
  render(<QuestionDialog onClose={onClose} onSubmit={() => {}} />);

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onClose).toHaveBeenCalledOnce();
});

it("should call onSubmit", async () => {
  const onSubmit = vi.fn();
  render(<QuestionDialog onClose={() => {}} onSubmit={onSubmit} />);

  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/question/i), "What is best in life?");
  await user.type(screen.getByLabelText(/option 1/i), "Crush your enemies");
  await user.type(
    screen.getByLabelText(/option 2/i),
    "See them driven before you",
  );
  await user.click(screen.getByRole("button", { name: "add option" }));
  await user.type(
    screen.getByLabelText(/option 3/i),
    "And hear the lamentation of their women",
  );
  await user.click(screen.getByRole("checkbox", { name: "Use force" }));
  expect(screen.getByRole("button", { name: "Ask" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "Ask" }));

  expect(onSubmit).toHaveBeenCalledWith({
    question: "What is best in life?",
    options: [
      "Crush your enemies",
      "See them driven before you",
      "And hear the lamentation of their women",
    ],
    force: true,
  });
});
