// User Types
export type UserRole = "student" | "teacher" | "admin";
export type UserStatus = "active" | "inactive" | "banned";

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  total_questions: number;
  total_study_time: number;
  created_at: Date;
  updated_at: Date;
}

// Authentication
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, "password_hash">;
  error?: string;
}

// Consultation Types
export interface Consultation {
  id: string;
  student_id: string;
  question: string;
  ai_response: string;
  status: "pending" | "completed" | "reviewed";
  created_at: Date;
  updated_at: Date;
}

export interface ConsultationHistory {
  id: string;
  consultation_id: string;
  student_id: string;
  question_text: string;
  response_text: string;
  created_at: Date;
}

// Content Types
export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Analytics Types
export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  total_consultations: number;
  average_response_time: number;
}

export interface StudentProgress {
  student_id: string;
  total_questions_asked: number;
  avg_satisfaction: number;
  learning_time_hours: number;
  last_consultation_date: Date;
  progress_percentage: number;
}

// AI Configuration
export interface AIConfig {
  id: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  created_at: Date;
  updated_at: Date;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
