import { render, screen } from "@testing-library/react";
import CircularProgressWithLabel from "../CircularProgressWithLabel";

it("should show spinner", () => {
  render(<CircularProgressWithLabel value={1337} />);

  expect(screen.getByTestId("spinner")).toBeVisible();
  expect(screen.getByTestId("spinner-percentage")).toHaveTextContent(/^1337%$/);
});
