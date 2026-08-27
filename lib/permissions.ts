import type { Role } from "./types";

// Simple role-based permission checks used across the app. Business rule:
// Owner/Admin can manage team, billing and settings; Member can create/edit
// projects, tasks and customers; Viewer is read-only everywhere.
export function canManageTeam(role: Role): boolean {
  return role === "Owner" || role === "Admin";
}

export function canManageBilling(role: Role): boolean {
  return role === "Owner" || role === "Admin";
}

export function canEditContent(role: Role): boolean {
  return role !== "Viewer";
}
