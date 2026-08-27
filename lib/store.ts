"use client";

// Single client-side store for FlowDesk's mocked session + data layer.
// Everything here is fake: there is no server, no database, no real auth provider.
// State is persisted to localStorage so a reload keeps the demo session and any
// mutations made during it. This file is intentionally the only place that
// "mutates data" — pages/components stay presentational and call these actions.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  seedUser,
  seedOrganization,
  seedTeamMembers,
  seedProjects,
  seedTasks,
  seedCustomers,
  seedNotifications,
  seedInvoices,
  seedApiKeys,
  seedWebhooks,
  seedLoginHistory,
  seedActiveSessions,
  seedIntegrations,
  seedNotificationPrefs,
} from "./seed-data";
import type {
  User,
  Organization,
  TeamMember,
  Project,
  Task,
  Customer,
  AppNotification,
  Invoice,
  ApiKey,
  Webhook,
  LoginHistoryEntry,
  ActiveSession,
  IntegrationState,
  NotificationPrefs,
  Role,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
} from "./types";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface RegisteredAccount {
  email: string;
  password: string;
  name: string;
}

interface FlowDeskState {
  // auth
  isAuthenticated: boolean;
  sessionToken: string | null;
  currentUser: User | null;
  registeredAccounts: RegisteredAccount[];
  sessionExpired: boolean;
  // Lets the demo account simulate a different role (Owner/Admin/Member/Viewer)
  // so restricted-action / permission-denied UI states are reachable for testing,
  // without needing multiple real accounts.
  simulatedRole: Role;

  // org-scoped data
  organization: Organization;
  teamMembers: TeamMember[];
  projects: Project[];
  tasks: Task[];
  customers: Customer[];
  notifications: AppNotification[];
  invoices: Invoice[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  loginHistory: LoginHistoryEntry[];
  activeSessions: ActiveSession[];
  integrations: IntegrationState;
  notificationPrefs: NotificationPrefs;
  simulateSaveFailure: boolean;

  // auth actions
  login: (email: string, password: string) => AuthResult;
  signup: (name: string, email: string, password: string) => AuthResult;
  logout: () => void;
  requestPasswordReset: (email: string) => AuthResult;
  resetPassword: (email: string, newPassword: string) => AuthResult;
  expireSession: () => void;
  clearSessionExpired: () => void;

  // profile / security
  updateProfile: (data: Partial<Pick<User, "name" | "email" | "avatarUrl" | "timezone">>) => AuthResult;
  changePassword: (current: string, next: string) => AuthResult;
  toggle2FA: (enabled: boolean) => void;
  revokeSession: (id: string) => void;

  // notifications settings
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;

  // billing
  changePlan: (plan: Organization["plan"]) => void;

  // team
  inviteMember: (email: string, role: Role) => AuthResult;
  removeMember: (id: string) => void;
  changeMemberRole: (id: string, role: Role) => void;

  // projects
  createProject: (data: { name: string; description: string; status: ProjectStatus; dueDate: string }) => AuthResult;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // tasks
  createTask: (data: { projectId: string; title: string; description: string; status: TaskStatus; priority: TaskPriority; assigneeId: string | null; dueDate: string }) => AuthResult;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // customers
  createCustomer: (data: { name: string; company: string; email: string; status: Customer["status"] }) => AuthResult;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // notifications feed
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // integrations
  toggleIntegration: (key: keyof IntegrationState, value: boolean) => void;
  generateApiKey: (name: string) => string;
  revokeApiKey: (id: string) => void;
  addWebhook: (url: string, events: string[]) => AuthResult;
  removeWebhook: (id: string) => void;

  // dev/testing helper
  setSimulateSaveFailure: (value: boolean) => void;
  setSimulatedRole: (role: Role) => void;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a special character.";
  return null;
}

export const useFlowDeskStore = create<FlowDeskState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      sessionToken: null,
      currentUser: null,
      registeredAccounts: [],
      sessionExpired: false,
      simulatedRole: "Owner",

      organization: seedOrganization,
      teamMembers: seedTeamMembers,
      projects: seedProjects,
      tasks: seedTasks,
      customers: seedCustomers,
      notifications: seedNotifications,
      invoices: seedInvoices,
      apiKeys: seedApiKeys,
      webhooks: seedWebhooks,
      loginHistory: seedLoginHistory,
      activeSessions: seedActiveSessions,
      integrations: seedIntegrations,
      notificationPrefs: seedNotificationPrefs,
      simulateSaveFailure: false,

