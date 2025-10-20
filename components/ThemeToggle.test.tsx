import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";

// Mock the useTheme hook from next-themes
vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

describe("ThemeToggle", () => {
  it('should render moon icon and call setTheme with "dark" when in light mode', () => {
    // Arrange: Set up the mock to return the light theme state
    (useTheme as vi.Mock).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
    });
    const { setTheme } = useTheme();

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();

    // Assert: The moon icon should be visible
    const moonIcon = document.querySelector(".lucide-moon");
    expect(moonIcon).toBeInTheDocument();

    // Act: Simulate a user click
    fireEvent.click(button);

    // Assert: setTheme should have been called to switch to dark mode
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it('should render sun icon and call setTheme with "light" when in dark mode', () => {
    // Arrange: Set up the mock to return the dark theme state
    (useTheme as vi.Mock).mockReturnValue({
      theme: "dark",
      setTheme: vi.fn(),
    });
    const { setTheme } = useTheme();

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();

    // Assert: The sun icon should be visible
    const sunIcon = document.querySelector(".lucide-sun");
    expect(sunIcon).toBeInTheDocument();

    // Act: Simulate a user click
    fireEvent.click(button);

    // Assert: setTheme should have been called to switch to light mode
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("should not render the button on the server (when not mounted)", () => {
    // Arrange: Set up the mock to simulate the initial server-side render
    (useTheme as vi.Mock).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
    });

    // By default, the component returns a placeholder div before mounting.
    const { container } = render(<ThemeToggle />);

    // Assert: The placeholder div should be empty, and the button should not be there.
    expect(container.firstChild).not.toBeNull();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
