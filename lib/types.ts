// Core domain types for FlowDesk (mock SaaS test app).
// No real backend — these types describe the seeded, in-memory / localStorage-backed data model.

export type Role = "Owner" | "Admin" | "Member" | "Viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  timezone: string;
  role: Role;
}

export interface Organization {
  id: string;
  name: string;
  plan: "Free" | "Starter" | "Pro" | "Enterprise";
  billingCycle: "Monthly" | "Annual";
}

export type MemberStatus = "Active" | "Invited";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  status: MemberStatus;
  joinedAt: string; // ISO date
}

export type ProjectStatus = "Planning" | "Active" | "Completed" | "Archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  progress: number; // 0-100
  dueDate: string; // ISO date
  createdAt: string; // ISO date
}

export type TaskStatus = "Todo" | "In Progress" | "Review" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string; // ISO date
  createdAt: string; // ISO date
}

export type CustomerStatus = "Lead" | "Active" | "Churned";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  status: CustomerStatus;
  createdAt: string;
}

export type NotificationType = "task" | "project" | "team" | "billing" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: "Paid" | "Due";
}

export interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export interface LoginHistoryEntry {
  id: string;
  device: string;
  location: string;
  ip: string;
  at: string;
  success: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface IntegrationState {
  slack: boolean;
  googleCalendar: boolean;
}

export interface NotificationPrefs {
  email: boolean;
  push: boolean;
  taskUpdates: boolean;
  weeklyReport: boolean;
}
