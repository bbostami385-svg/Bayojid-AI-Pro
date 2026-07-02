import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage";

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with all required fields", () => {
    render(<LoginPage />);

    expect(screen.getByText("Bayojid AI")).toBeInTheDocument();
    expect(screen.getByText("Welcome back to your AI workspace")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByText("Remember me")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows error when email or password is empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
    });
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: "" }).parentElement?.querySelector("button");

    expect(passwordInput.type).toBe("password");

    // Click to show password
    if (toggleButton) {
      await user.click(toggleButton);
      await waitFor(() => {
        expect(passwordInput.type).toBe("text");
      });
    }
  });

  it("updates email and password input values", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("handles remember me checkbox", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const rememberCheckbox = screen.getByRole("checkbox");
    expect(rememberCheckbox).not.toBeChecked();

    await user.click(rememberCheckbox);
    expect(rememberCheckbox).toBeChecked();
  });

  it("displays forgot password link", () => {
    render(<LoginPage />);
    const forgotLink = screen.getByText("Forgot password?");
    expect(forgotLink).toBeInTheDocument();
  });

  it("displays signup link", () => {
    render(<LoginPage />);
    const signupLink = screen.getByText("Sign up");
    expect(signupLink).toBeInTheDocument();
  });

  it("displays OAuth buttons", () => {
    render(<LoginPage />);
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("disables form during submission", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });
});
