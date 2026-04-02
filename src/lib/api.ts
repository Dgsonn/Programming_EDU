// Dev: frontend (5173) và backend (5000) chạy riêng → cần URL đầy đủ
// Production: cùng origin → chỉ cần path tương đối
const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:5000/api";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return body as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  language: string;
  avatar_seed: string;
  streak_days: number;
  hours_today: number;
  certificates_count: number;
}

export interface UserStats {
  courses_enrolled: number;
  hours_today: number;
  streak_days: number;
  certificates_count: number;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  level: string;
  duration: string;
  students: string;
  rating: number;
  lessons: number;
  color: string;
  accent_color: string;
  tag: string;
  enrolled: boolean;
  progress: number;
}

export interface EnrolledCourse {
  course_id: string;
  title: string;
  subtitle: string;
  color: string;
  accent_color: string;
  progress: number;
  time_spent_hours: number;
  completed_lessons: number;
  total_lessons: number;
  duration: string;
  last_lesson: string;
  next_lesson: string;
}

export type NotificationSettings = Record<string, boolean>;

// key: "roadmap_id:item_id", value: status
export type RoadmapProgress = Record<string, "completed" | "in-progress" | "not-started">;

// ─── API methods ──────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: UserProfile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => request<UserProfile>("/auth/me"),

  // User
  getProfile: () => request<UserProfile>("/user/profile"),

  updateProfile: (data: Partial<UserProfile>) =>
    request<UserProfile>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getStats: () => request<UserStats>("/user/stats"),

  getNotifications: () => request<NotificationSettings>("/user/notifications"),

  updateNotifications: (data: NotificationSettings) =>
    request<NotificationSettings>("/user/notifications", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (current_password: string, new_password: string) =>
    request<{ message: string }>("/user/change-password", {
      method: "PUT",
      body: JSON.stringify({ current_password, new_password }),
    }),

  // Courses
  getCourses: () => request<Course[]>("/courses"),

  enrollCourse: (courseId: string) =>
    request<{ message: string }>(`/courses/${courseId}/enroll`, { method: "POST" }),

  // Progress
  getProgress: () => request<EnrolledCourse[]>("/progress"),

  // Roadmap
  getRoadmapProgress: () => request<RoadmapProgress>("/roadmap/progress"),

  updateRoadmapItem: (roadmapId: string, itemId: string, status: string) =>
    request(`/roadmap/${roadmapId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
