"use client";

// Single client-side store for FlowDesk's session + data layer.
//
// Auth/session (isAuthenticated, sessionToken, currentUser, registeredAccounts,
// sessionExpired, simulatedRole, simulateSaveFailure) stays fully mocked and
// localStorage-persisted, exactly as before — there is still no real backend,
// database, or auth provider for any of that.
//
// Everything else (organization, team members, projects, tasks, customers,
// notifications, invoices, api keys, webhooks, login history, active
// sessions, integrations, notification prefs) is now backed by MongoDB via
// the app/api/** route handlers. Mutating actions call the API, then refetch
// the affected resource(s) so the store always reflects the server's state —
// simple, and correct by construction, at the cost of an extra round trip
// per mutation (acceptable at this app's scale).
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_EMAIL, DEMO_PASSWORD, seedUser } from "./seed-data";
import { apiRequest } from "./api-client";
import { isValidEmail, validatePassword, validateProjectInput, validateTaskInput, validateCustomerInput, validateWebhookUrl } from "./validators";
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

export { validatePassword };

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface RegisteredAccount {
  email: string;
  password: string;
  name: string;
}

const EMPTY_ORGANIZATION: Organization = { id: "", name: "", plan: "Free", billingCycle: "Monthly" };
const EMPTY_INTEGRATIONS: IntegrationState = { slack: false, googleCalendar: false };
const EMPTY_NOTIFICATION_PREFS: NotificationPrefs = { email: false, push: false, taskUpdates: false, weeklyReport: false };

interface FlowDeskState {
  // auth (mocked, unchanged)
  isAuthenticated: boolean;
  sessionToken: string | null;
  currentUser: User | null;
  registeredAccounts: RegisteredAccount[];
  sessionExpired: boolean;
  // Lets the demo account simulate a different role (Owner/Admin/Member/Viewer)
  // so restricted-action / permission-denied UI states are reachable for testing,
  // without needing multiple real accounts.
  simulatedRole: Role;

  // org-scoped data (backed by MongoDB)
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

  // data loading lifecycle
  dataLoading: boolean;
  dataLoaded: boolean;
  dataError: string | null;
  initData: () => Promise<void>;

  // auth actions
  login: (email: string, password: string) => AuthResult;
  signup: (name: string, email: string, password: string) => AuthResult;
  logout: () => void;
  requestPasswordReset: (email: string) => AuthResult;
  resetPassword: (email: string, newPassword: string) => AuthResult;
  expireSession: () => void;
  clearSessionExpired: () => void;

  // profile / security (mocked, unchanged)
  updateProfile: (data: Partial<Pick<User, "name" | "email" | "avatarUrl" | "timezone">>) => AuthResult;
  changePassword: (current: string, next: string) => AuthResult;
  toggle2FA: (enabled: boolean) => void;
  revokeSession: (id: string) => Promise<void>;

  // notifications settings
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => Promise<void>;

  // billing
  changePlan: (plan: Organization["plan"]) => Promise<void>;

  // team
  inviteMember: (email: string, role: Role) => Promise<AuthResult>;
  removeMember: (id: string) => Promise<void>;
  changeMemberRole: (id: string, role: Role) => Promise<void>;

  // projects
  createProject: (data: { name: string; description: string; status: ProjectStatus; dueDate: string }) => Promise<AuthResult>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // tasks
  createTask: (data: { projectId: string; title: string; description: string; status: TaskStatus; priority: TaskPriority; assigneeId: string | null; dueDate: string }) => Promise<AuthResult>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // customers
  createCustomer: (data: { name: string; company: string; email: string; status: Customer["status"] }) => Promise<AuthResult>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // notifications feed
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // integrations
  toggleIntegration: (key: keyof IntegrationState, value: boolean) => Promise<void>;
  generateApiKey: (name: string) => Promise<string | null>;
  revokeApiKey: (id: string) => Promise<void>;
  addWebhook: (url: string, events: string[]) => Promise<AuthResult>;
  removeWebhook: (id: string) => Promise<void>;

  // dev/testing helper
  setSimulateSaveFailure: (value: boolean) => void;
  setSimulatedRole: (role: Role) => void;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;
}

