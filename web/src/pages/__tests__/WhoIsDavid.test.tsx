import { render, screen } from "@testing-library/react";
import WhoIsDavid from "../WhoIsDavid";

test("should display description of David", () => {
  render(<WhoIsDavid />);
  expect(screen.getByText(/^David is truly an awesome guy/)).toBeVisible();
  expect(
    screen.getByText(
      /^However, David faces a challenge that many of us encounter: decision making./,
    ),
  ).toBeVisible();
  expect(
    screen.getByText(/^This website is dedicated to helping David/),
  ).toBeVisible();
});
