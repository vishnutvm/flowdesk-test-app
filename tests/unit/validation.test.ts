import { describe, it, expect } from "vitest";
import { validatePassword, useFlowDeskStore } from "@/lib/store";
import { canManageTeam, canManageBilling, canEditContent } from "@/lib/permissions";
import { validateProjectInput, validateTaskInput, validateCustomerInput, validateWebhookUrl, isValidEmail } from "@/lib/validators";

// Auth (login/signup/session) stays fully mocked in lib/store.ts and is
// untouched by the MongoDB migration, so those tests still exercise the
// store directly and synchronously, exactly as before.
describe("validatePassword", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePassword("Ab1!")).toMatch(/at least 8 characters/i);
  });

  it("rejects passwords missing an uppercase letter", () => {
    expect(validatePassword("abcdefg1!")).toMatch(/uppercase/i);
  });

  it("rejects passwords missing a lowercase letter", () => {
    expect(validatePassword("ABCDEFG1!")).toMatch(/lowercase/i);
  });

  it("rejects passwords missing a number", () => {
    expect(validatePassword("Abcdefgh!")).toMatch(/number/i);
  });

  it("rejects passwords missing a special character", () => {
    expect(validatePassword("Abcdefg1")).toMatch(/special character/i);
  });

  it("accepts a strong password", () => {
    expect(validatePassword("Demo@12345")).toBeNull();
  });
});

describe("login form validation", () => {
  it("rejects empty email or password", () => {
    const result = useFlowDeskStore.getState().login("", "");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  it("rejects an invalid email format", () => {
    const result = useFlowDeskStore.getState().login("not-an-email", "Demo@12345");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/valid email/i);
  });

  it("rejects an unknown account", () => {
    const result = useFlowDeskStore.getState().login("nobody@flowdesk.test", "Demo@12345");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/no account found/i);
  });

  it("rejects the wrong password for the demo account", () => {
    const result = useFlowDeskStore.getState().login("demo@flowdesk.test", "WrongPass1!");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/incorrect password/i);
  });

  it("logs in successfully with correct demo credentials", () => {
    const result = useFlowDeskStore.getState().login("demo@flowdesk.test", "Demo@12345");
    expect(result.ok).toBe(true);
    expect(useFlowDeskStore.getState().isAuthenticated).toBe(true);
    useFlowDeskStore.getState().logout();
  });
});

describe("signup form validation", () => {
  it("rejects a duplicate email (the seeded demo account)", () => {
    const result = useFlowDeskStore.getState().signup("Someone", "demo@flowdesk.test", "Abcdefg1!");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/already exists/i);
  });

  it("rejects a weak password", () => {
    const result = useFlowDeskStore.getState().signup("Someone", "someone@example.com", "weak");
    expect(result.ok).toBe(false);
  });

  it("accepts a valid new signup", () => {
    const result = useFlowDeskStore.getState().signup("New Person", `new-${Date.now()}@example.com`, "Abcdefg1!");
    expect(result.ok).toBe(true);
  });
});

// Project/task/customer/webhook validation used to live inline in
// lib/store.ts's create* actions. It now lives in lib/validators.ts and is
// shared by the app/api/** route handlers (server-side source of truth) and
// the store's client-side pre-flight check before hitting the network — so
// it's tested here directly, without a database or a running Next server.
describe("project creation validation", () => {
  it("rejects a project name shorter than 3 characters", () => {
    const error = validateProjectInput({ name: "Ab", description: "", status: "Planning", dueDate: "2026-12-01" });
    expect(error).toMatch(/at least 3 characters/i);
  });

  it("rejects a missing due date", () => {
    const error = validateProjectInput({ name: "Valid Name", description: "", status: "Planning", dueDate: "" });
    expect(error).toMatch(/due date/i);
  });

  it("rejects a missing name", () => {
    const error = validateProjectInput({ name: "   ", description: "", status: "Planning", dueDate: "2026-12-01" });
    expect(error).toMatch(/name is required/i);
  });

  it("accepts a valid project", () => {
    const error = validateProjectInput({ name: "New Project", description: "desc", status: "Active", dueDate: "2026-12-01" });
    expect(error).toBeNull();
  });
});

describe("task creation validation", () => {
  it("rejects a task without a title", () => {
    const error = validateTaskInput({ projectId: "proj-1", title: "", dueDate: "2026-12-01" });
    expect(error).toMatch(/title is required/i);
  });

  it("rejects a task without a project", () => {
    const error = validateTaskInput({ projectId: "", title: "Valid title", dueDate: "2026-12-01" });
    expect(error).toMatch(/select a project/i);
  });

  it("rejects a task without a due date", () => {
    const error = validateTaskInput({ projectId: "proj-1", title: "Valid title", dueDate: "" });
    expect(error).toMatch(/due date/i);
  });

  it("accepts a valid task", () => {
    const error = validateTaskInput({ projectId: "proj-1", title: "Valid title", dueDate: "2026-12-01" });
    expect(error).toBeNull();
  });
});

describe("customer form validation", () => {
  it("rejects an invalid email address", () => {
    const error = validateCustomerInput({ name: "Test", email: "not-valid" });
    expect(error).toMatch(/valid email/i);
  });

  it("rejects a missing name", () => {
    const error = validateCustomerInput({ name: "", email: "test@acme.com" });
    expect(error).toMatch(/name is required/i);
  });

  it("accepts a valid customer", () => {
    const error = validateCustomerInput({ name: "Test Customer", email: "test@acme.com" });
    expect(error).toBeNull();
  });
});

describe("webhook URL validation", () => {
  it("rejects a non-URL string", () => {
    expect(validateWebhookUrl("not a url")).toMatch(/valid webhook url/i);
  });

  it("rejects a non-http(s) protocol", () => {
    expect(validateWebhookUrl("ftp://example.com/hook")).toMatch(/valid webhook url/i);
  });

  it("accepts a valid https URL", () => {
    expect(validateWebhookUrl("https://example.com/webhook")).toBeNull();
  });
});

describe("isValidEmail", () => {
  it("rejects malformed addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("accepts well-formed addresses", () => {
    expect(isValidEmail("person@example.com")).toBe(true);
  });
});

describe("role permission checks", () => {
  it("only Owner and Admin can manage the team", () => {
    expect(canManageTeam("Owner")).toBe(true);
    expect(canManageTeam("Admin")).toBe(true);
    expect(canManageTeam("Member")).toBe(false);
    expect(canManageTeam("Viewer")).toBe(false);
  });

  it("only Owner and Admin can manage billing", () => {
    expect(canManageBilling("Owner")).toBe(true);
    expect(canManageBilling("Admin")).toBe(true);
    expect(canManageBilling("Member")).toBe(false);
    expect(canManageBilling("Viewer")).toBe(false);
  });

  it("Viewer cannot edit content, everyone else can", () => {
    expect(canEditContent("Viewer")).toBe(false);
    expect(canEditContent("Member")).toBe(true);
    expect(canEditContent("Admin")).toBe(true);
    expect(canEditContent("Owner")).toBe(true);
  });
});