export const useFlowDeskStore = create<FlowDeskState>()(
  persist(
    (set, get) => {
      // --- Internal fetch helpers -------------------------------------
      // Each pulls one resource from the API and writes it into the store.
      // Used both by initData() (initial load) and by mutating actions
      // (refetch-after-mutation).
      async function fetchOrganization() {
        const result = await apiRequest<Organization>("/api/organization");
        if (result.ok) set({ organization: result.data });
        return result;
      }
      async function fetchTeamMembers() {
        const result = await apiRequest<TeamMember[]>("/api/team-members");
        if (result.ok) set({ teamMembers: result.data });
        return result;
      }
      async function fetchProjects() {
        const result = await apiRequest<Project[]>("/api/projects");
        if (result.ok) set({ projects: result.data });
        return result;
      }
      async function fetchTasks() {
        const result = await apiRequest<Task[]>("/api/tasks");
        if (result.ok) set({ tasks: result.data });
        return result;
      }
      async function fetchCustomers() {
        const result = await apiRequest<Customer[]>("/api/customers");
        if (result.ok) set({ customers: result.data });
        return result;
      }
      async function fetchNotifications() {
        const result = await apiRequest<AppNotification[]>("/api/notifications");
        if (result.ok) set({ notifications: result.data });
        return result;
      }
      async function fetchInvoices() {
        const result = await apiRequest<Invoice[]>("/api/invoices");
        if (result.ok) set({ invoices: result.data });
        return result;
      }
      async function fetchApiKeys() {
        const result = await apiRequest<ApiKey[]>("/api/api-keys");
        if (result.ok) set({ apiKeys: result.data });
        return result;
      }
      async function fetchWebhooks() {
        const result = await apiRequest<Webhook[]>("/api/webhooks");
        if (result.ok) set({ webhooks: result.data });
        return result;
      }
      async function fetchLoginHistory() {
        const result = await apiRequest<LoginHistoryEntry[]>("/api/login-history");
        if (result.ok) set({ loginHistory: result.data });
        return result;
      }
      async function fetchActiveSessions() {
        const result = await apiRequest<ActiveSession[]>("/api/active-sessions");
        if (result.ok) set({ activeSessions: result.data });
        return result;
      }
      async function fetchIntegrations() {
        const result = await apiRequest<IntegrationState>("/api/integrations");
        if (result.ok) set({ integrations: result.data });
        return result;
      }
      async function fetchNotificationPrefs() {
        const result = await apiRequest<NotificationPrefs>("/api/notification-prefs");
        if (result.ok) set({ notificationPrefs: result.data });
        return result;
      }

      return {
        isAuthenticated: false,
        sessionToken: null,
        currentUser: null,
        registeredAccounts: [],
        sessionExpired: false,
        simulatedRole: "Owner",

        organization: EMPTY_ORGANIZATION,
        teamMembers: [],
        projects: [],
        tasks: [],
        customers: [],
        notifications: [],
        invoices: [],
        apiKeys: [],
        webhooks: [],
        loginHistory: [],
        activeSessions: [],
        integrations: EMPTY_INTEGRATIONS,
        notificationPrefs: EMPTY_NOTIFICATION_PREFS,
        simulateSaveFailure: false,

        dataLoading: false,
        dataLoaded: false,
        dataError: null,
        initData: async () => {
          set({ dataLoading: true, dataError: null });
          const results = await Promise.all([
            fetchOrganization(),
            fetchTeamMembers(),
            fetchProjects(),
            fetchTasks(),
            fetchCustomers(),
            fetchNotifications(),
            fetchInvoices(),
            fetchApiKeys(),
            fetchWebhooks(),
            fetchLoginHistory(),
            fetchActiveSessions(),
            fetchIntegrations(),
            fetchNotificationPrefs(),
          ]);
          const failed = results.find((r) => !r.ok);
          if (failed && !failed.ok) {
            set({ dataLoading: false, dataError: failed.error });
            return;
          }
          set({ dataLoading: false, dataLoaded: true, dataError: null });
        },

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
        revokeSession: async (id) => {
          const result = await apiRequest("/api/active-sessions/" + id, { method: "DELETE" });
          if (result.ok) await fetchActiveSessions();
        },

        updateNotificationPrefs: async (prefs) => {
          const result = await apiRequest<NotificationPrefs>("/api/notification-prefs", {
            method: "PATCH",
            body: JSON.stringify(prefs),
          });
          if (result.ok) set({ notificationPrefs: result.data });
        },

        changePlan: async (plan) => {
          const result = await apiRequest<Organization>("/api/organization", {
            method: "PATCH",
            body: JSON.stringify({ plan }),
          });
          if (result.ok) set({ organization: result.data });
        },

        inviteMember: async (email, role) => {
          const result = await apiRequest<TeamMember>("/api/team-members", {
            method: "POST",
            body: JSON.stringify({ email, role }),
          });
          if (!result.ok) return { ok: false, error: result.error };
          await fetchTeamMembers();
          return { ok: true };
        },
        removeMember: async (id) => {
          const result = await apiRequest(`/api/team-members/${id}`, { method: "DELETE" });
          if (result.ok) await fetchTeamMembers();
        },
        changeMemberRole: async (id, role) => {
          const result = await apiRequest(`/api/team-members/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
          });
          if (result.ok) await fetchTeamMembers();
        },

        createProject: async (data) => {
          const clientError = validateProjectInput(data);
          if (clientError) return { ok: false, error: clientError };
          const result = await apiRequest<Project>("/api/projects", {
            method: "POST",
            body: JSON.stringify(data),
          });
          if (!result.ok) return { ok: false, error: result.error };
          await fetchProjects();
          return { ok: true };
        },
        updateProject: async (id, data) => {
          const result = await apiRequest(`/api/projects/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          if (result.ok) await fetchProjects();
        },
        deleteProject: async (id) => {
          const result = await apiRequest(`/api/projects/${id}`, { method: "DELETE" });
          if (result.ok) await Promise.all([fetchProjects(), fetchTasks()]);
        },

        createTask: async (data) => {
          const clientError = validateTaskInput(data);
          if (clientError) return { ok: false, error: clientError };
          const result = await apiRequest<Task>("/api/tasks", {
            method: "POST",
            body: JSON.stringify(data),
          });
          if (!result.ok) return { ok: false, error: result.error };
          await fetchTasks();
          return { ok: true };
        },
        updateTask: async (id, data) => {
          const result = await apiRequest(`/api/tasks/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          if (result.ok) await fetchTasks();
        },
        deleteTask: async (id) => {
          const result = await apiRequest(`/api/tasks/${id}`, { method: "DELETE" });
          if (result.ok) await fetchTasks();
        },

        createCustomer: async (data) => {
          const clientError = validateCustomerInput(data);
          if (clientError) return { ok: false, error: clientError };
          const result = await apiRequest<Customer>("/api/customers", {
            method: "POST",
            body: JSON.stringify(data),
          });
          if (!result.ok) return { ok: false, error: result.error };
          await fetchCustomers();
          return { ok: true };
        },
        updateCustomer: async (id, data) => {
          const result = await apiRequest(`/api/customers/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          if (result.ok) await fetchCustomers();
        },
        deleteCustomer: async (id) => {
          const result = await apiRequest(`/api/customers/${id}`, { method: "DELETE" });
          if (result.ok) await fetchCustomers();
        },

        markNotificationRead: async (id) => {
          const result = await apiRequest(`/api/notifications/${id}`, { method: "PATCH" });
          if (result.ok) await fetchNotifications();
        },
        markAllNotificationsRead: async () => {
          const result = await apiRequest<AppNotification[]>("/api/notifications", { method: "PATCH" });
          if (result.ok) set({ notifications: result.data });
        },

        toggleIntegration: async (key, value) => {
          const result = await apiRequest<IntegrationState>("/api/integrations", {
            method: "PATCH",
            body: JSON.stringify({ [key]: value }),
          });
          if (result.ok) set({ integrations: result.data });
        },
        generateApiKey: async (name) => {
          const result = await apiRequest<ApiKey & { rawKey: string }>("/api/api-keys", {
            method: "POST",
            body: JSON.stringify({ name }),
          });
          if (!result.ok) return null;
          await fetchApiKeys();
          return result.data.rawKey;
        },
        revokeApiKey: async (id) => {
          const result = await apiRequest(`/api/api-keys/${id}`, { method: "DELETE" });
          if (result.ok) await fetchApiKeys();
        },

        addWebhook: async (url, events) => {
          const clientError = validateWebhookUrl(url);
          if (clientError) return { ok: false, error: clientError };
          const result = await apiRequest<Webhook>("/api/webhooks", {
            method: "POST",
            body: JSON.stringify({ url, events }),
          });
          if (!result.ok) return { ok: false, error: result.error };
          await fetchWebhooks();
          return { ok: true };
        },
        removeWebhook: async (id) => {
          const result = await apiRequest(`/api/webhooks/${id}`, { method: "DELETE" });
          if (result.ok) await fetchWebhooks();
        },

        setSimulateSaveFailure: (value) => set({ simulateSaveFailure: value }),
        setSimulatedRole: (role) => set({ simulatedRole: role }),
      };
    },
    {
      name: "flowdesk-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        sessionToken: state.sessionToken,
        currentUser: state.currentUser,
        registeredAccounts: state.registeredAccounts,
        simulatedRole: state.simulatedRole,
      }),
    }
  )
);