      login: (email, password) => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
          return { ok: false, error: "Email and password are required." };
        }
        if (!isValidEmail(trimmedEmail)) {
          return { ok: false, error: "Enter a valid email address." };
        }
        const account = get().registeredAccounts.find((a) => a.email.toLowerCase() === trimmedEmail.toLowerCase());
        const isDemo = trimmedEmail.toLowerCase() === DEMO_EMAIL.toLowerCase();

        if (!account && !isDemo) {
          return { ok: false, error: "No account found with that email address." };
        }
        const expectedPassword = isDemo ? DEMO_PASSWORD : account!.password;
        if (password !== expectedPassword) {
          return { ok: false, error: "Incorrect password. Please try again." };
        }
        set({
          isAuthenticated: true,
          sessionToken: uid("token"),
          currentUser: isDemo ? seedUser : { ...seedUser, id: uid("user"), name: account!.name, email: account!.email },
          sessionExpired: false,
        });
        return { ok: true };
      },

      signup: (name, email, password) => {
        const trimmedEmail = email.trim();
        const trimmedName = name.trim();
        if (!trimmedName || !trimmedEmail || !password) {
          return { ok: false, error: "All fields are required." };
        }
        if (!isValidEmail(trimmedEmail)) {
          return { ok: false, error: "Enter a valid email address." };
        }
        const pwError = validatePassword(password);
        if (pwError) {
          return { ok: false, error: pwError };
        }
        const exists =
          trimmedEmail.toLowerCase() === DEMO_EMAIL.toLowerCase() ||
          get().registeredAccounts.some((a) => a.email.toLowerCase() === trimmedEmail.toLowerCase());
        if (exists) {
          return { ok: false, error: "An account with this email already exists." };
        }
        set({ registeredAccounts: [...get().registeredAccounts, { email: trimmedEmail, password, name: trimmedName }] });
        return { ok: true };
      },

      logout: () => set({ isAuthenticated: false, sessionToken: null, currentUser: null }),

      requestPasswordReset: (email) => {
        if (!isValidEmail(email.trim())) return { ok: false, error: "Enter a valid email address." };
        // Mocked: always succeeds silently (no real email is sent).
        return { ok: true };
      },

      resetPassword: (email, newPassword) => {
        const pwError = validatePassword(newPassword);
        if (pwError) return { ok: false, error: pwError };
        const trimmedEmail = email.trim().toLowerCase();
        if (trimmedEmail === DEMO_EMAIL.toLowerCase()) {
          // Demo account password reset is mocked and always reports success without persisting.
          return { ok: true };
        }
        const accounts = get().registeredAccounts;
        const idx = accounts.findIndex((a) => a.email.toLowerCase() === trimmedEmail);
        if (idx === -1) return { ok: false, error: "No account found with that email address." };
        const updated = [...accounts];
        updated[idx] = { ...updated[idx], password: newPassword };
        set({ registeredAccounts: updated });
        return { ok: true };
      },

      expireSession: () => set({ isAuthenticated: false, sessionToken: null, currentUser: null, sessionExpired: true }),
      clearSessionExpired: () => set({ sessionExpired: false }),

      updateProfile: (data) => {
        if (get().simulateSaveFailure) return { ok: false, error: "Could not save changes. Please try again." };
        const user = get().currentUser;
        if (!user) return { ok: false, error: "Not signed in." };
        if (data.email && !isValidEmail(data.email)) return { ok: false, error: "Enter a valid email address." };
        set({ currentUser: { ...user, ...data } });
        return { ok: true };
      },

      changePassword: (current, next) => {
        if (get().simulateSaveFailure) return { ok: false, error: "Could not save changes. Please try again." };
        if (current !== DEMO_PASSWORD) {
          const user = get().currentUser;
          const account = get().registeredAccounts.find((a) => a.email === user?.email);
          if (!account || account.password !== current) {
            return { ok: false, error: "Current password is incorrect." };
          }
        }
        const pwError = validatePassword(next);
        if (pwError) return { ok: false, error: pwError };
        return { ok: true };
      },

      toggle2FA: () => {},
      revokeSession: (id) => set({ activeSessions: get().activeSessions.filter((s) => s.id !== id) }),

      updateNotificationPrefs: (prefs) => set({ notificationPrefs: { ...get().notificationPrefs, ...prefs } }),

      changePlan: (plan) => set({ organization: { ...get().organization, plan } }),

      inviteMember: (email, role) => {
        if (!isValidEmail(email.trim())) return { ok: false, error: "Enter a valid email address." };
        if (get().teamMembers.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: "This person is already a team member." };
        }
        const newMember: TeamMember = {
          id: uid("user"),
          name: email.split("@")[0],
          email,
          role,
          avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=64748b`,
          status: "Invited",
          joinedAt: new Date().toISOString().slice(0, 10),
        };
        set({ teamMembers: [...get().teamMembers, newMember] });
        return { ok: true };
      },

      removeMember: (id) => set({ teamMembers: get().teamMembers.filter((m) => m.id !== id) }),
      changeMemberRole: (id, role) => set({ teamMembers: get().teamMembers.map((m) => (m.id === id ? { ...m, role } : m)) }),

      createProject: (data) => {
        if (!data.name.trim()) return { ok: false, error: "Project name is required." };
        if (data.name.trim().length < 3) return { ok: false, error: "Project name must be at least 3 characters." };
        if (!data.dueDate) return { ok: false, error: "Due date is required." };
        const project: Project = {
          id: uid("proj"),
          name: data.name.trim(),
          description: data.description.trim(),
          status: data.status,
          ownerId: get().currentUser?.id ?? "user-1",
          progress: 0,
          dueDate: data.dueDate,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set({ projects: [project, ...get().projects] });
        return { ok: true };
      },
      updateProject: (id, data) => set({ projects: get().projects.map((p) => (p.id === id ? { ...p, ...data } : p)) }),
      deleteProject: (id) =>
        set({
          projects: get().projects.filter((p) => p.id !== id),
          tasks: get().tasks.filter((t) => t.projectId !== id),
        }),

      createTask: (data) => {
        if (!data.title.trim()) return { ok: false, error: "Task title is required." };
        if (!data.projectId) return { ok: false, error: "Select a project for this task." };
        if (!data.dueDate) return { ok: false, error: "Due date is required." };
        const task: Task = {
          id: uid("task"),
          projectId: data.projectId,
          title: data.title.trim(),
          description: data.description.trim(),
          status: data.status,
          priority: data.priority,
          assigneeId: data.assigneeId,
          dueDate: data.dueDate,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set({ tasks: [task, ...get().tasks] });
        return { ok: true };
      },
      updateTask: (id, data) => set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) }),
      deleteTask: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),

      createCustomer: (data) => {
        if (!data.name.trim()) return { ok: false, error: "Customer name is required." };
        if (!isValidEmail(data.email)) return { ok: false, error: "Enter a valid email address." };
        const customer: Customer = {
          id: uid("cust"),
          name: data.name.trim(),
          company: data.company.trim(),
          email: data.email.trim(),
          status: data.status,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set({ customers: [customer, ...get().customers] });
        return { ok: true };
      },
      updateCustomer: (id, data) => set({ customers: get().customers.map((c) => (c.id === id ? { ...c, ...data } : c)) }),
      deleteCustomer: (id) => set({ customers: get().customers.filter((c) => c.id !== id) }),

      markNotificationRead: (id) => set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }),
      markAllNotificationsRead: () => set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

      toggleIntegration: (key, value) => set({ integrations: { ...get().integrations, [key]: value } }),
      generateApiKey: (name) => {
        const rawKey = `fd_live_${uid("key")}`;
        const key: ApiKey = {
          id: uid("key"),
          name: name.trim() || "Untitled key",
          maskedKey: `fd_live_••••••••••••${rawKey.slice(-4)}`,
          createdAt: new Date().toISOString().slice(0, 10),
          lastUsedAt: null,
        };
        set({ apiKeys: [key, ...get().apiKeys] });
        return rawKey;
      },
      revokeApiKey: (id) => set({ apiKeys: get().apiKeys.filter((k) => k.id !== id) }),

      addWebhook: (url, events) => {
        try {
          const parsed = new URL(url);
          if (!parsed.protocol.startsWith("http")) throw new Error();
        } catch {
          return { ok: false, error: "Enter a valid webhook URL (must start with http:// or https://)." };
        }
        const webhook: Webhook = { id: uid("wh"), url, events, active: true, createdAt: new Date().toISOString().slice(0, 10) };
        set({ webhooks: [...get().webhooks, webhook] });
        return { ok: true };
      },
      removeWebhook: (id) => set({ webhooks: get().webhooks.filter((w) => w.id !== id) }),

      setSimulateSaveFailure: (value) => set({ simulateSaveFailure: value }),
      setSimulatedRole: (role) => set({ simulatedRole: role }),
    }),
    {
      name: "flowdesk-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        sessionToken: state.sessionToken,
        currentUser: state.currentUser,
        registeredAccounts: state.registeredAccounts,
        simulatedRole: state.simulatedRole,
        organization: state.organization,
        teamMembers: state.teamMembers,
        projects: state.projects,
        tasks: state.tasks,
        customers: state.customers,
        notifications: state.notifications,
        apiKeys: state.apiKeys,
        webhooks: state.webhooks,
        activeSessions: state.activeSessions,
        integrations: state.integrations,
        notificationPrefs: state.notificationPrefs,
      }),
    }
  )
);
