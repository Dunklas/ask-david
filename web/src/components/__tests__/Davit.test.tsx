import { render, screen } from "@testing-library/react";
import David from "../David";

it("should show David", () => {
  render(<David />);

  expect(screen.getByTestId("david")).toBeVisible();
});
