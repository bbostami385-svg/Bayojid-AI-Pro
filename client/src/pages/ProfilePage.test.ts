import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfilePage } from "./ProfilePage";

describe("ProfilePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile page with all tabs", () => {
    render(<ProfilePage />);

    expect(screen.getByText("Account Settings")).toBeInTheDocument();
    expect(screen.getByText("Manage your profile, security, and preferences")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /security/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /billing/i })).toBeInTheDocument();
  });

  it("displays user profile information in sidebar", () => {
    render(<ProfilePage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Email verified")).toBeInTheDocument();
    expect(screen.getByText("2FA enabled")).toBeInTheDocument();
  });

  it("renders profile tab with personal information", () => {
    render(<ProfilePage />);

    const profileTab = screen.getByRole("tab", { name: /profile/i });
    expect(profileTab).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
  });

  it("toggles edit mode for profile", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);

    // Check if Save and Cancel buttons appear
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("updates profile information", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    expect(firstNameInput.value).toBe("Jane");
  });

  it("renders security tab with password change", () => {
    render(<ProfilePage />);

    const securityTab = screen.getByRole("tab", { name: /security/i });
    securityTab.click();

    expect(screen.getByText("Change Password")).toBeInTheDocument();
    expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument();
  });

  it("renders notifications tab with preferences", () => {
    render(<ProfilePage />);

    const notificationsTab = screen.getByRole("tab", { name: /notifications/i });
    notificationsTab.click();

    expect(screen.getByText("Notification Preferences")).toBeInTheDocument();
    expect(screen.getByText("Email Notifications")).toBeInTheDocument();
    expect(screen.getByText("Push Notifications")).toBeInTheDocument();
  });

  it("renders billing tab with subscription info", () => {
    render(<ProfilePage />);

    const billingTab = screen.getByRole("tab", { name: /billing/i });
    billingTab.click();

    expect(screen.getByText("Billing & Subscription")).toBeInTheDocument();
    expect(screen.getByText("Current Plan: Pro")).toBeInTheDocument();
    expect(screen.getByText("Payment Method")).toBeInTheDocument();
  });

  it("displays billing history", () => {
    render(<ProfilePage />);

    const billingTab = screen.getByRole("tab", { name: /billing/i });
    billingTab.click();

    expect(screen.getByText("Billing History")).toBeInTheDocument();
    expect(screen.getByText("Dec 15, 2024")).toBeInTheDocument();
    expect(screen.getByText("$29.00")).toBeInTheDocument();
  });

  it("displays logout button", () => {
    render(<ProfilePage />);

    const logoutButton = screen.getByRole("button", { name: /sign out/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("handles password change submission", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    const securityTab = screen.getByRole("tab", { name: /security/i });
    await user.click(securityTab);

    const currentPasswordInput = screen.getByDisplayValue("") as HTMLInputElement;
    const updateButton = screen.getByRole("button", { name: /update password/i });

    expect(updateButton).toBeInTheDocument();
  });

  it("displays 2FA status as enabled", () => {
    render(<ProfilePage />);

    const securityTab = screen.getByRole("tab", { name: /security/i });
    securityTab.click();

    expect(screen.getByText("2FA is enabled")).toBeInTheDocument();
    expect(screen.getByText("Your account is protected with two-factor authentication")).toBeInTheDocument();
  });

  it("displays notification checkboxes", () => {
    render(<ProfilePage />);

    const notificationsTab = screen.getByRole("tab", { name: /notifications/i });
    notificationsTab.click();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("shows payment method details", () => {
    render(<ProfilePage />);

    const billingTab = screen.getByRole("tab", { name: /billing/i });
    billingTab.click();

    expect(screen.getByText("Visa ending in 4242")).toBeInTheDocument();
    expect(screen.getByText("Expires 12/25")).toBeInTheDocument();
  });
});
