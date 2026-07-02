import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupPage } from "./SignupPage";

describe("SignupPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form with all required fields", () => {
    render(<SignupPage />);

    expect(screen.getByText("Join Bayojid AI")).toBeInTheDocument();
    expect(screen.getByText("Create your account and start building with AI")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2);
  });

  it("shows error when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const submitButton = screen.getByRole("button", { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const firstNameInput = screen.getByPlaceholderText("John");
    const lastNameInput = screen.getByPlaceholderText("Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "password456");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("shows error when password is too short", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const firstNameInput = screen.getByPlaceholderText("John");
    const lastNameInput = screen.getByPlaceholderText("Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInputs[0], "pass");
    await user.type(passwordInputs[1], "pass");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
    });
  });

  it("shows error when terms are not agreed", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const firstNameInput = screen.getByPlaceholderText("John");
    const lastNameInput = screen.getByPlaceholderText("Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please agree to the terms and conditions")).toBeInTheDocument();
    });
  });

  it("displays password strength indicator", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const passwordInput = screen.getAllByPlaceholderText("••••••••")[0];

    await user.type(passwordInput, "weak");
    expect(screen.getByText(/password strength:/i)).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, "StrongPassword123!");
    expect(screen.getByText(/very strong/i)).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    expect(passwordInputs[0]).toHaveAttribute("type", "password");
  });

  it("displays terms and privacy links", () => {
    render(<SignupPage />);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("displays OAuth buttons", () => {
    render(<SignupPage />);
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("displays login link", () => {
    render(<SignupPage />);
    const loginLink = screen.getByText("Sign in");
    expect(loginLink).toBeInTheDocument();
  });

  it("disables submit button when terms are not agreed", () => {
    render(<SignupPage />);
    const submitButton = screen.getByRole("button", { name: /create account/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when terms are agreed", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: /create account/i });

    expect(submitButton).toBeDisabled();
    await user.click(termsCheckbox);
    expect(submitButton).not.toBeDisabled();
  });
});
