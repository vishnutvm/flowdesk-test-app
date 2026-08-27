import { describe, it, expect, beforeEach } from "vitest";
import { validatePassword, useFlowDeskStore } from "@/lib/store";
import { canManageTeam, canManageBilling, canEditContent } from "@/lib/permissions";
import { seedProjects, seedTasks, seedCustomers } from "@/lib/seed-data";

beforeEach(() => {
  useFlowDeskStore.setState({
    projects: seedProjects,
    tasks: seedTasks,
    customers: seedCustomers,
  });
});

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

describe("project creation validation", () => {
  it("rejects a project name shorter than 3 characters", () => {
    const result = useFlowDeskStore.getState().createProject({ name: "Ab", description: "", status: "Planning", dueDate: "2026-12-01" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/at least 3 characters/i);
  });

  it("rejects a missing due date", () => {
    const result = useFlowDeskStore.getState().createProject({ name: "Valid Name", description: "", status: "Planning", dueDate: "" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/due date/i);
  });

  it("creates a valid project and prepends it to the list", () => {
    const before = useFlowDeskStore.getState().projects.length;
    const result = useFlowDeskStore.getState().createProject({ name: "New Project", description: "desc", status: "Active", dueDate: "2026-12-01" });
    expect(result.ok).toBe(true);
    const after = useFlowDeskStore.getState().projects;
    expect(after.length).toBe(before + 1);
    expect(after[0].name).toBe("New Project");
  });
});

describe("task status transitions", () => {
  it("rejects a task without a title", () => {
    const result = useFlowDeskStore.getState().createTask({
      projectId: "proj-1",
      title: "",
      description: "",
      status: "Todo",
      priority: "Medium",
      assigneeId: null,
      dueDate: "2026-12-01",
    });
    expect(result.ok).toBe(false);
  });

  it("moves a task from Todo through to Completed", () => {
    const taskId = "task-4"; // seeded as Todo
    useFlowDeskStore.getState().updateTask(taskId, { status: "In Progress" });
    expect(useFlowDeskStore.getState().tasks.find((t) => t.id === taskId)?.status).toBe("In Progress");

    useFlowDeskStore.getState().updateTask(taskId, { status: "Review" });
    expect(useFlowDeskStore.getState().tasks.find((t) => t.id === taskId)?.status).toBe("Review");

    useFlowDeskStore.getState().updateTask(taskId, { status: "Completed" });
    expect(useFlowDeskStore.getState().tasks.find((t) => t.id === taskId)?.status).toBe("Completed");
  });

  it("allows moving a Completed task back to In Progress", () => {
    const taskId = "task-1"; // seeded as Completed
    useFlowDeskStore.getState().updateTask(taskId, { status: "In Progress" });
    expect(useFlowDeskStore.getState().tasks.find((t) => t.id === taskId)?.status).toBe("In Progress");
  });
});

describe("customer form validation", () => {
  it("rejects an invalid email address", () => {
    const result = useFlowDeskStore.getState().createCustomer({ name: "Test", company: "Acme", email: "not-valid", status: "Lead" });
    expect(result.ok).toBe(false);
  });

  it("creates a valid customer", () => {
    const result = useFlowDeskStore.getState().createCustomer({ name: "Test Customer", company: "Acme", email: "test@acme.com", status: "Lead" });
    expect(result.ok).toBe(true);
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
