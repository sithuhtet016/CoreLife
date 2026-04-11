export type LifeArea = {
  id: number;
  name: string;
};

export type Question = {
  id: number;
  life_area_id: number;
  text: string;
  order_index: number;
};

export type AssessmentSession = {
  id: string;
  user_id: string;
  status: "in_progress" | "completed";
  started_at: string;
  completed_at: string | null;
  overall_score: number | null;
  area_scores: Record<number, number>;
};

export type AnswerInput = {
  question_id: number;
  score: number;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  life_area_id: number;
  frequency: "daily" | "weekly";
  created_at: string;
  streak: number;
  weekly_consistency: number;
};

export type ComparisonRow = {
  life_area_id: number;
  life_area_name: string;
  previous_score: number;
  latest_score: number;
  change: number;
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  promo_email_opt_in: boolean;
  promo_email_opt_in_at: string | null;
  created_at: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
