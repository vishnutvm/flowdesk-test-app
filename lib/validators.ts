// Pure, framework-free validation functions shared between the API route
// handlers (server-side, source of truth) and unit tests. Kept separate from
// lib/store.ts so they can be tested without a network/DB and without
// touching auth/session logic, which stays mocked in the store.

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a special character.";
  return null;
}

export interface ProjectInput {
  name: string;
  description?: string;
  status: string;
  dueDate: string;
}

export function validateProjectInput(data: ProjectInput): string | null {
  if (!data.name || !data.name.trim()) return "Project name is required.";
  if (data.name.trim().length < 3) return "Project name must be at least 3 characters.";
  if (!data.dueDate) return "Due date is required.";
  return null;
}

export interface TaskInput {
  projectId: string;
  title: string;
  dueDate: string;
}

export function validateTaskInput(data: TaskInput): string | null {
  if (!data.title || !data.title.trim()) return "Task title is required.";
  if (!data.projectId) return "Select a project for this task.";
  if (!data.dueDate) return "Due date is required.";
  return null;
}

export interface CustomerInput {
  name: string;
  email: string;
}

export function validateCustomerInput(data: CustomerInput): string | null {
  if (!data.name || !data.name.trim()) return "Customer name is required.";
  if (!isValidEmail(data.email)) return "Enter a valid email address.";
  return null;
}

export function validateInviteInput(email: string): string | null {
  if (!isValidEmail(email)) return "Enter a valid email address.";
  return null;
}

export function validateWebhookUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith("http")) throw new Error("invalid protocol");
    return null;
  } catch {
    return "Enter a valid webhook URL (must start with http:// or https://).";
  }
}
